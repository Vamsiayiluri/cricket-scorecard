import { uid } from "uid";
import {
  arrayUnion,
  collection,
  doc,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import db from "../../firebase-config";
import { COLLECTIONS } from "./constants";
import { fetchQuery } from "./firestoreHelpers";

const requestDoc = (id) => doc(db, COLLECTIONS.MATCH_ACCESS_REQUESTS, id);
const requestsCol = () => collection(db, COLLECTIONS.MATCH_ACCESS_REQUESTS);
const matchDoc = (id) => doc(db, COLLECTIONS.MATCHES, id);

export const MATCH_ACCESS_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

/** Check if a user can score/edit a match (owner or approved collaborator). */
export const canAccessMatch = (match, uid) => {
  if (!match || !uid) return false;
  if (match.createdBy === uid) return true;
  return Array.isArray(match.collaboratorUids) && match.collaboratorUids.includes(uid);
};

/** Submit a request to access a match. */
export const requestMatchAccess = async ({ matchId, matchTitle, matchOwnerUid, requestedBy, requestedByName, requestedByEmail }) => {
  const requestId = uid();
  await setDoc(requestDoc(requestId), {
    requestId,
    matchId,
    matchTitle: matchTitle || "",
    matchOwnerUid: matchOwnerUid || "",
    requestedBy,
    requestedByName: requestedByName || "",
    requestedByEmail: requestedByEmail || "",
    status: MATCH_ACCESS_STATUS.PENDING,
    requestedAt: serverTimestamp(),
    resolvedAt: null,
    resolvedBy: null,
  });
  return requestId;
};

/** Get a specific user's access request for a specific match (any status). */
export const getUserMatchAccessRequest = async (matchId, userId) => {
  const q = query(
    requestsCol(),
    where("matchId", "==", matchId),
    where("requestedBy", "==", userId)
  );
  const results = await fetchQuery(q);
  if (!results.length) return null;
  return results.sort((a, b) => {
    const aMs = a.requestedAt?.toMillis?.() ?? 0;
    const bMs = b.requestedAt?.toMillis?.() ?? 0;
    return bMs - aMs;
  })[0];
};

/** Get all pending access requests for a match (shown to the match owner). */
export const getMatchAccessRequests = async (matchId) => {
  const q = query(requestsCol(), where("matchId", "==", matchId));
  const results = await fetchQuery(q);
  return results.sort((a, b) => {
    if (a.status === MATCH_ACCESS_STATUS.PENDING && b.status !== MATCH_ACCESS_STATUS.PENDING) return -1;
    if (b.status === MATCH_ACCESS_STATUS.PENDING && a.status !== MATCH_ACCESS_STATUS.PENDING) return 1;
    return (b.requestedAt?.toMillis?.() ?? 0) - (a.requestedAt?.toMillis?.() ?? 0);
  });
};

/** Approve: add uid to match.collaboratorUids and mark request approved. */
export const approveMatchAccess = async (requestId, matchId, targetUid, resolvedByUid) => {
  await updateDoc(matchDoc(matchId), {
    collaboratorUids: arrayUnion(targetUid),
    updatedAt: new Date(),
  });
  await updateDoc(requestDoc(requestId), {
    status: MATCH_ACCESS_STATUS.APPROVED,
    resolvedAt: serverTimestamp(),
    resolvedBy: resolvedByUid,
  });
};

/** Get all match access requests where the match was created by a given owner uid.
 *  Used on the Scorer Requests page so the owner sees requests across all their matches. */
export const getMatchAccessRequestsForOwner = async (ownerUid) => {
  const q = query(requestsCol(), where("matchOwnerUid", "==", ownerUid));
  const results = await fetchQuery(q);
  return results.sort((a, b) => {
    if (a.status === MATCH_ACCESS_STATUS.PENDING && b.status !== MATCH_ACCESS_STATUS.PENDING) return -1;
    if (b.status === MATCH_ACCESS_STATUS.PENDING && a.status !== MATCH_ACCESS_STATUS.PENDING) return 1;
    return (b.requestedAt?.toMillis?.() ?? 0) - (a.requestedAt?.toMillis?.() ?? 0);
  });
};

/** Reject: leave collaboratorUids unchanged, mark request rejected. */
export const rejectMatchAccess = async (requestId, resolvedByUid) => {
  await updateDoc(requestDoc(requestId), {
    status: MATCH_ACCESS_STATUS.REJECTED,
    resolvedAt: serverTimestamp(),
    resolvedBy: resolvedByUid,
  });
};
