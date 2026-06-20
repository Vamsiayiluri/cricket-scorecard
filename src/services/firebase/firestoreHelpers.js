import { getDoc, getDocs, onSnapshot } from "firebase/firestore";
import { captureError } from "../monitoring/sentryService";

/**
 * Normalize Firestore errors for UI and logging.
 */
export const handleFirestoreError = (error, context = "Firestore") => {
  const message =
    error?.code === "permission-denied"
      ? "You do not have permission to access this data."
      : error?.message || "An unexpected database error occurred.";

  return {
    code: error?.code || "unknown",
    message,
    context,
    original: error,
  };
};

/**
 * Map a document snapshot to `{ id, ...data }`.
 */
export const docToData = (snapshot) => {
  if (!snapshot) {
    return null;
  }

  const exists =
    typeof snapshot.exists === "function" ? snapshot.exists() : Boolean(snapshot.exists);

  if (!exists) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() };
};

/**
 * Map a query snapshot to an array of documents.
 */
export const queryToData = (snapshot) =>
  snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

/**
 * One-time document read.
 */
export const fetchDocument = async (docRef) => {
  try {
    const snapshot = await getDoc(docRef);
    return docToData(snapshot);
  } catch (error) {
    captureError(error, { label: "fetchDocument", path: docRef?.path });
    throw handleFirestoreError(error, "fetchDocument");
  }
};

/**
 * One-time query read.
 */
export const fetchQuery = async (queryRef) => {
  try {
    const snapshot = await getDocs(queryRef);
    return queryToData(snapshot);
  } catch (error) {
    captureError(error, { label: "fetchQuery" });
    throw handleFirestoreError(error, "fetchQuery");
  }
};

/**
 * Subscribe to a single document. Returns unsubscribe function.
 */
export const subscribeToDocument = (docRef, onData, onError) => {
  if (!docRef) {
    return () => {};
  }

  return onSnapshot(
    docRef,
    (snapshot) => onData(docToData(snapshot)),
    (error) => onError?.(handleFirestoreError(error, "subscribeToDocument"))
  );
};

/**
 * Subscribe to a query. Returns unsubscribe function.
 */
export const subscribeToQuery = (queryRef, onData, onError) => {
  if (!queryRef) {
    return () => {};
  }

  return onSnapshot(
    queryRef,
    (snapshot) => onData(queryToData(snapshot)),
    (error) => onError?.(handleFirestoreError(error, "subscribeToQuery"))
  );
};
