import { uid } from "uid";
import db from "../firebase-config";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";

import { addMatch } from "../store/slices/matchSlice";
import { useNavigate } from "react-router-dom";

export const saveMatch = async (formData, dispatch, navigate) => {
  try {
    const matchId = uid();

    const matchData = {
      matchId,
      matchDetails: {
        teamA: formData.matchDetails.teamA,
        teamB: formData.matchDetails.teamB,
        location: formData.matchDetails.venue,
        date: formData.matchDetails.dateTime,
      },
      teams: {
        teamA: {
          name: formData.teams.teamA.name,
          players: formData.teams.teamA.players,
        },
        teamB: {
          name: formData.teams.teamB.name,
          players: formData.teams.teamB.players,
        },
      },
      tossDetails: {
        winner: formData.tossDetails.winner,
        decision: formData.tossDetails.decision,
      },
      scoringRules: {
        maxOvers: formData.scoringRules.overs,
        extras: {
          wides: formData.scoringRules.wide,
          noBalls: formData.scoringRules.noBall,
        },
      },
      scoreCard: {},
      notes: formData?.notes || "",
      status: "scheduled",
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: true,
    };

    await setDoc(doc(db, "matches", matchId), matchData);
    dispatch(addMatch(matchData));
    navigate(`/start-match?matchId=${matchId}`);
  } catch (error) {
    console.error("Error saving match:", error);
    throw error;
  }
};

export const updateMatch = async (updatedData) => {
  try {
    const matchRef = doc(db, "matches", updatedData.matchId);
    await updateDoc(matchRef, updatedData);
  } catch (error) {
    console.error("Error updating match:", error);
    throw error;
  }
};
export const updateMatchInnings = async (matchId, innings) => {
  try {
    const matchRef = doc(db, "matches", matchId);

    await updateDoc(matchRef, {
      "scoreCard.currentInning": innings,
    });
  } catch (error) {
    console.error("Error updating match innings:", error);
    throw error;
  }
};

export const getMatch = async (matchId) => {
  try {
    const matchRef = doc(db, "matches", matchId);
    const docSnap = await getDoc(matchRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching match data:", error);
    throw error;
  }
};
