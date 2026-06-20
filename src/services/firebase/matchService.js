import { uid } from "uid";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import db from "../../firebase-config";
import { COLLECTIONS, MATCH_STATUS } from "./constants";
import { fetchDocument } from "./firestoreHelpers";
import { assertFirestoreSafePayload } from "../../utils/firestoreValidation";
import { normalizeScoreCardTimelineStorage } from "../../utils/scorecardTimeline";
import { trackMatchCreated, trackMatchCompleted } from "../analytics/analyticsService";
import { captureError } from "../monitoring/sentryService";

const matchDoc = (matchId) => doc(db, COLLECTIONS.MATCHES, matchId);

/**
 * Build match payload from creation wizard form (existing shape preserved).
 */
export const buildMatchFromForm = (formData) => {
  const matchId = uid();

  return {
    matchId,
    matchDetails: {
      teamA: formData.matchDetails.teamA,
      teamB: formData.matchDetails.teamB,
      location: formData.matchDetails.venue,
      date: formData.matchDetails.dateTime,
      ...(formData.matchDetails.matchTitle && {
        title: formData.matchDetails.matchTitle,
      }),
      ...(formData.matchDetails.matchType && {
        matchType: formData.matchDetails.matchType,
      }),
    },
    teams: {
      teamA: {
        name: formData.teams.teamA.name,
        players: formData.teams.teamA.players,
        // playerRefs links each player name to a catalog playerId (null for manual entries).
        // Used as the foundation for future per-player statistics.
        playerRefs: formData.teams.teamA.playerRefs || [],
        ...(formData.teams.teamA.captain && {
          captain: formData.teams.teamA.captain,
        }),
        ...(formData.teams.teamA.wicketkeeper && {
          wicketkeeper: formData.teams.teamA.wicketkeeper,
        }),
      },
      teamB: {
        name: formData.teams.teamB.name,
        players: formData.teams.teamB.players,
        playerRefs: formData.teams.teamB.playerRefs || [],
        ...(formData.teams.teamB.captain && {
          captain: formData.teams.teamB.captain,
        }),
        ...(formData.teams.teamB.wicketkeeper && {
          wicketkeeper: formData.teams.teamB.wicketkeeper,
        }),
      },
    },
    tossDetails: {
      winner: formData.tossDetails.winner,
      decision: formData.tossDetails.decision,
    },
    scoringRules: {
      maxOvers: formData.scoringRules.overs,
      extras: {
        wides: formData.scoringRules.wide,
        noBalls: formData.scoringRules.noBall,
      },
    },
    scoreCard: {},
    notes: formData?.notes || "",
    status: MATCH_STATUS.SCHEDULED,
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublic: formData?.isPublic ?? true,
    createdBy: formData?.createdBy || "",
    tournamentId: formData?.tournamentId || null,
    lifecyclePhase: "scheduled",
    archivedAt: null,
    deletedAt: null,
  };
};

export const createMatch = async (formData) => {
  const matchData = buildMatchFromForm(formData);
  assertFirestoreSafePayload(matchData);
  await setDoc(matchDoc(matchData.matchId), matchData);
  trackMatchCreated({
    match_id: matchData.matchId,
    format: matchData.scoringRules?.oversPerInnings ? "limited_overs" : "unlimited",
  });
  return matchData;
};

export const getMatchById = async (matchId) => {
  if (!matchId) {
    return null;
  }
  return fetchDocument(matchDoc(matchId));
};

export const updateMatchById = async (updatedData) => {
  if (!updatedData?.matchId) {
    throw new Error("matchId is required to update a match");
  }

  const payload = {
    ...updatedData,
    scoreCard: normalizeScoreCardTimelineStorage(updatedData.scoreCard),
    updatedAt: updatedData.updatedAt || new Date(),
  };

  assertFirestoreSafePayload(payload);
  try {
    await updateDoc(matchDoc(updatedData.matchId), payload);
  } catch (err) {
    captureError(err, { label: "updateMatchById", matchId: updatedData.matchId });
    throw err;
  }

  return payload;
};

/**
 * Safe partial update for admin/scorer match management.
 */
export const patchMatchById = async (matchId, patch) => {
  if (!matchId) {
    throw new Error("matchId is required");
  }
  assertFirestoreSafePayload(patch);
  await updateDoc(matchDoc(matchId), { ...patch, updatedAt: new Date() });
};

export const updateMatchCurrentInning = async (matchId, inningNumber) => {
  await updateDoc(matchDoc(matchId), {
    "scoreCard.currentInning": inningNumber,
    updatedAt: new Date(),
  });
};

export const completeMatchById = async (updatedData, completionFields) => {
  if (!updatedData?.matchId) {
    throw new Error("matchId is required to complete a match");
  }

  const payload = {
    ...updatedData,
    ...completionFields,
    scoreCard: normalizeScoreCardTimelineStorage(updatedData.scoreCard),
    status: MATCH_STATUS.COMPLETED,
    updatedAt: new Date(),
  };

  assertFirestoreSafePayload(payload);
  try {
    await updateDoc(matchDoc(updatedData.matchId), payload);
  } catch (err) {
    captureError(err, { label: "completeMatchById", matchId: updatedData.matchId });
    throw err;
  }
  trackMatchCompleted({ match_id: updatedData.matchId });
  return payload;
};

export const archiveMatch = async (matchId) => {
  await patchMatchById(matchId, {
    archivedAt: new Date(),
    lifecyclePhase: "archived",
  });
};

export const restoreArchivedMatch = async (matchId) => {
  await patchMatchById(matchId, {
    archivedAt: null,
    lifecyclePhase: "scheduled",
  });
};

export const softDeleteMatch = async (matchId) => {
  await patchMatchById(matchId, {
    deletedAt: new Date(),
    lifecyclePhase: "deleted",
  });
};

export const setMatchVisibility = async (matchId, isPublic) => {
  await patchMatchById(matchId, { isPublic: Boolean(isPublic) });
};

export const setPlayerOfMatch = async (matchId, playerName) => {
  await patchMatchById(matchId, { playerOfTheMatch: playerName || null });
};
