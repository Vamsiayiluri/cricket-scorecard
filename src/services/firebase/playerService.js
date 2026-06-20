import { uid } from "uid";
import { collection, deleteDoc, doc, query, setDoc, updateDoc, where } from "firebase/firestore";
import db from "../../firebase-config";
import { COLLECTIONS } from "./constants";
import { fetchDocument, fetchQuery } from "./firestoreHelpers";

export const PLAYERS_COLLECTION = COLLECTIONS.PLAYERS;

const playerDoc = (playerId) => doc(db, COLLECTIONS.PLAYERS, playerId);

export const createPlayer = async ({ name, role, battingStyle, bowlingStyle, createdBy }) => {
  const playerId = uid();
  const now = new Date();
  const payload = {
    playerId,
    name: name.trim(),
    role: role || "",
    battingStyle: battingStyle || "",
    bowlingStyle: bowlingStyle || "",
    createdBy,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(playerDoc(playerId), payload);
  return payload;
};

export const updatePlayer = async (playerId, { name, role, battingStyle, bowlingStyle }) => {
  const payload = {
    name: name.trim(),
    role: role || "",
    battingStyle: battingStyle || "",
    bowlingStyle: bowlingStyle || "",
    updatedAt: new Date(),
  };
  await updateDoc(playerDoc(playerId), payload);
  return payload;
};

export const deletePlayer = async (playerId) => {
  await deleteDoc(playerDoc(playerId));
};

export const getPlayerById = async (playerId) => fetchDocument(playerDoc(playerId));

export const getUserPlayers = async (createdBy) => {
  const q = query(collection(db, COLLECTIONS.PLAYERS), where("createdBy", "==", createdBy));
  return fetchQuery(q);
};

/** Build a lightweight player reference for embedding in team/match documents. */
export const toPlayerRef = (player) => ({
  playerId: player?.playerId || null,
  name: player?.name || "",
});
