/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Stack,
  styled,
  Chip,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import BattingScoreCard from "./BattingScoreCard";
import BowlingScoreCard from "./BowlingScoreCard";
import FallOfWickets from "./FallOfWickets";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { getMatchOutcome, getMatchTitle } from "../../utils/matchDisplay";
import AppButton from "../ui/AppButton";
import PlayerOfMatchSelector from "./PlayerOfMatchSelector";
import ResultShareDialog from "./ResultShareDialog";
import { setPlayerOfMatch } from "../../services/firebase/matchService";
import { createNotificationsForFollowers } from "../../services/firebase/notificationService";
import { useAuth } from "../../context/AuthContext";

function MatchScoreCard({ showScoreCard, setShowScoreCard, matchData }) {
  const teamA = matchData.scoreCard.innings[0].team;
  const teamB = matchData.scoreCard.innings[1].team;
  const [firstbattingTeam, setFirstBattingTeam] = useState("");
  const [secondbattingTeam, setSecondBattingTeam] = useState("");

  const [expanded, setExpanded] = useState(false);
  const [potm, setPotm] = useState(matchData?.playerOfTheMatch || "");
  const [potmDialogOpen, setPotmDialogOpen] = useState(false);
  const [potmSaving, setPotmSaving] = useState(false);
  const [shareCardOpen, setShareCardOpen] = useState(false);

  const { user } = useAuth();
  const completionNotifFired = useRef(false);

  // Fire match_completed notification for followers once on mount
  useEffect(() => {
    if (completionNotifFired.current || !matchData?.matchId) return;
    completionNotifFired.current = true;
    createNotificationsForFollowers(
      matchData.matchId,
      getMatchTitle(matchData),
      "match_completed",
      user?.uid
    ).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSavePotm = async (playerName) => {
    if (!matchData?.matchId) return;
    setPotmSaving(true);
    try {
      await setPlayerOfMatch(matchData.matchId, playerName);
      setPotm(playerName);
      setPotmDialogOpen(false);
      // Notify followers that POTM has been announced
      createNotificationsForFollowers(
        matchData.matchId,
        getMatchTitle(matchData),
        "potm_announced",
        user?.uid,
        { playerName }
      ).catch(() => {});
    } catch {
      // persist failed silently — user can retry
    } finally {
      setPotmSaving(false);
    }
  };
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const CustomAccordionSummary = styled(AccordionSummary)({
    "& .MuiAccordionSummary-content": {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "8px",
      margin: "10px 0",
    },
  });
  useEffect(() => {
    if (matchData) {
      setFirstBattingTeam(matchData.teams[teamA].name);
      setSecondBattingTeam(matchData.teams[teamB].name);
    }
  }, [matchData, teamA, teamB]);
  const handleBack = () => {
    setShowScoreCard(false);
  };
  const outcome = getMatchOutcome(matchData);

  return (
    <>
      <AppButton
        onClick={handleBack}
        variant="outlined"
        startIcon={<KeyboardBackspaceIcon sx={{ fontSize: 16 }} />}
        sx={{ minHeight: 32, py: 0.5, px: 1.5, mb: 1.5 }}
      >
        Back
      </AppButton>

      {showScoreCard && (
        <Stack spacing={1.5}>
          <Box
            sx={{
              p: { xs: 1.5, md: 2 },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {outcome?.isTie
                ? "Match Tied"
                : `${outcome?.winner || "Winner"} won ${outcome?.margin || ""}`}
            </Typography>
            {matchData?.notes?.trim() && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                {matchData.notes}
              </Typography>
            )}
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.72rem", py: 0.25, borderRadius: 1 }}
                onClick={() => setShareCardOpen(true)}
              >
                Share Result Card
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
              <EmojiEventsIcon sx={{ color: "#F59E0B", fontSize: 18 }} />
              {potm ? (
                <>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {potm}
                  </Typography>
                  <Chip size="small" label="Player of the Match" sx={{ fontSize: "0.65rem", height: 20 }} />
                  <Button
                    size="small"
                    variant="text"
                    sx={{ fontSize: "0.7rem", py: 0, minHeight: 0, color: "text.secondary" }}
                    onClick={() => setPotmDialogOpen(true)}
                  >
                    Change
                  </Button>
                </>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.72rem", py: 0.25 }}
                  onClick={() => setPotmDialogOpen(true)}
                >
                  Select Player of the Match
                </Button>
              )}
            </Stack>
          </Box>

          <PlayerOfMatchSelector
            open={potmDialogOpen}
            onClose={() => setPotmDialogOpen(false)}
            matchData={matchData}
            currentPotm={potm}
            onSave={handleSavePotm}
            saving={potmSaving}
          />

          <ResultShareDialog
            open={shareCardOpen}
            onClose={() => setShareCardOpen(false)}
            match={matchData}
          />
          <Accordion
            expanded={expanded === "teamA"}
            onChange={handleAccordionChange("teamA")}
            sx={{
              borderRadius: "12px !important",
              boxShadow: "none",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              "&::before": { display: "none" },
              "&.Mui-expanded": { margin: "0 0 12px 0" },
            }}
          >
            <CustomAccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
              aria-controls="panel1a-content"
              id="panel1a-header"
              sx={{ minHeight: 48, "&.Mui-expanded": { minHeight: 48 } }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {matchData.teams[teamA].name} Scorecard
              </Typography>
              <Chip
                size="small"
                color="secondary"
                label={`${matchData.scoreCard.innings[0].runs}/${
                  matchData.scoreCard.innings[0].wickets
                } in ${matchData.scoreCard.innings[0].overs.toFixed(1)} ov`}
                variant="outlined"
                sx={{ height: 22, fontSize: "0.72rem" }}
              ></Chip>
            </CustomAccordionSummary>
            <AccordionDetails sx={{ p: 1.5, pt: 0 }}>
              <Stack spacing={1.5}>
                <BattingScoreCard
                  battingTeam={firstbattingTeam}
                  currentInning={matchData.scoreCard.innings[0]}
                ></BattingScoreCard>
                <FallOfWickets fallOfWickets={matchData.scoreCard.innings[0].fallOfWickets} />
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {`Total: ${matchData.scoreCard.innings[0].runs}/${
                      matchData.scoreCard.innings[0].wickets
                    } in ${matchData.scoreCard.innings[0].overs.toFixed(1)} overs`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Extras: {matchData.scoreCard.innings[0].extras[0].total || 0}{" "}
                    (w:
                    {matchData.scoreCard.innings[0].extras[0].wides || 0}, nb:
                    {matchData.scoreCard.innings[0].extras[0].noBalls || 0}, b:
                    {matchData.scoreCard.innings[0].extras[0].byes || 0}, lb:
                    {matchData.scoreCard.innings[0].extras[0].legByes || 0})
                  </Typography>
                </Stack>
                <BowlingScoreCard
                  bowlingTeam={secondbattingTeam}
                  currentInning={matchData.scoreCard.innings[0]}
                ></BowlingScoreCard>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expanded === "teamB"}
            onChange={handleAccordionChange("teamB")}
            sx={{
              borderRadius: "12px !important",
              boxShadow: "none",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              "&::before": { display: "none" },
              "&.Mui-expanded": { margin: "0 0 12px 0" },
            }}
          >
            <CustomAccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
              aria-controls="panel2a-content"
              id="panel2a-header"
              sx={{ minHeight: 48, "&.Mui-expanded": { minHeight: 48 } }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {matchData.teams[teamB].name} Scorecard
              </Typography>
              <Chip
                size="small"
                color="secondary"
                label={`${matchData.scoreCard.innings[1].runs}/${
                  matchData.scoreCard.innings[1].wickets
                } in ${matchData.scoreCard.innings[1].overs.toFixed(1)} ov`}
                variant="outlined"
                sx={{ height: 22, fontSize: "0.72rem" }}
              ></Chip>
            </CustomAccordionSummary>
            <AccordionDetails sx={{ p: 1.5, pt: 0 }}>
              <Stack spacing={1.5}>
                <BattingScoreCard
                  battingTeam={secondbattingTeam}
                  currentInning={matchData.scoreCard.innings[1]}
                ></BattingScoreCard>
                <FallOfWickets fallOfWickets={matchData.scoreCard.innings[1].fallOfWickets} />
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {`Total: ${matchData.scoreCard.innings[1].runs}/${
                      matchData.scoreCard.innings[1].wickets
                    } in ${matchData.scoreCard.innings[1].overs.toFixed(1)} overs`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Extras: {matchData.scoreCard.innings[1].extras[0].total || 0}{" "}
                    (w:
                    {matchData.scoreCard.innings[1].extras[0].wides || 0}, nb:
                    {matchData.scoreCard.innings[1].extras[0].noBalls || 0}, b:
                    {matchData.scoreCard.innings[1].extras[0].byes || 0}, lb:
                    {matchData.scoreCard.innings[1].extras[0].legByes || 0})
                  </Typography>
                </Stack>
                <BowlingScoreCard
                  bowlingTeam={firstbattingTeam}
                  currentInning={matchData.scoreCard.innings[1]}
                ></BowlingScoreCard>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      )}
    </>
  );
}

export default MatchScoreCard;
