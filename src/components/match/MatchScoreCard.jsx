/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Stack,
  styled,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BattingScoreCard from "./BattingScoreCard";
import BowlingScoreCard from "./BowlingScoreCard";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { getMatchOutcome } from "../../utils/matchDisplay";
import AppButton from "../ui/AppButton";
function MatchScoreCard({ showScoreCard, setShowScoreCard, matchData }) {
  const teamA = matchData.scoreCard.innings[0].team;
  const teamB = matchData.scoreCard.innings[1].team;
  const [firstbattingTeam, setFirstBattingTeam] = useState("");
  const [secondbattingTeam, setSecondBattingTeam] = useState("");

  const [expanded, setExpanded] = useState(false);
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
      console.log("Match data in ScoreCard:", matchData.teams[teamA].name, matchData.teams[teamB].name);
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
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
              Player of the Match: To be announced
            </Typography>
          </Box>
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
