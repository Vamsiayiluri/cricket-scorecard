import { uid } from "uid";
import { collection, deleteDoc, doc, query, setDoc, updateDoc, where } from "firebase/firestore";
import db from "../../firebase-config";
import { COLLECTIONS } from "./constants";
import { fetchDocument, fetchQuery } from "./firestoreHelpers";

export const TEAMS_COLLECTION = COLLECTIONS.TEAMS;

const teamDoc = (teamId) => doc(db, COLLECTIONS.TEAMS, teamId);

export const createTeam = async ({ name, players, playerRefs, captain, wicketKeeper, createdBy }) => {
  const teamId = uid();
  const now = new Date();
  const payload = {
    teamId,
    name: name.trim(),
    players,
    playerRefs: playerRefs || players.map((n) => ({ playerId: null, name: n })),
    captain: captain || "",
    wicketKeeper: wicketKeeper || "",
    createdBy,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(teamDoc(teamId), payload);
  return payload;
};

export const updateTeam = async (teamId, { name, players, playerRefs, captain, wicketKeeper }) => {
  const payload = {
    name: name.trim(),
    players,
    playerRefs: playerRefs || players.map((n) => ({ playerId: null, name: n })),
    captain: captain || "",
    wicketKeeper: wicketKeeper || "",
    updatedAt: new Date(),
  };
  await updateDoc(teamDoc(teamId), payload);
  return payload;
};

export const deleteTeam = async (teamId) => {
  await deleteDoc(teamDoc(teamId));
};

export const getTeamById = async (teamId) => fetchDocument(teamDoc(teamId));

export const getUserTeams = async (createdBy) => {
  const q = query(collection(db, COLLECTIONS.TEAMS), where("createdBy", "==", createdBy));
  return fetchQuery(q);
};
