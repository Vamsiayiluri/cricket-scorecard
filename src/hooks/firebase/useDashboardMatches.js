import { useEffect, useMemo, useState } from "react";
import {
  getDashboardMatchesQuery,
  fetchDashboardMatches,
} from "../../services/firebase/dashboardService";
import { MATCH_STATUS } from "../../services/firebase/constants";
import { isCompletedMatch } from "../../utils/matchDisplay";
import useRealtimeCollection from "./useRealtimeCollection";

const normalizeCompletedStatus = (match) =>
  isCompletedMatch(match) ? { ...match, status: MATCH_STATUS.COMPLETED } : match;

const partitionMatches = (matches = []) => {
  const visible = matches.filter((m) => !m?.deletedAt);
  const sorted = [...visible]
    .sort((a, b) => {
      const aTime = a?.updatedAt?.toMillis?.() ?? new Date(a?.updatedAt || 0).getTime();
      const bTime = b?.updatedAt?.toMillis?.() ?? new Date(b?.updatedAt || 0).getTime();
      return bTime - aTime;
    })
    .map(normalizeCompletedStatus);

  const ongoing = sorted.filter((m) => m.status === MATCH_STATUS.IN_PROGRESS).slice(0, 10);
  const upcoming = sorted
    .filter((m) => m.status === MATCH_STATUS.SCHEDULED)
    .filter((m) => !m?.archivedAt)
    .slice(0, 10);
  const completed = sorted
    .filter((m) => m.status === MATCH_STATUS.COMPLETED)
    .filter((m) => !m?.archivedAt)
    .slice(0, 10);
  const recentActivity = sorted.slice(0, 8);

  const stats = {
    total: sorted.length,
    ongoing: sorted.filter((m) => m.status === MATCH_STATUS.IN_PROGRESS).length,
    upcoming: sorted.filter((m) => m.status === MATCH_STATUS.SCHEDULED).length,
    completed: sorted.filter((m) => m.status === MATCH_STATUS.COMPLETED).length,
  };

  return { ongoing, upcoming, completed, recentActivity, stats };
};

/**
 * Dashboard realtime feed using a single scoped listener.
 */
const useDashboardMatches = ({ realtime = true } = {}) => {
  const queryRef = useMemo(() => getDashboardMatchesQuery(), []);
  const {
    data: liveMatches,
    loading: liveLoading,
    error: liveError,
  } = useRealtimeCollection(queryRef, { enabled: realtime });

  const [fallback, setFallback] = useState({
    ongoing: [],
    upcoming: [],
    completed: [],
    recentActivity: [],
    stats: { total: 0, ongoing: 0, upcoming: 0, completed: 0 },
  });
  const [fallbackLoading, setFallbackLoading] = useState(!realtime);
  const [fallbackError, setFallbackError] = useState(null);

  useEffect(() => {
    if (realtime) {
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      setFallbackLoading(true);
      try {
        const result = await fetchDashboardMatches();
        if (!cancelled) {
          setFallback(result);
          setFallbackError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setFallbackError(error);
        }
      } finally {
        if (!cancelled) {
          setFallbackLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [realtime]);

  if (realtime) {
    const partitioned = partitionMatches(liveMatches);
    return {
      ...partitioned,
      loading: liveLoading,
      error: liveError,
    };
  }

  return {
    ...fallback,
    loading: fallbackLoading,
    error: fallbackError,
  };
};

export default useDashboardMatches;
