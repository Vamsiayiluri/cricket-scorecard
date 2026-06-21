import { collection, limit, query, where } from "firebase/firestore";
import db from "../../firebase-config";
import { COLLECTIONS, MATCH_STATUS } from "./constants";
import { fetchQuery } from "./firestoreHelpers";
import { isCompletedMatch } from "../../utils/matchDisplay";
import { buildPublicTournamentsQuery } from "./tournamentService";

const normalizeStatus = (match) =>
  isCompletedMatch(match) ? { ...match, status: MATCH_STATUS.COMPLETED } : match;

const sortByUpdatedDesc = (matches) =>
  [...matches].sort((a, b) => {
    const at = a?.updatedAt?.toMillis?.() ?? new Date(a?.updatedAt || 0).getTime();
    const bt = b?.updatedAt?.toMillis?.() ?? new Date(b?.updatedAt || 0).getTime();
    return bt - at;
  });

const sortByDateAsc = (matches) =>
  [...matches].sort((a, b) => {
    const at = new Date(a?.matchDetails?.date || 0).getTime();
    const bt = new Date(b?.matchDetails?.date || 0).getTime();
    return at - bt;
  });

/**
 * Fetch public matches for the discovery feed.
 *
 * Uses a single query with where("isPublic", "==", true) so the Firestore rule
 * `allow read: if isPublicMatch()` grants access to unauthenticated users too.
 * Client-side partition by status avoids composite indexes.
 */
export const fetchDiscoverMatches = async () => {
  const q = query(
    collection(db, COLLECTIONS.MATCHES),
    where("isPublic", "==", true),
    limit(120)
  );

  const raw = await fetchQuery(q);

  const visible = raw
    .filter((m) => !m.deletedAt)
    .map(normalizeStatus);

  const live = sortByUpdatedDesc(
    visible.filter((m) => m.status === MATCH_STATUS.IN_PROGRESS)
  ).slice(0, 10);

  const results = sortByUpdatedDesc(
    visible.filter((m) => m.status === MATCH_STATUS.COMPLETED)
  ).slice(0, 20);

  const upcoming = sortByDateAsc(
    visible
      .filter((m) => m.status === MATCH_STATUS.SCHEDULED && !m.archivedAt)
  ).slice(0, 10);

  return { live, results, upcoming, all: visible };
};

export const fetchDiscoverTournaments = async () => {
  const raw = await fetchQuery(buildPublicTournamentsQuery(60));

  return raw
    .filter((t) => !t.archivedAt)
    .sort((a, b) => {
      const at = a?.updatedAt?.toMillis?.() ?? new Date(a?.updatedAt || a?.createdAt || 0).getTime();
      const bt = b?.updatedAt?.toMillis?.() ?? new Date(b?.updatedAt || b?.createdAt || 0).getTime();
      return bt - at;
    })
    .slice(0, 12);
};
