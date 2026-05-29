import { useEffect, useState } from "react";
import { subscribeToDocument } from "../../services/firebase/firestoreHelpers";

/**
 * Realtime listener for a single Firestore document with automatic cleanup.
 */
const useFirestoreDocument = (docRef, { enabled = true } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled && docRef));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !docRef) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToDocument(
      docRef,
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
  }, [docRef, enabled]);

  return { data, loading, error };
};

export default useFirestoreDocument;
