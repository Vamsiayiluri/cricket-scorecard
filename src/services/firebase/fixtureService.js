import { uid } from "uid";
import {
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import db from "../../firebase-config";
import { COLLECTIONS } from "./constants";

export const FIXTURE_STATUS = {
  SCHEDULED: "Scheduled",
  LIVE: "Live",
  COMPLETED: "Completed",
};

// ── Collection helpers ────────────────────────────────────────────────────────

const fixtureCol = (tournamentId) =>
  collection(db, COLLECTIONS.TOURNAMENTS, tournamentId, "fixtures");

const fixtureDocRef = (tournamentId, fixtureId) =>
  doc(db, COLLECTIONS.TOURNAMENTS, tournamentId, "fixtures", fixtureId);

// ── CRUD ──────────────────────────────────────────────────────────────────────

export const createFixture = async (tournamentId, data) => {
  const fixtureId = uid();
  const now = new Date();
  const payload = {
    fixtureId,
    tournamentId,
    teamAName: data.teamAName || "",
    teamBName: data.teamBName || "",
    scheduledDate: data.scheduledDate || "",
    status: FIXTURE_STATUS.SCHEDULED,
    matchId: null,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(fixtureDocRef(tournamentId, fixtureId), payload);
  return payload;
};

export const updateFixture = async (tournamentId, fixtureId, patch) => {
  await updateDoc(fixtureDocRef(tournamentId, fixtureId), {
    ...patch,
    updatedAt: new Date(),
  });
};

export const deleteFixture = async (tournamentId, fixtureId) => {
  await deleteDoc(fixtureDocRef(tournamentId, fixtureId));
};

/** Called after "Create Match from Fixture" — links the new match to this fixture. */
export const linkFixtureToMatch = async (tournamentId, fixtureId, matchId) => {
  await updateDoc(fixtureDocRef(tournamentId, fixtureId), {
    matchId,
    status: FIXTURE_STATUS.SCHEDULED,
    updatedAt: new Date(),
  });
};

// ── Realtime query ────────────────────────────────────────────────────────────

export const buildFixturesQuery = (tournamentId) =>
  query(fixtureCol(tournamentId), orderBy("scheduledDate", "asc"));

// ── Derived status ────────────────────────────────────────────────────────────

/**
 * Derive the true display status of a fixture from its linked match's
 * current status. Falls back to the stored fixture.status when the match
 * cannot be found (e.g., still loading).
 *
 * matchesById: Map<matchId, matchDoc>
 */
export const deriveFixtureStatus = (fixture, matchesById) => {
  if (!fixture.matchId) return FIXTURE_STATUS.SCHEDULED;
  const match = matchesById.get(fixture.matchId);
  if (!match) return fixture.status || FIXTURE_STATUS.SCHEDULED;
  if (match.status === "completed") return FIXTURE_STATUS.COMPLETED;
  if (match.status === "in-progress") return FIXTURE_STATUS.LIVE;
  return FIXTURE_STATUS.SCHEDULED;
};
