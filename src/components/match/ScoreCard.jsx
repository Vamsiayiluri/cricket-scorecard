import { Suspense, useEffect, useMemo, useReducer, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  Button,
  Chip,
  Divider,
  Alert,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  canAccessMatch,
  getUserMatchAccessRequest,
  requestMatchAccess,
  MATCH_ACCESS_STATUS,
} from "../../services/firebase/matchAccessService";
import {
  getMatchForScoring,
  persistMatchCompletion,
} from "../../services/firebase/scoringService";
import { scoringLog, scoringWarn } from "../../utils/scoringDiagnostics";
import ScoringActions from "./ScoringActions";
import SelectBowler from "./SelectBowler";
import CurrentOver from "./CurrentOver";
import EndOfInnings from "./EndOfInnings";
import BattingScoreCard from "./BattingScoreCard";
import BowlingScoreCard from "./BowlingScoreCard";
import MatchScoreCard from "./MatchScoreCard";
import AppButton from "../ui/AppButton";
import FallOfWickets from "./FallOfWickets";
import { useScoringPersistence } from "../../hooks/useScoringPersistence";
import { useScoringHistory } from "../../hooks/useScoringHistory";
import AppDialog from "../ui/AppDialog";
import BallTimeline from "./BallTimeline";
import { buildMatchCompletionFields } from "../../utils/matchDisplay";
import {
  getOverHistoryForInning,
  getRecentBallsForInning,
  setTimelineForInning,
} from "../../utils/scorecardTimeline";

const Scorecard = () => {
  // Intentionally uses one-time fetch + local reducer during active scoring.
  // Live document listeners are avoided here to prevent remote overwrites mid-innings.

  const updateBowlerSelectionInInnings = (scoreCard, selectedBowler) => {
    const currentInningIndex = scoreCard.currentInning - 1;
    const updatedInnings = [...scoreCard.innings];
    const inning = { ...updatedInnings[currentInningIndex] };
    const existingBowlers = inning.bowlers || [];
    const bowlerExists = existingBowlers.some(
      (bowler) => bowler.name === selectedBowler,
    );

    const updatedBowlers = existingBowlers.map((bowler) => ({
      ...bowler,
      currentBowler: bowler.name === selectedBowler,
    }));

    if (!bowlerExists && selectedBowler) {
      updatedBowlers.push({
        name: selectedBowler,
        balls: 0,
        overs: 0,
        runs: 0,
        wickets: 0,
        currentBowler: true,
      });
    }

    inning.bowlers = updatedBowlers;
    updatedInnings[currentInningIndex] = inning;
    return updatedInnings;
  };

  const matchReducer = (state, action) => {
    scoringLog("reducer.action", {
      type: action.type,
      currentInning: state?.scoreCard?.currentInning,
    });
    switch (action.type) {
      case "SET_MATCH_DATA":
        return {
          ...state,
          ...action.payload,
        };
      case "UPDATE_CURRENT_BOWLER": {
        const updatedInnings = updateBowlerSelectionInInnings(
          state.scoreCard,
          action.payload.selectedBowler,
        );
        return {
          ...state,
          scoreCard: {
            ...state.scoreCard,
            innings: updatedInnings,
          },
        };
      }
      case "UPDATE_EXISTING_BOWLER": {
        const updatedInnings = updateBowlerSelectionInInnings(
          state.scoreCard,
          action.payload.selectedBowler,
        );
        return {
          ...state,
          scoreCard: {
            ...state.scoreCard,
            innings: updatedInnings,
          },
        };
      }
      case "UPDATE_CURRENT_INNING": {
        const { currentInning } = action.payload;
        return {
          ...state,
          scoreCard: {
            ...state.scoreCard,
            currentInning,
          },
        };
      }

      case "UPDATE_SCORECARD":
        return {
          ...state,
          scoreCard: action.payload,
        };

      default:
        return state;
    }
  };
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [matchData, dispatch] = useReducer(matchReducer, null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessRequest, setAccessRequest] = useState(null); // existing request for this user+match
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [battingTeam, setBattingTeam] = useState(null);
  const [bowlingTeam, setBowlingTeam] = useState(null);
  const [currentInning, setCurrentInning] = useState(null);
  const [extras, setExtras] = useState({
    wide: false,
    noBall: false,
    byes: false,
    legByes: false,
    wicket: false,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [currentOver, setCurrentOver] = useState([]);
  const [isInningsOver, setIsInningsOver] = useState(false);
  const [isEndingInnings, setIsEndingInnings] = useState(false);
  const [isCorrectionDialogOpen, setIsCorrectionDialogOpen] = useState(false);
  const [isEndInningsDialogOpen, setIsEndInningsDialogOpen] = useState(false);
  const [endInningsConfirmed, setEndInningsConfirmed] = useState(false);
  const [completedMatchData, setCompletedMatchData] = useState(null);
  const matchId = searchParams.get("matchId");
  const {
    status: saveStatus,
    lastSavedAt,
    hasPendingWrites,
    hasFailedWrite,
    enqueuePersist,
    retryFailed,
    flushPending,
  } = useScoringPersistence(matchId);
  const { canUndo, canRedo, undoCount, redoCount, pushSnapshot, undo, redo } =
    useScoringHistory();

  useEffect(() => {
    async function fetchMatchData() {
      scoringLog("scorecard.fetch.start", { matchId });

      if (matchId) {
        try {
          const data = await getMatchForScoring(matchId);
          scoringLog("scorecard.fetch.success", {
            matchId,
            hasScorecard: Boolean(data?.scoreCard),
            innings: data?.scoreCard?.innings?.length || 0,
          });

          if (!canAccessMatch(data, user?.uid)) {
            setAccessDenied(true);
            const existingReq = await getUserMatchAccessRequest(matchId, user?.uid).catch(() => null);
            setAccessRequest(existingReq);
            // Still store match data so we can show the match title in the denied screen
            dispatch({ type: "SET_MATCH_DATA", payload: data });
            return;
          }

          dispatch({
            type: "SET_MATCH_DATA",
            payload: data,
          });
        } catch (error) {
          scoringWarn("scorecard.fetch.error", {
            matchId,
            error: error?.message || String(error),
          });
        }
      }
    }

    fetchMatchData();
  }, [matchId]);
  useEffect(() => {
    const shouldWarn = hasPendingWrites || hasFailedWrite;
    if (!shouldWarn) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasFailedWrite, hasPendingWrites]);
  useEffect(() => {
    if (matchData?.scoreCard?.innings?.length > 0) {
      const { scoreCard, teams } = matchData || {};
      const currentInning = scoreCard.innings[scoreCard.currentInning - 1];

      const battingTeam =
        currentInning.team === "teamA" ? teams.teamA : teams.teamB;
      setBattingTeam(battingTeam);

      const bowlingTeam =
        currentInning.team === "teamA" ? teams.teamB : teams.teamA;
      setBowlingTeam(bowlingTeam);
      setCurrentInning(currentInning);
      // const totalOvers = overs + balls / 6;
      // setTotalOvers(totalOvers);
    }
  }, [matchData]);
  const getWicketLimit = (scoreCard) => {
    const inning = scoreCard?.innings?.[scoreCard.currentInning - 1];
    const battingPlayers = inning?.team
      ? matchData?.teams?.[inning.team]?.players
      : null;
    return Array.isArray(battingPlayers) && battingPlayers.length > 1
      ? battingPlayers.length - 1
      : 10;
  };

  const isTargetReached = (scoreCard) => {
    if (scoreCard?.currentInning !== 2) {
      return false;
    }
    const firstInningRuns = scoreCard?.innings?.[0]?.runs;
    const secondInningRuns = scoreCard?.innings?.[1]?.runs;
    return (
      typeof firstInningRuns === "number" && secondInningRuns > firstInningRuns
    );
  };

  const isSecondInningsComplete = (scoreCard) => {
    if (scoreCard?.currentInning !== 2) {
      return false;
    }
    const inning = scoreCard?.innings?.[1];
    const maxOvers = matchData?.scoringRules?.maxOvers;
    return (
      isTargetReached(scoreCard) ||
      (typeof maxOvers === "number" && (inning?.overs || 0) >= maxOvers) ||
      (inning?.wickets || 0) >= getWicketLimit(scoreCard)
    );
  };

  const handleMatchCompletion = async (explicitPayload) => {
    if (isEndingInnings) {
      return;
    }
    setIsEndingInnings(true);
    try {
      const payload = explicitPayload || matchData;
      const completionFields = buildMatchCompletionFields(payload);
      const completedPayload = {
        ...payload,
        ...completionFields,
      };
      await persistMatchCompletion(completedPayload, completionFields);
      dispatch({
        type: "SET_MATCH_DATA",
        payload: completedPayload,
      });
      setCompletedMatchData(completedPayload);
      setShowScoreCard(true);
      setIsInningsOver(false);
    } catch (error) {
      scoringWarn("match.completion.persist_failed", {
        matchId: matchData?.matchId,
        error: error?.message || String(error),
      });
    } finally {
      setIsEndingInnings(false);
    }
  };

  const handleEndOfInnings = async (explicitPayload) => {
    if (isEndingInnings) {
      return;
    }
    setIsEndingInnings(true);
    scoringLog("innings.end.requested", {
      matchId: matchData?.matchId,
      currentInning: matchData?.scoreCard?.currentInning,
    });
    try {
      const payload = explicitPayload || matchData;
      if (payload?.scoreCard?.currentInning === 2) {
        await handleMatchCompletion(payload);
        return;
      }
      enqueuePersist(payload);
      await flushPending();
      setIsInningsOver(true);
    } catch (error) {
      scoringWarn("innings.end.persist_failed", {
        matchId: matchData?.matchId,
        error: error?.message || String(error),
      });
    } finally {
      setIsEndingInnings(false);
    }
  };
  const applyTimelineMeta = (nextScoreCard, meta) => {
    if (!meta?.ballSummary) {
      return nextScoreCard;
    }
    const inningIndex = (nextScoreCard?.currentInning || 1) - 1;
    const inningRecent = [
      ...getRecentBallsForInning(nextScoreCard, inningIndex),
      meta.ballSummary,
    ].slice(-12);
    const nextOverBalls = Array.isArray(meta?.overBalls) ? meta.overBalls : [];
    const inningOvers = getOverHistoryForInning(nextScoreCard, inningIndex);
    if (meta?.overLegalBalls === 6) {
      inningOvers.push(nextOverBalls);
    }

    return setTimelineForInning(
      nextScoreCard,
      inningIndex,
      inningRecent,
      inningOvers.slice(-10),
    );
  };

  const createSnapshot = () => ({
    scoreCard: matchData?.scoreCard,
    currentOver,
    extras,
    currentInning: matchData?.scoreCard?.currentInning || 1,
  });

  const onBeforeBallCommit = () => {
    if (!matchData?.scoreCard) {
      return;
    }
    pushSnapshot(createSnapshot());
  };

  const applyRestoredSnapshot = async (snapshot) => {
    if (!snapshot?.scoreCard || !matchData) {
      return;
    }
    dispatch({
      type: "UPDATE_SCORECARD",
      payload: snapshot.scoreCard,
    });
    setCurrentOver(snapshot.currentOver || []);
    setExtras(
      snapshot.extras || {
        wide: false,
        noBall: false,
        byes: false,
        legByes: false,
        wicket: false,
      },
    );
    const nextMatchData = {
      ...matchData,
      scoreCard: snapshot.scoreCard,
    };
    enqueuePersist(nextMatchData);
  };

  const handleUndo = async () => {
    if (!matchData?.scoreCard || isEndingInnings || saveStatus === "saving") {
      return;
    }
    const previous = undo(createSnapshot(), matchData.scoreCard.currentInning);
    if (!previous) {
      return;
    }
    await applyRestoredSnapshot(previous);
  };

  const handleRedo = async () => {
    if (!matchData?.scoreCard || isEndingInnings || saveStatus === "saving") {
      return;
    }
    const next = redo(createSnapshot(), matchData.scoreCard.currentInning);
    if (!next) {
      return;
    }
    await applyRestoredSnapshot(next);
  };

  const handleLastBallCorrection = async () => {
    await handleUndo();
    setIsCorrectionDialogOpen(false);
  };

  const updateMatchData = async (scoreCard, commitMeta) => {
    const scoreCardWithTimeline = applyTimelineMeta(scoreCard, commitMeta);
    const nextMatchData = {
      ...matchData,
      scoreCard: scoreCardWithTimeline,
    };
    const nextInning =
      scoreCardWithTimeline?.innings?.[
        scoreCardWithTimeline?.currentInning - 1
      ];

    scoringLog("score.update.received", {
      currentInning: scoreCard?.currentInning,
      balls: nextInning?.balls,
      wickets: nextInning?.wickets,
    });
    dispatch({
      type: "UPDATE_SCORECARD",
      payload: scoreCardWithTimeline, // Pass the updated scoreCard here
    });

    if (isSecondInningsComplete(scoreCardWithTimeline)) {
      scoringLog("match.completion.triggered", {
        currentInning: scoreCardWithTimeline?.currentInning,
        runs: nextInning?.runs,
        wickets: nextInning?.wickets,
      });
      await handleMatchCompletion(nextMatchData);
      setExtras({
        wide: false,
        noBall: false,
        byes: false,
        legByes: false,
        wicket: false,
      });
      return;
    }

    enqueuePersist(nextMatchData);

    let compledBalls = nextInning?.balls || 0;
    const overCompleted = compledBalls % 6 === 0 && compledBalls !== 0;
    const maxOvers = matchData.scoringRules.maxOvers;

    if (
      overCompleted &&
      !extras.wide &&
      !extras.noBall &&
      (nextInning?.overs || 0) < maxOvers
    ) {
      scoringLog("over.completed.dialog.open", {
        currentInning: scoreCard?.currentInning,
        completedBalls: compledBalls,
      });
      setIsDialogOpen(true);
      if (commitMeta?.overLegalBalls === 6) {
        setCurrentOver([]);
      }
    } else if (
      (nextInning?.overs || 0) >= maxOvers ||
      (nextInning?.wickets || 0) >= getWicketLimit(scoreCardWithTimeline)
    ) {
      scoringLog("innings.end.triggered", {
        overs: nextInning?.overs,
        wickets: nextInning?.wickets,
        maxOvers,
      });
      // dispatch({
      //   type: "UPDATE_CURRENT_INNING",
      //   payload: { currentInning: 2 },
      // });
      await handleEndOfInnings(nextMatchData);
    }
    setExtras({
      wide: false,
      noBall: false,
      byes: false,
      legByes: false,
      wicket: false,
    });
  };
  const saveStatusLabel =
    saveStatus === "saving"
      ? "Saving..."
      : saveStatus === "saved"
        ? hasPendingWrites
          ? "Saving latest..."
          : "Saved"
        : saveStatus === "failed"
          ? "Save failed - pending retry"
          : "Not saved yet";

  const saveStatusColor =
    saveStatus === "saving"
      ? "warning"
      : saveStatus === "saved"
        ? "success"
        : saveStatus === "failed"
          ? "error"
          : "default";
  const currentInningIndex = (matchData?.scoreCard?.currentInning || 1) - 1;
  const recentBalls = useMemo(
    () => getRecentBallsForInning(matchData?.scoreCard, currentInningIndex),
    [currentInningIndex, matchData?.scoreCard],
  );
  const overHistory = useMemo(
    () => getOverHistoryForInning(matchData?.scoreCard, currentInningIndex),
    [currentInningIndex, matchData?.scoreCard],
  );

  const calculateRunRate = (totalRuns, balls) => {
    const totalOvers = balls / 6;
    return totalOvers > 0 ? (totalRuns / totalOvers).toFixed(2) : 0;
  };

  const calculateRequiredRunRate = (totalRuns, balls) => {
    const runsLeft = matchData.scoreCard.innings[0].runs + 1 - totalRuns;
    const oversLeft = matchData.scoringRules.maxOvers - balls / 6;
    return oversLeft > 0 ? (runsLeft / oversLeft).toFixed(2) : 0;
  };
  const getTargetText = (targetRuns, runsScored, maxOvers, ballsBowled) => {
    const runsRequired = targetRuns + 1 - runsScored;

    const ballsRemaining = maxOvers * 6 - ballsBowled;

    return `${runsRequired} required off ${ballsRemaining} balls`;
  };
  const updateThisOver = (currentOverBowled) => {
    setCurrentOver(currentOverBowled);
  };

  const updateNewBowler = (selectedBowler) => {
    scoringLog("bowler.change.requested", {
      selectedBowler,
      currentInning: matchData?.scoreCard?.currentInning,
    });
    const bowler = currentInning.bowlers.find(
      (bowler) => bowler.name === selectedBowler,
    );
    if (bowler) {
      dispatch({
        type: "UPDATE_EXISTING_BOWLER",
        payload: { selectedBowler },
      });
    } else if (selectedBowler) {
      dispatch({
        type: "UPDATE_CURRENT_BOWLER",
        payload: { selectedBowler },
      });
    }
    if (selectedBowler && matchData?.scoreCard) {
      const nextScoreCard = {
        ...matchData.scoreCard,
        innings: updateBowlerSelectionInInnings(
          matchData.scoreCard,
          selectedBowler,
        ),
      };
      enqueuePersist({
        ...matchData,
        scoreCard: nextScoreCard,
      });
    }
    setCurrentOver([]);
    setIsDialogOpen(false);
  };
  const handleRequestAccess = async () => {
    if (!matchId || !user?.uid || submittingRequest) return;
    setSubmittingRequest(true);
    try {
      await requestMatchAccess({
        matchId,
        matchTitle: matchData?.matchDetails
          ? `${matchData.matchDetails.teamA} vs ${matchData.matchDetails.teamB}`
          : matchId,
        matchOwnerUid: matchData?.createdBy || "",
        requestedBy: user.uid,
        requestedByName: user.displayName || "",
        requestedByEmail: user.email || "",
      });
      setAccessRequest({ status: MATCH_ACCESS_STATUS.PENDING });
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (accessDenied) {
    const isPending = accessRequest?.status === MATCH_ACCESS_STATUS.PENDING;
    const isRejected = accessRequest?.status === MATCH_ACCESS_STATUS.REJECTED;
    const matchTitle = matchData?.matchDetails
      ? `${matchData.matchDetails.teamA} vs ${matchData.matchDetails.teamB}`
      : "this match";

    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 520, mx: "auto", mt: 6 }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
          {isPending ? (
            <HourglassEmptyOutlinedIcon sx={{ fontSize: 44, color: "warning.main", mb: 1.5 }} />
          ) : (
            <LockOutlinedIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1.5 }} />
          )}
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.75 }}>
            {isPending ? "Request Pending" : "Access Restricted"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {isPending
              ? `Your request to score "${matchTitle}" has been submitted. The match owner will review it.`
              : isRejected
              ? `Your previous access request for "${matchTitle}" was not approved.`
              : `Only the match creator and approved scorers can score "${matchTitle}".`}
          </Typography>
          <Stack spacing={1.5} alignItems="center">
            {!isPending && (
              <Button
                variant="contained"
                onClick={handleRequestAccess}
                disabled={submittingRequest}
              >
                {submittingRequest ? "Sending…" : isRejected ? "Request Again" : "Request Access"}
              </Button>
            )}
            {isPending && (
              <Chip
                label="Awaiting approval"
                sx={{ bgcolor: "rgba(245,158,11,0.15)", color: "warning.dark", fontWeight: 700 }}
              />
            )}
            <Button
              variant="outlined"
              onClick={() => navigate(`/scorecard/${matchId}`)}
            >
              View Scorecard
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {matchData && currentInning && !isInningsOver && !showScoreCard && (
        <Suspense fallback={<div>Loading component...</div>}>
          <SelectBowler
            bowlingTeam={bowlingTeam}
            isDialogOpen={isDialogOpen}
            scoreCard={matchData.scoreCard}
            setIsDialogOpen={setIsDialogOpen}
            updateNewBowler={updateNewBowler}
          ></SelectBowler>

          <Grid
            container
            spacing={3}
            sx={{
              marginTop: "8px",
              marginLeft: "4px",
            }}
          >
            <Grid container spacing={3}>
              {matchData.scoreCard?.currentInning === 2 && (
                <Grid
                  item
                  xs={12}
                  sx={{
                    p: "0 !important",
                    m: 0,
                  }}
                >
                  <Stack
                    alignItems="flex-end"
                    sx={{
                      marginBottom: "12px",
                      marginRight: "16px",
                      marginTop: "0px",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => {
                        setShowScoreCard(true);
                      }}
                    >
                      View Scorecard
                    </Button>
                  </Stack>
                </Grid>
              )}
              <Grid container spacing={3} sx={{ mx: 0, width: "100%" }}>
                {/* BROADCAST TELEMETRY OVERLAY CARD */}
                <Grid item xs={12} md={5} lg={4}>
                  <Paper
                    sx={{
                      p: 3,
                      height: "100%",
                      position: "relative",
                      overflow: "hidden",
                      background: (theme) =>
                        theme.palette.mode === "dark"
                          ? "linear-gradient(135deg, #101827 0%, #0b1220 100%)"
                          : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      boxShadow: "none",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: 4,
                        height: "100%",
                        bgcolor: "primary.main",
                        boxShadow: "none",
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 3 }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "text.secondary",
                        }}
                      >
                        Live Scoreboard Overlay
                      </Typography>
                      <Chip
                        size="small"
                        label="ACTIVE"
                        sx={{
                          bgcolor: "rgba(34, 197, 94, 0.15)",
                          color: "#22C55E",
                          borderColor: "rgba(34, 197, 94, 0.3)",
                          border: "1px solid",
                          fontWeight: 800,
                          fontSize: "0.65rem",
                        }}
                        className="live-pulse"
                      />
                    </Stack>

                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        color: "text.secondary",
                        letterSpacing: "-0.01em",
                        textTransform: "uppercase",
                      }}
                    >
                      {battingTeam.name}
                    </Typography>

                    <Stack
                      direction="row"
                      alignItems="baseline"
                      spacing={1}
                      sx={{ mt: 1.5, mb: 2 }}
                    >
                      <Typography
                        variant="h1"
                        sx={{
                          fontSize: { xs: "2.5rem", md: "3.2rem" },
                          fontWeight: 900,
                          color: "text.primary",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {currentInning.runs}/{currentInning.wickets}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 600,
                          ml: 1.5,
                        }}
                      >
                        in {currentInning.overs.toFixed(1)} Overs
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.025)"
                            : "rgba(15,23,42,0.025)",
                        border: "1px solid",
                        borderColor: "divider",
                        mb: 3,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={3}
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            Run Rate
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: 800, color: "text.primary", mt: 0.5 }}
                          >
                            {calculateRunRate(
                              currentInning.runs,
                              currentInning.balls,
                            )}
                          </Typography>
                        </Box>

                        {matchData.scoreCard?.currentInning === 2 && (
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                color: "text.secondary",
                                fontWeight: 700,
                                textTransform: "uppercase",
                              }}
                            >
                              Req. Run Rate
                            </Typography>
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 800,
                                color: "#8B5CF6",
                                mt: 0.5,
                              }}
                            >
                              {calculateRequiredRunRate(
                                currentInning.runs,
                                currentInning.balls,
                              )}
                            </Typography>
                          </Box>
                        )}
                      </Stack>

                      <Divider
                        sx={{ my: 1.5, borderColor: "divider" }}
                      />

                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          color: "text.secondary",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          mb: 0.5,
                        }}
                      >
                        Extras
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.primary", fontWeight: 600 }}
                      >
                        {currentInning.extras[0].total || 0} Total{" "}
                        <span
                          style={{
                            color: "#94A3B8",
                            fontWeight: 500,
                            fontSize: "0.8rem",
                          }}
                        >
                          (Wd: {currentInning.extras[0].wides || 0}, Nb:{" "}
                          {currentInning.extras[0].noBalls || 0}, B:{" "}
                          {currentInning.extras[0].byes || 0}, Lb:{" "}
                          {currentInning.extras[0].legByes || 0})
                        </span>
                      </Typography>
                    </Box>

                    {matchData.scoreCard?.currentInning === 2 && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          bgcolor: "rgba(108, 99, 255, 0.08)",
                          border: "1px solid rgba(108, 99, 255, 0.2)",
                          mb: 3,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#8b84ff",
                            fontWeight: 700,
                            textAlign: "center",
                          }}
                        >
                          {getTargetText(
                            matchData.scoreCard.innings[0].runs,
                            currentInning.runs,
                            matchData.scoringRules.maxOvers,
                            currentInning.balls,
                          )}
                        </Typography>
                      </Box>
                    )}

                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: "text.secondary",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        mb: 1,
                        letterSpacing: "0.05em",
                      }}
                    >
                      This Over Deliveries
                    </Typography>
                    <CurrentOver currentOver={currentOver}></CurrentOver>
                  </Paper>
                </Grid>

                {/* OPERATIONAL CONSOLE SCORER CONTROL PANEL */}
                <Grid item xs={12} md={7} lg={8}>
                  <Paper
                    sx={{
                      p: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      boxShadow: "none",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      spacing={2.5}
                      sx={{ mb: 3 }}
                    >
                      <Stack spacing={1.25} sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography
                          variant="h3"
                          sx={{ fontWeight: 800, color: "text.primary" }}
                        >
                          Match Operations Console
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Chip
                            size="small"
                            color={saveStatusColor}
                            label={saveStatusLabel}
                            role="status"
                            aria-live="polite"
                            sx={{
                              fontWeight: 800,
                              textTransform: "uppercase",
                              fontSize: "0.675rem",
                            }}
                          />
                          {saveStatus === "saved" && lastSavedAt ? (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 500 }}
                            >
                              {`Synced at ${new Date(lastSavedAt).toLocaleTimeString()}`}
                            </Typography>
                          ) : null}
                          {saveStatus === "failed" ? (
                            <AppButton
                              size="small"
                              onClick={retryFailed}
                              sx={{ minHeight: 28, py: 0.5 }}
                            >
                              Retry Save
                            </AppButton>
                          ) : null}
                        </Stack>
                        {saveStatus === "failed" && (
                          <Alert severity="error" sx={{ mt: 1, py: 0.25 }}>
                            Score update is saved locally. Retry when the
                            connection is stable.
                          </Alert>
                        )}
                      </Stack>

                      <AppButton
                        variant="outlined"
                        onClick={() => setIsEndInningsDialogOpen(true)}
                        disabled={isEndingInnings || saveStatus === "saving"}
                        sx={{
                          borderColor: "rgba(239, 68, 68, 0.4)",
                          color: "#EF4444",
                          "&:hover": {
                            borderColor: "#EF4444",
                            bgcolor: "rgba(239, 68, 68, 0.06)",
                          },
                        }}
                      >
                        {`End Innings ${matchData.scoreCard.currentInning}`}
                      </AppButton>
                    </Stack>

                    <Divider
                      sx={{ mb: 2, borderColor: "divider" }}
                    />

                    {/* Operational Toolbar */}
                    <Stack
                      direction="row"
                      spacing={1.2}
                      sx={{ mb: 3 }}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <AppButton
                        size="small"
                        variant="outlined"
                        disabled={
                          !canUndo || isEndingInnings || saveStatus === "saving"
                        }
                        onClick={handleUndo}
                      >
                        {`Undo (${undoCount})`}
                      </AppButton>
                      <AppButton
                        size="small"
                        variant="outlined"
                        disabled={
                          !canRedo || isEndingInnings || saveStatus === "saving"
                        }
                        onClick={handleRedo}
                      >
                        {`Redo (${redoCount})`}
                      </AppButton>
                      <AppButton
                        size="small"
                        variant="outlined"
                        color="warning"
                        disabled={
                          !canUndo || isEndingInnings || saveStatus === "saving"
                        }
                        onClick={() => setIsCorrectionDialogOpen(true)}
                        sx={{
                          borderColor: "rgba(245, 158, 11, 0.4)",
                          color: "#F59E0B",
                          "&:hover": {
                            borderColor: "#F59E0B",
                            bgcolor: "rgba(245, 158, 11, 0.06)",
                          },
                        }}
                      >
                        Correct Last Ball
                      </AppButton>
                    </Stack>

                    {/* Dynamic Score input fields */}
                    <ScoringActions
                      matchData={matchData}
                      battingTeam={battingTeam}
                      bowlingTeam={bowlingTeam}
                      updateMatchData={updateMatchData}
                      updateThisOver={updateThisOver}
                      currentOver={currentOver}
                      extras={extras}
                      setExtras={setExtras}
                      setCurrentOver={setCurrentOver}
                      scoringLocked={isEndingInnings}
                      onBeforeBallCommit={onBeforeBallCommit}
                    />

                    {/* Over Timeline Node progressions */}
                    <Box sx={{ mt: 3.5 }}>
                      <BallTimeline
                        recentBalls={recentBalls}
                        overHistory={overHistory}
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <BattingScoreCard
                  battingTeam={battingTeam.name}
                  currentInning={currentInning}
                ></BattingScoreCard>
                <Box sx={{ mt: 1.5 }}>
                  <FallOfWickets fallOfWickets={currentInning.fallOfWickets} />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <BowlingScoreCard
                  bowlingTeam={bowlingTeam.name}
                  currentInning={currentInning}
                ></BowlingScoreCard>
              </Grid>
            </Grid>
          </Grid>
        </Suspense>
      )}
      {isInningsOver && !showScoreCard && (
        <>
          <EndOfInnings
            matchId={matchData.matchId}
            isInningsOver={isInningsOver}
            battingTeam={battingTeam}
            bowlingTeam={bowlingTeam}
            currentInning={currentInning}
            setIsInningsOver={setIsInningsOver}
            inningsNumber={matchData.scoreCard?.currentInning || 1}
          ></EndOfInnings>
        </>
      )}
      {showScoreCard && !isInningsOver && (
        <>
          {" "}
          <MatchScoreCard
            showScoreCard={showScoreCard}
            setShowScoreCard={setShowScoreCard}
            matchData={completedMatchData || matchData}
          ></MatchScoreCard>
        </>
      )}
      <AppDialog
        open={isEndInningsDialogOpen}
        onClose={() => { setIsEndInningsDialogOpen(false); setEndInningsConfirmed(false); }}
        title="End Innings — Are You Sure?"
        actions={
          <>
            <Button onClick={() => { setIsEndInningsDialogOpen(false); setEndInningsConfirmed(false); }}>
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              disabled={!endInningsConfirmed || isEndingInnings}
              onClick={async () => {
                await handleEndOfInnings();
                setIsEndInningsDialogOpen(false);
                setEndInningsConfirmed(false);
              }}
            >
              {isEndingInnings ? "Ending…" : "End Innings"}
            </Button>
          </>
        }
      >
        <Typography variant="body2" sx={{ mt: 1, mb: 1.5 }}>
          This will close the current innings and cannot be undone. Make sure all balls in the
          current over have been recorded correctly.
        </Typography>
        <Box sx={{ p: 1.5, border: "1px solid", borderColor: "warning.main", borderRadius: 1, bgcolor: "rgba(245,158,11,0.06)" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={endInningsConfirmed}
                onChange={(e) => setEndInningsConfirmed(e.target.checked)}
                color="error"
                sx={{ p: 1 }}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                I confirm this innings is complete
              </Typography>
            }
            sx={{ m: 0 }}
          />
        </Box>
      </AppDialog>
      <AppDialog
        open={isCorrectionDialogOpen}
        onClose={() => setIsCorrectionDialogOpen(false)}
        title="Correct Last Delivery"
        actions={
          <>
            <Button onClick={() => setIsCorrectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              color="warning"
              variant="contained"
              onClick={handleLastBallCorrection}
            >
              Confirm Correction
            </Button>
          </>
        }
      >
        <Typography variant="body2" sx={{ mt: 1 }}>
          This will undo only the most recent delivery in the current innings
          and persist the corrected score.
        </Typography>
      </AppDialog>
    </Box>
  );
};

export default Scorecard;
