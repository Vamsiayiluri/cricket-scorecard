import { useEffect, useMemo, useState } from "react";
import { collection, query } from "firebase/firestore";
import db from "../../firebase-config";
import { COLLECTIONS } from "../../services/firebase/constants";
import { fetchQuery } from "../../services/firebase/firestoreHelpers";
import { isCompletedMatch } from "../../utils/matchDisplay";

/**
 * One-time fetch of all completed matches for client-side stats aggregation.
 * Does not maintain a realtime subscription — stats are recalculated on mount.
 */
const useCompletedMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const q = query(collection(db, COLLECTIONS.MATCHES));
        const all = await fetchQuery(q);
        if (!cancelled) {
          setMatches(all.filter(isCompletedMatch));
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return useMemo(() => ({ matches, loading, error }), [matches, loading, error]);
};

export default useCompletedMatches;
