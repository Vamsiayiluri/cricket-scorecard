import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  handleExtraChange,
  updateScoreCard,
} from "../../helpers/updateScorecard";
import InfoIcon from "@mui/icons-material/Info";
import SelectBatsman from "./Selectbatsman";

const ScorecardActions = ({
  matchData,
  battingTeam,
  bowlingTeam,
  updateMatchData,
  updateThisOver,
  currentOver,
  setCurrentOver,
}) => {
  const [updatedScoreCard, setUpdatedScoreCard] = useState(null);
  const [extras, setExtras] = useState({
    wide: false,
    noBall: false,
    byes: false,
    legByes: false,
    wicket: false,
  });
  const [runs, setRuns] = useState();
  const [isWicketDialogOpen, setIsWicketDialogOpen] = useState(false);

  const handleExtrasChange = (event) => {
    handleExtraChange(event, setExtras);
  };

  const formatBallSummary = (runs, extras) => {
    let summary = runs === 0 && extras.wicket ? "" : runs.toString() + " ";

    if (extras.wide) summary += "wd";
    if (extras.noBall) summary += "nb";
    if (extras.byes) summary += "b";
    if (extras.legByes) summary += "lb";
    if (extras.wicket) summary += "W";

    return summary;
  };
  useEffect(() => {
    updateThisOver(currentOver);
  }, [currentOver]);
  const handleRunClick = async (scoreCard, type, runs) => {
    const ballSummary = formatBallSummary(runs, extras);

    if (extras.wicket) {
      setRuns(runs);
      setIsWicketDialogOpen(true);
      setUpdatedScoreCard(matchData.scoreCard);
    } else {
      scoreCard = await updateScoreCard(scoreCard, type, { runs, extras });
      updateMatchData(scoreCard);
      setExtras({
        wide: false,
        noBall: false,
        byes: false,
        legByes: false,
        wicket: false,
      });
    }

    setCurrentOver((prev) =>
      Array.isArray(prev) ? [...prev, ballSummary] : [ballSummary]
    );
  };
  const swapStrikers = (striker, nonStriker) => {
    striker.isNonStriker = !striker.isNonStriker;
    nonStriker.isNonStriker = !nonStriker.isNonStriker;
  };
  const updateWicketAndNewBatsman = async (scoreCard) => {
    const inning = scoreCard.innings[scoreCard.currentInning - 1];
    const striker = inning.batsmen.find(
      (player) => !player.isOut && !player.isNonStriker
    );
    const nonStriker = inning.batsmen.find(
      (player) => !player.isOut && player.isNonStriker
    );
    const bowler = inning.bowlers.find((bowler) => bowler.currentBowler);
    if (bowler.balls === 6 && extras.wicket) {
      bowler.currentBowler = false;
      swapStrikers(striker, nonStriker);
    }
    setExtras({
      wide: false,
      noBall: false,
      byes: false,
      legByes: false,
      wicket: false,
    });
    updateMatchData({ ...scoreCard });
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Stack direction="row">
            <Typography variant="h6">Extras</Typography>
            <Tooltip
              title="Click Runs after choosing an extra type."
              placement="right-end"
            >
              <IconButton size="small">
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <FormControlLabel
            control={
              <Checkbox
                checked={extras.wide}
                onChange={handleExtrasChange}
                name="wide"
                color="primary"
              />
            }
            label="Wide"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={extras.noBall}
                onChange={handleExtrasChange}
                name="noBall"
                color="primary"
              />
            }
            label="No Ball"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={extras.byes}
                onChange={handleExtrasChange}
                name="byes"
                color="primary"
              />
            }
            label="Byes"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={extras.legByes}
                onChange={handleExtrasChange}
                name="legByes"
                color="primary"
              />
            }
            label="Leg Byes"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={extras.wicket}
                onChange={handleExtrasChange}
                name="wicket"
                color="secondary"
              />
            }
            label="Wicket"
          />
        </Grid>

        <Grid item xs={6}>
          <Typography variant="h6">Runs</Typography>
          <Grid container spacing={2}>
            {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
              <Grid item xs={6} md={4} key={runs}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() =>
                    handleRunClick(matchData.scoreCard, "ADD_RUNS", runs)
                  }
                  sx={{
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    fontSize: "14px",
                  }}
                >
                  {runs}
                </Button>
              </Grid>
            ))}
          </Grid>
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
          setIsWicketDialogOpen={setIsWicketDialogOpen}
          updateWicketAndNewBatsman={updateWicketAndNewBatsman}
        ></SelectBatsman>
      )}
    </Box>
  );
};

export default ScorecardActions;
