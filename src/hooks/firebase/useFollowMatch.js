import { useCallback, useEffect, useState } from "react";
import {
  followMatch,
  getFollowStatus,
  unfollowMatch,
} from "../../services/firebase/notificationService";

/**
 * Manages follow/unfollow state for a single match.
 * Only meaningful for authenticated users — returns no-ops when uid is absent.
 */
const useFollowMatch = (uid, matchId) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!uid || !matchId) {
      setInitializing(false);
      return;
    }

    let cancelled = false;
    setInitializing(true);

    getFollowStatus(uid, matchId)
      .then((status) => {
        if (!cancelled) setIsFollowing(status);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uid, matchId]);

  const toggleFollow = useCallback(async () => {
    if (!uid || !matchId || loading) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowMatch(uid, matchId);
        setIsFollowing(false);
      } else {
        await followMatch(uid, matchId);
        setIsFollowing(true);
      }
    } catch {
      // silent — UI shows optimistic state; next mount re-reads truth
    } finally {
      setLoading(false);
    }
  }, [uid, matchId, isFollowing, loading]);

  return { isFollowing, toggleFollow, loading: loading || initializing };
};

export default useFollowMatch;
