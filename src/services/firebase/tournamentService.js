import { uid } from "uid";
import {
  arrayUnion,
  collection,
  doc,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import db from "../../firebase-config";
import { COLLECTIONS } from "./constants";
import { fetchDocument } from "./firestoreHelpers";
import { trackTournamentCreated } from "../analytics/analyticsService";
import { assertFirestoreSafePayload } from "../../utils/firestoreValidation";

export const TOURNAMENT_STATUS = {
  DRAFT: "Draft",
  UPCOMING: "Upcoming",
  LIVE: "Live",
  COMPLETED: "Completed",
};

export const TOURNAMENT_FORMATS = [
  { value: "League", label: "League (Round Robin)" },
  { value: "Knockout", label: "Knockout (Elimination)" },
  { value: "League+Knockout", label: "League + Knockout" },
  { value: "Custom", label: "Custom" },
];

const tournamentDoc = (id) => doc(db, COLLECTIONS.TOURNAMENTS, id);

// ── CRUD ──────────────────────────────────────────────────────────────────────

export const createTournament = async (data, organizerId) => {
  const tournamentId = uid();
  const now = new Date();
  const payload = {
    tournamentId,
    name: data.name.trim(),
    description: (data.description || "").trim(),
    format: data.format || "League",
    organizerId,
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    status: data.status || TOURNAMENT_STATUS.DRAFT,
    teamIds: [],
    isPublic: data.isPublic ?? true,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  };
  assertFirestoreSafePayload(payload);
  await setDoc(tournamentDoc(tournamentId), payload);
  trackTournamentCreated({ tournament_id: tournamentId, format: payload.format });
  return payload;
};

export const updateTournament = async (tournamentId, patch) => {
  assertFirestoreSafePayload(patch);
  await updateDoc(tournamentDoc(tournamentId), { ...patch, updatedAt: new Date() });
};

export const archiveTournament = async (tournamentId) => {
  await updateDoc(tournamentDoc(tournamentId), {
    archivedAt: new Date(),
    updatedAt: new Date(),
  });
};

export const getTournamentById = async (tournamentId) =>
  fetchDocument(tournamentDoc(tournamentId));

// ── Team assignment ───────────────────────────────────────────────────────────

// entry: { teamId, name } — stored as object so public page never shows raw Firestore IDs.
export const addTeamToTournament = async (tournamentId, entry) => {
  await updateDoc(tournamentDoc(tournamentId), {
    teamIds: arrayUnion(entry),
    updatedAt: new Date(),
  });
};

// Accepts the full updated teamIds array after client-side removal of the target teamId.
export const setTournamentTeams = async (tournamentId, teamIds) => {
  await updateDoc(tournamentDoc(tournamentId), { teamIds, updatedAt: new Date() });
};

// ── Queries ───────────────────────────────────────────────────────────────────

export const buildUserTournamentsQuery = (organizerId) =>
  query(
    collection(db, COLLECTIONS.TOURNAMENTS),
    where("organizerId", "==", organizerId),
    orderBy("createdAt", "desc")
  );

// Realtime query builder for tournament matches — pass to useRealtimeCollection.
export const buildTournamentMatchesQuery = (tournamentId) =>
  tournamentId
    ? query(collection(db, COLLECTIONS.MATCHES), where("tournamentId", "==", tournamentId))
    : null;
