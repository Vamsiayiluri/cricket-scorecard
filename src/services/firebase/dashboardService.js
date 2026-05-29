import { collection, limit, query } from "firebase/firestore";
import db from "../../firebase-config";
import { COLLECTIONS, MATCH_STATUS, QUERY_LIMITS } from "./constants";
import { fetchQuery } from "./firestoreHelpers";
import { isCompletedMatch } from "../../utils/matchDisplay";

const matchesQuery = (maxResults = QUERY_LIMITS.DASHBOARD_MATCHES) =>
  query(collection(db, COLLECTIONS.MATCHES), limit(maxResults));

const sortByUpdatedAtDesc = (matches = []) =>
  [...matches].sort((a, b) => {
    const aTime = a?.updatedAt?.toMillis?.() ?? new Date(a?.updatedAt || 0).getTime();
    const bTime = b?.updatedAt?.toMillis?.() ?? new Date(b?.updatedAt || 0).getTime();
    return bTime - aTime;
  });

const normalizeCompletedStatus = (match) =>
  isCompletedMatch(match) ? { ...match, status: MATCH_STATUS.COMPLETED } : match;

const filterByStatus = (matches, status) =>
  matches.filter((match) => match.status === status);

/**
 * Fetch dashboard match buckets in one read (client-side partition).
 * Avoids multiple composite indexes while staying backward-compatible.
 */
export const fetchDashboardMatches = async () => {
  const allMatches = await fetchQuery(matchesQuery());
  const sorted = sortByUpdatedAtDesc(allMatches).map(normalizeCompletedStatus);

  const ongoing = filterByStatus(sorted, MATCH_STATUS.IN_PROGRESS).slice(
    0,
    QUERY_LIMITS.ONGOING
  );
  const upcoming = filterByStatus(sorted, MATCH_STATUS.SCHEDULED).slice(
    0,
    QUERY_LIMITS.UPCOMING
  );
  const completed = filterByStatus(sorted, MATCH_STATUS.COMPLETED).slice(
    0,
    QUERY_LIMITS.COMPLETED
  );
  const recentActivity = sorted.slice(0, QUERY_LIMITS.RECENT_ACTIVITY);

  const stats = {
    total: sorted.length,
    ongoing: filterByStatus(sorted, MATCH_STATUS.IN_PROGRESS).length,
    upcoming: filterByStatus(sorted, MATCH_STATUS.SCHEDULED).length,
    completed: filterByStatus(sorted, MATCH_STATUS.COMPLETED).length,
  };

  return { ongoing, upcoming, completed, recentActivity, stats, allMatches: sorted };
};

export const getDashboardMatchesQuery = () => matchesQuery();
