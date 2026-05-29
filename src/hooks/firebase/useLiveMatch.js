import { useMemo } from "react";
import { doc } from "firebase/firestore";
import db from "../../firebase-config";
import { COLLECTIONS } from "../../services/firebase/constants";
import useFirestoreDocument from "./useFirestoreDocument";

/**
 * Live match document subscription.
 * Use on read-heavy pages (setup/dashboard). Avoid on active scoring UI
 * where local reducer state is the source of truth during ball entry.
 */
const useLiveMatch = (matchId, options = {}) => {
  const docRef = useMemo(() => {
    if (!matchId) {
      return null;
    }
    return doc(db, COLLECTIONS.MATCHES, matchId);
  }, [matchId]);

  return useFirestoreDocument(docRef, options);
};

export default useLiveMatch;
