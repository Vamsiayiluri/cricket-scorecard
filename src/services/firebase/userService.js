import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import db from "../../firebase-config";
import { COLLECTIONS, SCORER_ROLES, USER_ROLES } from "./constants";
import { fetchDocument, subscribeToDocument } from "./firestoreHelpers";

export const userDoc = (uid) => doc(db, COLLECTIONS.USERS, uid);

/**
 * Resolve effective role. Missing profile defaults to viewer for safe MVP access.
 */
export const resolveRole = (profile) => {
  if (!profile?.role) {
    return USER_ROLES.VIEWER;
  }
  return profile.role;
};

export const isScorerRole = (role) => SCORER_ROLES.includes(role);

export const getUserProfile = async (uid) => {
  if (!uid) {
    return null;
  }
  return fetchDocument(userDoc(uid));
};

export const createUserProfile = async (user, role = USER_ROLES.VIEWER) => {
  if (!user?.uid) {
    throw new Error("User uid is required to create profile");
  }

  const profile = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userDoc(user.uid), profile, { merge: true });
  return profile;
};

/**
 * Ensure profile exists on first login/register. Does not downgrade existing roles.
 */
export const ensureUserProfile = async (user, defaultRole = USER_ROLES.VIEWER) => {
  const existing = await getUserProfile(user.uid);
  if (existing) {
    return existing;
  }
  return createUserProfile(user, defaultRole);
};

export const upgradeToScorer = async (uid) => {
  if (!uid) throw new Error("uid required");
  await updateDoc(userDoc(uid), { role: USER_ROLES.SCORER, updatedAt: serverTimestamp() });
};

export const subscribeToUserProfile = (uid, onData, onError) => {
  if (!uid) {
    return () => {};
  }
  return subscribeToDocument(userDoc(uid), onData, onError);
};
