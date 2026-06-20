import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import db from "../../firebase-config";

const COLLECTIONS = {
  MATCH_FOLLOWERS: "matchFollowers",
  NOTIFICATIONS: "notifications",
};

// ── Follow / Unfollow ────────────────────────────────────────────────────────

const followerDocRef = (matchId, uid) =>
  doc(db, COLLECTIONS.MATCH_FOLLOWERS, matchId, "followers", uid);

export const followMatch = async (uid, matchId) => {
  await setDoc(followerDocRef(matchId, uid), {
    uid,
    followedAt: serverTimestamp(),
  });
};

export const unfollowMatch = async (uid, matchId) => {
  await deleteDoc(followerDocRef(matchId, uid));
};

export const getFollowStatus = async (uid, matchId) => {
  if (!uid || !matchId) return false;
  const snap = await getDoc(followerDocRef(matchId, uid));
  return snap.exists();
};

export const getMatchFollowers = async (matchId) => {
  const snap = await getDocs(
    collection(db, COLLECTIONS.MATCH_FOLLOWERS, matchId, "followers")
  );
  return snap.docs.map((d) => d.data().uid).filter(Boolean);
};

// ── Notification CRUD ────────────────────────────────────────────────────────

export const markNotificationRead = async (notifId) => {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notifId), {
    read: true,
    readAt: serverTimestamp(),
  });
};

export const dismissNotification = async (notifId) => {
  await deleteDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notifId));
};

export const markAllNotificationsRead = async (uid) => {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("userId", "==", uid),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) =>
    batch.update(d.ref, { read: true, readAt: serverTimestamp() })
  );
  await batch.commit();
};

// ── Notification generation ──────────────────────────────────────────────────

const NOTIFICATION_TEMPLATES = {
  match_started: (matchTitle) => ({
    title: "Match has started!",
    body: `${matchTitle} is now live. Follow the ball-by-ball action.`,
  }),
  match_completed: (matchTitle) => ({
    title: "Match completed",
    body: `${matchTitle} has finished. Check the final scorecard.`,
  }),
  potm_announced: (matchTitle, extra) => ({
    title: "Player of the Match announced",
    body: `${extra?.playerName || "A player"} has been named Player of the Match in ${matchTitle}.`,
  }),
};

/**
 * Fetch followers for a match, then batch-write one notification per follower.
 * Skips the actor's own uid to avoid self-notification.
 * Uses sessionStorage to prevent duplicate generation in the same browser session.
 */
export const createNotificationsForFollowers = async (
  matchId,
  matchTitle,
  type,
  actorUid,
  extra = {}
) => {
  const sessionKey = `notif_sent_${matchId}_${type}`;
  if (sessionStorage.getItem(sessionKey)) return;

  const followers = await getMatchFollowers(matchId);
  const recipients = followers.filter((uid) => uid !== actorUid);
  if (recipients.length === 0) {
    sessionStorage.setItem(sessionKey, "1");
    return;
  }

  const template = NOTIFICATION_TEMPLATES[type]?.(matchTitle, extra);
  if (!template) return;

  const batch = writeBatch(db);
  recipients.forEach((uid) => {
    const ref = doc(collection(db, COLLECTIONS.NOTIFICATIONS));
    batch.set(ref, {
      userId: uid,
      matchId,
      matchTitle,
      type,
      title: template.title,
      body: template.body,
      read: false,
      createdAt: serverTimestamp(),
    });
  });

  await batch.commit();
  sessionStorage.setItem(sessionKey, "1");
};

// ── Query helpers ────────────────────────────────────────────────────────────

export const buildNotificationsQuery = (uid, maxItems = 50) =>
  query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
    limit(maxItems)
  );
