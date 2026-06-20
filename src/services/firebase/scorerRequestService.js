import { uid } from "uid";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import db from "../../firebase-config";
import { COLLECTIONS, USER_ROLES } from "./constants";
import { fetchDocument, fetchQuery } from "./firestoreHelpers";
import { userDoc } from "./userService";

const requestDoc = (id) => doc(db, COLLECTIONS.SCORER_REQUESTS, id);
const requestsCollection = () => collection(db, COLLECTIONS.SCORER_REQUESTS);

export const REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

/** Submit a new scorer role request. Returns the created requestId. */
export const requestScorerRole = async ({ uid: userId, email, displayName }) => {
  const requestId = uid();
  await setDoc(requestDoc(requestId), {
    requestId,
    uid: userId,
    email: email || "",
    displayName: displayName || "",
    status: REQUEST_STATUS.PENDING,
    requestedAt: serverTimestamp(),
    resolvedAt: null,
    resolvedBy: null,
  });
  return requestId;
};

/** Get the most recent scorer request for a specific user (any status). */
export const getUserScorerRequest = async (userId) => {
  const q = query(requestsCollection(), where("uid", "==", userId));
  const results = await fetchQuery(q);
  if (!results.length) return null;
  // Return the most recent by requestedAt
  return results.sort((a, b) => {
    const aMs = a.requestedAt?.toMillis?.() ?? 0;
    const bMs = b.requestedAt?.toMillis?.() ?? 0;
    return bMs - aMs;
  })[0];
};

/** Fetch all pending requests (for the scorer approval page). */
export const getPendingRequests = async () => {
  const q = query(requestsCollection(), where("status", "==", REQUEST_STATUS.PENDING));
  return fetchQuery(q);
};

/** Fetch all requests regardless of status (for full history view). */
export const getAllRequests = async () => {
  const results = await getDocs(requestsCollection());
  return results.docs.map((d) => d.data());
};

/** Approve a request — upgrades the user's role and marks the request resolved. */
export const approveRequest = async (requestId, targetUid, resolvedByUid) => {
  await updateDoc(userDoc(targetUid), {
    role: USER_ROLES.SCORER,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(requestDoc(requestId), {
    status: REQUEST_STATUS.APPROVED,
    resolvedAt: serverTimestamp(),
    resolvedBy: resolvedByUid,
  });
};

/** Reject a request — leaves the user's role unchanged. */
export const rejectRequest = async (requestId, resolvedByUid) => {
  await updateDoc(requestDoc(requestId), {
    status: REQUEST_STATUS.REJECTED,
    resolvedAt: serverTimestamp(),
    resolvedBy: resolvedByUid,
  });
};
