import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
  styled,
  Fab,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BattingScoreCard from "./BattingScoreCard";
import BowlingScoreCard from "./BowlingScoreCard";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { Margin } from "@mui/icons-material";
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
      margin: "10px",
    },
  });
  useEffect(() => {
    if (matchData) {
      setFirstBattingTeam(matchData.teams[teamA].name);
      setSecondBattingTeam(matchData.teams[teamB].name);
    }
  }, []);
  const handleBack = () => {
    setShowScoreCard(false);
  };

  return (
    <>
      <Fab
        color="secondary"
        onClick={handleBack}
        size="large"
        sx={{
          width: "40px",
          height: "40px",
          fontSize: "14px",
          marginBottom: "12px",
        }}
      >
        <KeyboardBackspaceIcon></KeyboardBackspaceIcon>
      </Fab>

      {showScoreCard && (
        <Stack spacing={2}>
          <Accordion
            expanded={expanded === "teamA"}
            onChange={handleAccordionChange("teamA")}
          >
            <CustomAccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography variant="h6">
                {matchData.teams[teamA].name} Scorecard
              </Typography>
              <Chip
                size="medium"
                color="secondary"
                label={`${matchData.scoreCard.innings[0].runs}/${
                  matchData.scoreCard.innings[0].wickets
                } in ${matchData.scoreCard.innings[0].overs.toFixed(1)} overs`}
                variant="outlined"
              ></Chip>
            </CustomAccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                <BattingScoreCard
                  battingTeam={firstbattingTeam}
                  currentInning={matchData.scoreCard.innings[0]}
                ></BattingScoreCard>
                <Typography variant="h6">
                  {" "}
                  {`Total :${matchData.scoreCard.innings[0].runs}/${
                    matchData.scoreCard.innings[0].wickets
                  } in ${matchData.scoreCard.innings[0].overs.toFixed(
                    1
                  )} overs`}
                </Typography>
                <Typography variant="h6">
                  Extras: {matchData.scoreCard.innings[0].extras[0].total || 0}{" "}
                  (w:
                  {matchData.scoreCard.innings[0].extras[0].wides || 0}, nb:
                  {matchData.scoreCard.innings[0].extras[0].noBalls || 0}, b:
                  {matchData.scoreCard.innings[0].extras[0].byes || 0}, lb:
                  {matchData.scoreCard.innings[0].extras[0].legByes || 0})
                </Typography>
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
          >
            <CustomAccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
            >
              <Typography variant="h6">
                {matchData.teams[teamB].name} Scorecard
              </Typography>
              <Chip
                size="medium"
                color="secondary"
                label={`${matchData.scoreCard.innings[1].runs}/${
                  matchData.scoreCard.innings[1].wickets
                } in ${matchData.scoreCard.innings[1].overs.toFixed(1)} overs`}
                variant="outlined"
              ></Chip>
            </CustomAccordionSummary>
            <AccordionDetails>
              {" "}
              <Stack spacing={3}>
                <BattingScoreCard
                  battingTeam={secondbattingTeam}
                  currentInning={matchData.scoreCard.innings[1]}
                ></BattingScoreCard>
                <Typography variant="h6">
                  {`Total :${matchData.scoreCard.innings[1].runs}/${
                    matchData.scoreCard.innings[1].wickets
                  } in ${matchData.scoreCard.innings[1].overs.toFixed(
                    1
                  )} overs`}
                </Typography>
                <Typography variant="h6">
                  Extras: {matchData.scoreCard.innings[1].extras[0].total || 0}{" "}
                  (w:
                  {matchData.scoreCard.innings[1].extras[0].wides || 0}, nb:
                  {matchData.scoreCard.innings[1].extras[0].noBalls || 0}, b:
                  {matchData.scoreCard.innings[1].extras[0].byes || 0}, lb:
                  {matchData.scoreCard.innings[1].extras[0].legByes || 0})
                </Typography>
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
