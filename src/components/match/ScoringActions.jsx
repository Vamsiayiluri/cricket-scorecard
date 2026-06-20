/* eslint-disable react/prop-types, react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Chip,
  Grid,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  Button,
} from "@mui/material";
import {
  handleExtraChange,
  updateScoreCard,
} from "../../helpers/updateScorecard";
import InfoIcon from "@mui/icons-material/Info";
import SelectBatsman from "./Selectbatsman";
import { scoringLog } from "../../utils/scoringDiagnostics";

/* ─── Boundary flash classes ─── */
const BOUNDARY_FLASH_MS = 700;

const ScorecardActions = ({
  matchData,
  battingTeam,
  bowlingTeam,
  updateMatchData,
  updateThisOver,
  currentOver,
  extras,
  setExtras,
  setCurrentOver,
  scoringLocked = false,
  onBeforeBallCommit,
}) => {
  const [updatedScoreCard, setUpdatedScoreCard] = useState(null);
  const [runs, setRuns] = useState();
  const [isWicketDialogOpen, setIsWicketDialogOpen] = useState(false);
  const [isCommittingBall, setIsCommittingBall] = useState(false);
  const [lastActionKey, setLastActionKey] = useState("");
  const [lastActionAt, setLastActionAt] = useState(0);
  const [flashScore, setFlashScore] = useState(null); // score that just fired

  /* Trigger boundary celebration glow briefly */
  const triggerFlash = useCallback((score) => {
    setFlashScore(score);
    setTimeout(() => setFlashScore(null), BOUNDARY_FLASH_MS);
  }, []);

  const handleExtrasChange = (name, value) => {
    if (isCommittingBall || isWicketDialogOpen || scoringLocked) return;
    scoringLog("extras.toggle", { name, checked: value });
    const mockEvent = { target: { name, checked: value } };
    handleExtraChange(mockEvent, setExtras);
  };

  const getActionKey = (runsValue) =>
    `${runsValue}|${extras.wide}|${extras.noBall}|${extras.byes}|${extras.legByes}|${extras.wicket}`;

  const formatBallSummary = (runs, extras, isFreeHit) => {
    let summary = runs === 0 && extras.wicket ? "" : runs.toString();
    if (extras.wide)    summary += "wd";
    if (extras.noBall)  summary += "nb";
    if (extras.byes)    summary += "b";
    if (extras.legByes) summary += "lb";
    if (extras.wicket)  summary += "W";
    // Mark free-hit deliveries (not no-balls themselves, which trigger the next fh)
    if (isFreeHit && !extras.noBall) summary += "fh";
    return summary.trim();
  };

  const isLegalBallSummary = (summary = "") =>
    !summary.includes("wd") && !summary.includes("nb");

  const countLegalBalls = (balls = []) =>
    balls.filter((ball) => isLegalBallSummary(ball)).length;

  useEffect(() => {
    updateThisOver(currentOver);
  }, [currentOver]);

  const handleRunClick = async (scoreCard, type, score) => {
    if (isCommittingBall || isWicketDialogOpen || scoringLocked) return;
    const now = Date.now();
    const actionKey = getActionKey(score);
    if (actionKey === lastActionKey && now - lastActionAt < 200) {
      scoringLog("ball.duplicate.ignored", { actionKey });
      return;
    }
    setLastActionKey(actionKey);
    setLastActionAt(now);
    setIsCommittingBall(true);

    /* Trigger visual flash for boundary / wicket */
    if (score === 4 || score === 6 || extras.wicket) {
      triggerFlash(extras.wicket ? "W" : score);
    }

    try {
      scoringLog("ball.input", {
        type,
        score,
        extras,
        currentInning: matchData?.scoreCard?.currentInning,
      });
      if (!extras.wicket) {
        const ballSummary = formatBallSummary(score, extras, isFreeHit);
        const nextOverBalls = Array.isArray(currentOver)
          ? [...currentOver, ballSummary]
          : [ballSummary];
        const overLegalBalls = countLegalBalls(nextOverBalls);
        onBeforeBallCommit?.();
        setCurrentOver((prev) =>
          Array.isArray(prev) ? [...prev, ballSummary] : [ballSummary]
        );
        scoreCard = await updateScoreCard(scoreCard, type, {
          runs: score,
          extras,
          rules: matchData.scoringRules.extras,
        });
        scoringLog("ball.applied", {
          score,
          extras,
          inningRuns: scoreCard?.innings?.[scoreCard?.currentInning - 1]?.runs,
          inningBalls: scoreCard?.innings?.[scoreCard?.currentInning - 1]?.balls,
        });
        updateMatchData(scoreCard, {
          actionType: "ball",
          runs: score,
          extras,
          ballSummary,
          overBalls: nextOverBalls,
          overLegalBalls,
          isLegalBall: isLegalBallSummary(ballSummary),
          isWicket: false,
        });
        setExtras({ wide: false, noBall: false, byes: false, legByes: false, wicket: false });
        return;
      }

      if (extras.wicket) {
        onBeforeBallCommit?.();
        setRuns(score);
        setIsWicketDialogOpen(true);
        setUpdatedScoreCard(matchData.scoreCard);
      }
    } finally {
      setIsCommittingBall(false);
    }
  };

  const swapStrikers = (striker, nonStriker) => {
    striker.isNonStriker = !striker.isNonStriker;
    nonStriker.isNonStriker = !nonStriker.isNonStriker;
  };

  const updateWicketAndNewBatsman = async (scoreCard) => {
    scoringLog("wicket.confirmed", { runs, extras, currentInning: scoreCard?.currentInning });
    const ballSummary = formatBallSummary(runs, extras, isFreeHit);
    const nextOverBalls = Array.isArray(currentOver)
      ? [...currentOver, ballSummary]
      : [ballSummary];
    const overLegalBalls = countLegalBalls(nextOverBalls);
    setCurrentOver((prev) =>
      Array.isArray(prev) ? [...prev, ballSummary] : [ballSummary]
    );
    const inning = scoreCard.innings[scoreCard.currentInning - 1];
    const striker    = inning.batsmen.find((p) => !p.isOut && !p.isNonStriker);
    const nonStriker = inning.batsmen.find((p) => !p.isOut && p.isNonStriker);
    const bowler     = inning.bowlers.find((b) => b.currentBowler);
    if (bowler.balls > 0 && bowler.balls % 6 === 0 && extras.wicket) {
      bowler.currentBowler = false;
      swapStrikers(striker, nonStriker);
    }
    updateMatchData({ ...scoreCard }, {
      actionType: "wicket",
      runs,
      extras,
      ballSummary,
      overBalls: nextOverBalls,
      overLegalBalls,
      isLegalBall: isLegalBallSummary(ballSummary),
      isWicket: true,
    });
    setIsCommittingBall(false);
  };

  const extraTypes = [
    { name: "wide",    label: "Wide (Wd)",      color: "#22C55E", activeBg: "rgba(34, 197, 94, 0.12)" },
    { name: "noBall",  label: "No Ball (Nb)",   color: "#22C55E", activeBg: "rgba(34, 197, 94, 0.12)" },
    { name: "byes",    label: "Byes (B)",        color: "#F59E0B", activeBg: "rgba(245, 158, 11, 0.12)" },
    { name: "legByes", label: "Leg Byes (Lb)",  color: "#F59E0B", activeBg: "rgba(245, 158, 11, 0.12)" },
    { name: "wicket",  label: "Wicket (W)",      color: "#EF4444", activeBg: "rgba(239, 68, 68, 0.15)" },
  ];

  const isFreeHit = Boolean(matchData?.scoreCard?.isFreeHit);

  const isLocked = isCommittingBall || isWicketDialogOpen || scoringLocked;

  const handleRunKeyDown = (event, score) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    if (!isLocked) {
      handleRunClick(matchData.scoreCard, "ADD_RUNS", score);
    }
  };

  /* ─── Helper: get run-pad gradient & glow per score ─── */
  const getPadStyle = (score) => {
    if (score === 4) return {
      background: "linear-gradient(135deg, #38BDF8 0%, #22C55E 100%)",
      boxShadow: flashScore === 4
        ? "0 0 0 3px rgba(56,189,248,0.5), 0 0 30px rgba(56,189,248,0.6)"
        : "0 8px 20px rgba(56, 189, 248, 0.25)",
      color: "#F8FAFC",
    };
    if (score === 6) return {
      background: "linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)",
      boxShadow: flashScore === 6
        ? "0 0 0 3px rgba(139,92,246,0.5), 0 0 35px rgba(139,92,246,0.7)"
        : "0 8px 20px rgba(108, 99, 255, 0.3)",
      color: "#F8FAFC",
    };
    return {
      background: (theme) =>
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.035)"
          : "rgba(15, 23, 42, 0.035)",
      boxShadow: "none",
      color: undefined,
      border: "1px solid",
      borderColor: "divider",
    };
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Free Hit banner */}
      {isFreeHit && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 1,
            bgcolor: "rgba(245, 158, 11, 0.08)",
            border: "2px solid rgba(245, 158, 11, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Chip
            size="small"
            label="FREE HIT"
            sx={{
              bgcolor: "#F59E0B",
              color: "#fff",
              fontWeight: 800,
              fontSize: "0.7rem",
              flexShrink: 0,
            }}
          />
          <Typography variant="caption" sx={{ color: "#D97706", fontWeight: 600 }}>
            Next legal delivery is a FREE HIT — batsman cannot be dismissed off
            the bowler&apos;s delivery (run-outs still apply)
          </Typography>
        </Box>
      )}

      {/* Wicket banner flash overlay */}
      {flashScore === "W" && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 9999,
            background: "radial-gradient(ellipse at center, rgba(239,68,68,0.18) 0%, transparent 70%)",
            animation: "fadeIn 0.15s ease, fadeOut 0.4s 0.3s ease forwards",
            "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
            "@keyframes fadeOut": { from: { opacity: 1 }, to: { opacity: 0 } },
          }}
        />
      )}

      <Grid container spacing={3}>
        {/* ── EXTRAS PILLS ── */}
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
              Active Extras
            </Typography>
            <Tooltip title="Configure extra categories before submitting runs." placement="right">
              <IconButton size="small" sx={{ color: "text.secondary" }}>
                <InfoIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {extraTypes.map((type) => {
              const isActive = extras[type.name];
              return (
                <Button
                  key={type.name}
                  onClick={() => handleExtrasChange(type.name, !isActive)}
                  disabled={isLocked}
                  aria-pressed={isActive}
                  sx={{
                    borderRadius: 1, // inherits 8px
                    px: 1.5,
                    py: 0.65,
                    minHeight: { xs: 38, sm: 34 },
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.01em",
                    transition: "transform 120ms ease, background-color 120ms ease",
                    bgcolor: (theme) =>
                      isActive
                        ? type.activeBg
                        : theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.025)"
                        : "rgba(15, 23, 42, 0.035)",
                    border: "1px solid",
                    borderColor: isActive ? type.color : "divider",
                    color: isActive ? type.color : "text.secondary",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: (theme) =>
                        isActive
                          ? type.activeBg
                          : theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.045)"
                          : "rgba(15, 23, 42, 0.06)",
                      borderColor: isActive ? type.color : "rgba(108, 99, 255, 0.22)",
                    },
                    "&:active": { transform: "translateY(0)" },
                  }}
                >
                  {type.label}
                </Button>
              );
            })}
          </Stack>
        </Grid>

        {/* ── RUN PADS ── */}
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
              Input Delivery
            </Typography>
            {isLocked && !isWicketDialogOpen && (
              <Box
                sx={{
                  px: 1,
                  py: 0.2,
                  borderRadius: 0.5,
                  bgcolor: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                <Typography variant="caption" sx={{ color: "#EF4444", fontWeight: 700, fontSize: "0.65rem" }}>
                  {scoringLocked ? "LOCKED" : "PROCESSING…"}
                </Typography>
              </Box>
            )}
          </Stack>

          <Grid container spacing={1.5}>
            {[0, 1, 2, 3, 4, 5, 6].map((score) => {
              const isBoundary = score === 4 || score === 6;
              const isFlashing = flashScore === score;
              const padStyle = getPadStyle(score);

              return (
                <Grid item xs={3} sm={1.7} key={score}>
                  <Box
                    onClick={() =>
                      !isLocked && handleRunClick(matchData.scoreCard, "ADD_RUNS", score)
                    }
                    onKeyDown={(event) => handleRunKeyDown(event, score)}
                    role="button"
                    tabIndex={isLocked ? -1 : 0}
                    aria-label={`Add ${score} run${score === 1 ? "" : "s"}`}
                    aria-disabled={isLocked}
                    className={
                      isFlashing && score === 4
                        ? "boundary-four"
                        : isFlashing && score === 6
                        ? "boundary-six"
                        : ""
                    }
                    sx={{
                      cursor: isLocked ? "not-allowed" : "pointer",
                      width: { xs: "100%", sm: 48 },
                      maxWidth: { xs: 56, sm: 48 },
                      height: { xs: 48, sm: 48 },
                      mx: "auto",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      fontWeight: 900,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      letterSpacing: "-0.02em",
                      color: isBoundary ? "#F8FAFC" : "text.primary",
                      transition: "transform 120ms ease, background-color 120ms ease",
                      opacity: isLocked ? 0.38 : 1,
                      ...padStyle,
                      "&:hover": isLocked ? {} : {
                        borderColor: isBoundary ? "transparent" : "rgba(108, 99, 255, 0.3)",
                      },
                      "&:active": isLocked ? {} : {
                        transform: "scale(0.96)",
                      },
                    }}
                  >
                    {score}
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* ── Boundary legend ── */}
          <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
            <Stack direction="row" spacing={0.8} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg, #38BDF8, #22C55E)" }} />
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.7rem" }}>4 = Boundary</Typography>
            </Stack>
            <Stack direction="row" spacing={0.8} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg, #6C63FF, #8B5CF6)" }} />
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.7rem" }}>6 = Maximum</Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      {isWicketDialogOpen && (
        <SelectBatsman
          battingTeam={battingTeam}
          bowlingTeam={bowlingTeam}
          scoreCard={updatedScoreCard}
          isWicketDialogOpen={isWicketDialogOpen}
          runs={runs}
          extras={extras}
          rules={matchData.scoringRules.extras}
          setIsWicketDialogOpen={setIsWicketDialogOpen}
          updateWicketAndNewBatsman={updateWicketAndNewBatsman}
        />
      )}
    </Box>
  );
};

export default ScorecardActions;
