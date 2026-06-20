import { uid } from "uid";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import db from "../../firebase-config";
import { trackImportCompleted } from "../analytics/analyticsService";
import { assertFirestoreSafePayload } from "../../utils/firestoreValidation";
import { COLLECTIONS } from "./constants";
import { fetchQuery } from "./firestoreHelpers";
import { getUserTeams, createTeam } from "./teamService";
import { getUserPlayers, createPlayer } from "./playerService";

const CHUNK_SIZE = 10;

const importDoc = (importId) => doc(db, COLLECTIONS.IMPORTS, importId);

// ─── Import record CRUD ───────────────────────────────────────────────────────

export const createImportRecord = async ({ fileName, importedBy }) => {
  const importId = uid();
  const importBatchId = uid();
  const payload = {
    importId,
    importBatchId,
    fileName,
    importedBy,
    importedAt: serverTimestamp(),
    status: "Draft",
    teamsCreated: 0,
    playersCreated: 0,
    warnings: [],
  };
  await setDoc(importDoc(importId), payload);
  return { importId, importBatchId };
};

export const updateImportRecord = async (importId, data) => {
  assertFirestoreSafePayload(data);
  await updateDoc(importDoc(importId), { ...data });
};

export const getImportHistory = async (uid) => {
  const q = query(
    collection(db, COLLECTIONS.IMPORTS),
    where("importedBy", "==", uid)
  );
  return fetchQuery(q);
};

// ─── Chunked write helper ─────────────────────────────────────────────────────

const chunked = (arr) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += CHUNK_SIZE) {
    chunks.push(arr.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
};

// ─── Main import execution ────────────────────────────────────────────────────

/**
 * Execute the import.
 * @param {object} params
 *   importId, importBatchId, teams (Map), players (array), createdBy (uid),
 *   teamConflict ("merge"|"skip"|"replace"),
 *   playerConflict ("update"|"skip"),
 *   onProgress (percent => void)
 */
export const executeImport = async ({
  importId,
  importBatchId,
  teams,
  players,
  createdBy,
  teamConflict = "merge",
  playerConflict = "update",
  onProgress,
}) => {
  // Mark as running immediately so a mid-run crash is detectable on re-open.
  // If this update itself fails, we throw before touching any teams/players.
  await updateImportRecord(importId, { status: "Running", startedAt: new Date() });

  try {
    return await _executeImportPhases({
      importId, importBatchId, teams, players, createdBy,
      teamConflict, playerConflict, onProgress,
    });
  } catch (err) {
    // Best-effort: persist Failed status so re-runs can detect the partial state
    // and the UI can offer rollback rather than silently creating duplicates.
    try {
      await updateImportRecord(importId, {
        status: "Failed",
        errorMessage: err?.message || "Import failed unexpectedly.",
        failedAt: new Date(),
      });
    } catch {
      // Secondary write failure — swallow so the original error propagates
    }
    throw err;
  }
};

// Internal: all phases. Separated so the outer function owns status lifecycle.
const _executeImportPhases = async ({
  importId, importBatchId, teams, players, createdBy,
  teamConflict, playerConflict, onProgress,
}) => {
  const existingTeams = await getUserTeams(createdBy);
  const existingPlayers = await getUserPlayers(createdBy);

  // Index existing data
  const teamByName = new Map(
    existingTeams.map((t) => [t.name.trim().toLowerCase(), t])
  );
  const playerByEmpId = new Map(
    existingPlayers
      .filter((p) => p.employeeId)
      .map((p) => [p.employeeId, p])
  );

  // Phase 1 — Team creation
  const teamRefMap = new Map(); // teamName → teamId
  const teamNames = [...teams.keys()];
  const teamChunks = chunked(teamNames);
  let teamsCreated = 0;

  for (let ci = 0; ci < teamChunks.length; ci++) {
    await Promise.all(
      teamChunks[ci].map(async (teamName) => {
        const key = teamName.trim().toLowerCase();
        const existing = teamByName.get(key);

        if (existing) {
          if (teamConflict === "skip") {
            teamRefMap.set(teamName, existing.teamId);
            return;
          }
          if (teamConflict === "replace") {
            // Replace: overwrite with empty player list; players added later
            await updateDoc(doc(db, COLLECTIONS.TEAMS, existing.teamId), {
              players: [],
              playerRefs: [],
              importBatchId,
              updatedAt: new Date(),
            });
            teamRefMap.set(teamName, existing.teamId);
            return;
          }
          // merge (default): keep existing players, tag with importBatchId
          await updateDoc(doc(db, COLLECTIONS.TEAMS, existing.teamId), {
            importBatchId,
            updatedAt: new Date(),
          });
          teamRefMap.set(teamName, existing.teamId);
          return;
        }

        // Create new team
        const team = await createTeam({
          name: teamName,
          players: [],
          playerRefs: [],
          createdBy,
        });
        // Tag with importBatchId
        await updateDoc(doc(db, COLLECTIONS.TEAMS, team.teamId), { importBatchId });
        teamRefMap.set(teamName, team.teamId);
        teamsCreated++;
      })
    );

    const pct = Math.round(((ci + 1) / teamChunks.length) * 30);
    onProgress?.(pct);
  }

  // Phase 2 — Player creation + team assignment
  const playerChunks = chunked(players);
  let playersCreated = 0;
  const teamPlayerAccumulator = new Map(); // teamId → [playerRef]

  for (let ci = 0; ci < playerChunks.length; ci++) {
    await Promise.all(
      playerChunks[ci].map(async (row) => {
        const existingPlayer = playerByEmpId.get(row.employeeId);
        let playerId;

        if (existingPlayer) {
          if (playerConflict === "skip") {
            playerId = existingPlayer.playerId;
          } else {
            // update (default)
            await updateDoc(doc(db, COLLECTIONS.PLAYERS, existingPlayer.playerId), {
              name: row.playerName.trim(),
              email: row.email || existingPlayer.email || "",
              department: row.department || existingPlayer.department || "",
              festivalTeam: row.festivalTeam || existingPlayer.festivalTeam || "",
              soldPrice: row.soldPrice || existingPlayer.soldPrice || "",
              creditsUsed: row.creditsUsed || existingPlayer.creditsUsed || "",
              importBatchId,
              updatedAt: new Date(),
            });
            playerId = existingPlayer.playerId;
          }
        } else {
          const player = await createPlayer({
            name: row.playerName,
            role: "",
            battingStyle: "",
            bowlingStyle: "",
            createdBy,
          });
          // Tag with extra import fields
          await updateDoc(doc(db, COLLECTIONS.PLAYERS, player.playerId), {
            employeeId: row.employeeId,
            email: row.email || "",
            department: row.department || "",
            festivalTeam: row.festivalTeam || "",
            soldPrice: row.soldPrice || "",
            creditsUsed: row.creditsUsed || "",
            importBatchId,
          });
          playerId = player.playerId;
          playersCreated++;
        }

        // Accumulate player ref for team
        const teamId = teamRefMap.get(row.teamName);
        if (teamId) {
          if (!teamPlayerAccumulator.has(teamId)) {
            teamPlayerAccumulator.set(teamId, []);
          }
          teamPlayerAccumulator.get(teamId).push({
            playerId,
            name: row.playerName.trim(),
            importBatchId,
          });
        }
      })
    );

    const pct = 30 + Math.round(((ci + 1) / playerChunks.length) * 60);
    onProgress?.(pct);
  }

  // Phase 3 — Flush player refs into teams
  const teamIdList = [...teamPlayerAccumulator.keys()];
  const teamChunks2 = chunked(teamIdList);

  for (let ci = 0; ci < teamChunks2.length; ci++) {
    await Promise.all(
      teamChunks2[ci].map(async (teamId) => {
        const newRefs = teamPlayerAccumulator.get(teamId);
        const teamSnap = existingTeams.find((t) => t.teamId === teamId);
        const existingRefs = teamSnap?.playerRefs || [];

        // Remove old refs that share same playerId to avoid duplication on merge
        const existingRefIds = new Set(newRefs.map((r) => r.playerId).filter(Boolean));
        const filteredExisting = existingRefs.filter(
          (r) => !existingRefIds.has(r.playerId)
        );

        const mergedRefs = [...filteredExisting, ...newRefs];
        await updateDoc(doc(db, COLLECTIONS.TEAMS, teamId), {
          playerRefs: mergedRefs,
          players: mergedRefs.map((r) => r.name),
          updatedAt: new Date(),
        });
      })
    );
  }

  onProgress?.(95);

  // Update import record
  trackImportCompleted({ import_id: importId, teams_created: teamsCreated, players_created: playersCreated });
  await updateImportRecord(importId, {
    status: "Imported",
    teamsCreated,
    playersCreated,
    assignmentsCreated: players.length,
  });

  onProgress?.(100);

  return { teamsCreated, playersCreated, assignmentsCreated: players.length };
};

// ─── Rollback ─────────────────────────────────────────────────────────────────

export const rollbackImport = async ({ importId, importBatchId, createdBy }) => {
  // 1. Delete players created by this batch
  const playerQuery = query(
    collection(db, COLLECTIONS.PLAYERS),
    where("createdBy", "==", createdBy)
  );
  const playerSnap = await getDocs(playerQuery);
  const batchPlayers = playerSnap.docs.filter(
    (d) => d.data().importBatchId === importBatchId
  );
  await Promise.all(batchPlayers.map((d) => deleteDoc(d.ref)));

  // 2. Delete teams created by this batch (teams where importBatchId tag AND teamsCreated in this import)
  const teamQuery = query(
    collection(db, COLLECTIONS.TEAMS),
    where("createdBy", "==", createdBy)
  );
  const teamSnap = await getDocs(teamQuery);
  const batchTeamIds = new Set();

  await Promise.all(
    teamSnap.docs.map(async (d) => {
      if (d.data().importBatchId !== importBatchId) return;
      // If team existed before this import, it won't have been created — check createdAt vs importedAt
      // Simpler: we only delete if ALL playerRefs belong to this batch (i.e. team was newly created)
      const refs = d.data().playerRefs || [];
      const allFromBatch = refs.every((r) => r.importBatchId === importBatchId);
      const noRefs = refs.length === 0;
      if (allFromBatch || noRefs) {
        // Likely a new team from this batch — delete it
        batchTeamIds.add(d.id);
        await deleteDoc(d.ref);
      } else {
        // Existing team — just remove batch player refs
        const cleanedRefs = refs.filter((r) => r.importBatchId !== importBatchId);
        await updateDoc(d.ref, {
          playerRefs: cleanedRefs,
          players: cleanedRefs.map((r) => r.name),
          updatedAt: new Date(),
        });
      }
    })
  );

  await updateImportRecord(importId, { status: "RolledBack" });
};
