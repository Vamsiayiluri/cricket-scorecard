/**
 * Scoring-related persistence helpers.
 * Business rules remain in UI/helpers — this layer only handles Firestore I/O.
 */
import {
  completeMatchById,
  getMatchById,
  updateMatchById,
  updateMatchCurrentInning,
} from "./matchService";
import { scoringMeasure } from "../../utils/scoringDiagnostics";

export const getMatchForScoring = getMatchById;
export const persistMatchScorecard = async (updatedData) =>
  scoringMeasure(
    "firebase.persistMatchScorecard",
    () => updateMatchById(updatedData),
    {
      matchId: updatedData?.matchId,
      innings: updatedData?.scoreCard?.innings?.length,
      currentInning: updatedData?.scoreCard?.currentInning,
    }
  );

export const persistCurrentInning = async (matchId, inningNumber) =>
  scoringMeasure(
    "firebase.persistCurrentInning",
    () => updateMatchCurrentInning(matchId, inningNumber),
    { matchId, inningNumber }
  );

export const persistMatchCompletion = async (updatedData, completionFields) =>
  scoringMeasure(
    "firebase.persistMatchCompletion",
    () => completeMatchById(updatedData, completionFields),
    {
      matchId: updatedData?.matchId,
      resultSummary: completionFields?.resultSummary,
    }
  );
