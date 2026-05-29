/**
 * Backward-compatible facade for legacy imports.
 * Prefer importing from `src/services/firebase` in new code.
 */
import { addMatch } from "../store/slices/matchSlice";
import {
  createMatch,
  getMatchById,
  updateMatchById,
  updateMatchCurrentInning,
} from "./firebase/matchService";

export const saveMatch = async (formData, dispatch, navigate) => {
  try {
    const matchData = await createMatch(formData);
    dispatch(addMatch(matchData));
    navigate(`/start-match?matchId=${matchData.matchId}`);
  } catch (error) {
    throw error;
  }
};

export const updateMatch = (updatedData) => updateMatchById(updatedData);

export const updateMatchInnings = (matchId, innings) =>
  updateMatchCurrentInning(matchId, innings);

export const getMatch = (matchId) => getMatchById(matchId);
