import { useEffect, useState } from "react";
import { subscribeToQuery } from "../../services/firebase/firestoreHelpers";

/**
 * Realtime listener for a Firestore query with automatic cleanup.
 */
const useRealtimeCollection = (queryRef, { enabled = true } = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled && queryRef));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !queryRef) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToQuery(
      queryRef,
      (nextData) => {
        setData(nextData);
        setLoading(false);
      },
      (firestoreError) => {
        setError(firestoreError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [queryRef, enabled]);

  return { data, loading, error };
};

export default useRealtimeCollection;
