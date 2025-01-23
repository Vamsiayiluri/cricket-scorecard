import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
} from "@mui/material";
import { updateScoreCard } from "../../helpers/updateScorecard";

function SelectBatsman({
  battingTeam,
  bowlingTeam,
  scoreCard,
  runs,
  extras,
  isWicketDialogOpen,
  setIsWicketDialogOpen,
  updateWicketAndNewBatsman,
}) {
  const [wicketType, setWicketType] = useState("");
  const [nextBatsman, setNextBatsman] = useState("");
  const [fielder, setFielder] = useState("");
  const [outBatsman, setOutBatsman] = useState("");
  const [notOutbatsman, setNotOutBatsman] = useState("");
  const [strikeBatsman, setStrikeBatsman] = useState("");
  const batsmen = scoreCard?.innings[scoreCard.currentInning - 1].batsmen;

  const getBowler = () => {
    let inning = scoreCard?.innings[scoreCard.currentInning - 1];
    return inning.bowlers.find((bowler) => bowler.currentBowler);
  };
  const inning = scoreCard.innings[scoreCard.currentInning - 1];
  const striker = inning.batsmen.find(
    (player) => !player.isOut && !player.isNonStriker
  );
  const nonStriker = inning.batsmen.find(
    (player) => !player.isOut && player.isNonStriker
  );
  const [bowler, setBowler] = useState(getBowler || "abdg");

  const handleWicketTypeChange = (event) => {
    setWicketType(event.target.value);
  };

  const handleNextBatsmanChange = (event) => {
    setNextBatsman(event.target.value);
  };

  const handleFielderChange = (event) => {
    setFielder(event.target.value);
  };
  const handleBatsmanOut = (event) => {
    setOutBatsman(event.target.value);

    setNotOutBatsman(
      striker.name === event.target.value ? nonStriker.name : striker.name
    );
  };
  const handleStrikeBatsman = (event) => {
    setStrikeBatsman(event.target.value);
  };

  const handleConfirmWicket = async () => {
    if (!wicketType || !nextBatsman || (wicketType === "Caught" && !fielder)) {
      alert("Please select all required fields.");
      return;
    }
    scoreCard = await updateScoreCard(scoreCard, "ADD_RUNS", { runs, extras });
    const inning = scoreCard.innings[scoreCard.currentInning - 1];
    const striker = inning.batsmen.find(
      (player) => !player.isOut && !player.isNonStriker
    );
    const nonStriker = inning.batsmen.find(
      (player) => !player.isOut && player.isNonStriker
    );
    const bowler = inning.bowlers.find((bowler) => bowler.currentBowler);

    if (wicketType === "Run Out") {
      if (outBatsman === striker.name) {
        striker.isOut = true;
        striker.isNonStriker = true;
        striker.wicketType = wicketType;

        striker.dismissal = `Run Out (${fielder})`;
        if (strikeBatsman === nextBatsman) {
          nonStriker.isNonStriker = true;
        } else {
          nonStriker.isNonStriker = false;
        }
      } else {
        nonStriker.isOut = true;
        nonStriker.isNonStriker = true;
        nonStriker.wicketType = wicketType;
        nonStriker.dismissal = `Run Out (${fielder})`;

        if (strikeBatsman === nextBatsman) {
          striker.isNonStriker = true;
        } else {
          striker.isNonStriker = false;
        }
      }
    } else {
      striker.isOut = true;
      striker.isNonStriker = true;
      striker.wicketType = wicketType;
      bowler.wickets += 1;
    }

    inning.wickets += 1;

    if (wicketType === "Caught") {
      striker.dismissal = `c.${fielder} b.${bowler.name}`;
    } else if (wicketType === "Bowled") {
      striker.dismissal = `b.${bowler.name}`;
    } else if (wicketType === "LBW") {
      striker.dismissal = `lbw b.${bowler.name}`;
    } else {
      if (wicketType !== "Run Out") striker.dismissal = wicketType;
    }

    const newBatsman = {
      name: nextBatsman,
      runs: 0,
      balls: 0,
      isOut: false,
      isNonStriker: strikeBatsman?.length
        ? strikeBatsman === nextBatsman
          ? false
          : true
        : false,
      fours: 0,
      sixes: 0,
    };
    inning.batsmen.push(newBatsman);

    updateWicketAndNewBatsman({ ...scoreCard });
    setIsWicketDialogOpen(false);
    setWicketType("");
    setNextBatsman("");
    setFielder("");
  };

  return (
    <div>
      <Dialog
        open={isWicketDialogOpen}
        onClose={() => setIsWicketDialogOpen(false)}
      >
        <DialogTitle>Wicket</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Select the type of wicket:
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={wicketType}
              onChange={handleWicketTypeChange}
              row
            >
              <FormControlLabel
                value="Bowled"
                control={<Radio />}
                label="Bowled"
              />
              <FormControlLabel
                value="Caught"
                control={<Radio />}
                label="Caught"
              />
              <FormControlLabel
                value="Run Out"
                control={<Radio />}
                label="Run Out"
              />
              <FormControlLabel value="LBW" control={<Radio />} label="LBW" />
              <FormControlLabel
                value="Stumped"
                control={<Radio />}
                label="Stumped"
              />
              <FormControlLabel
                value="Hit Wicket"
                control={<Radio />}
                label="Hit Wicket"
              />
            </RadioGroup>
          </FormControl>

          {wicketType === "Run Out" && striker && nonStriker && (
            <>
              <Typography variant="body1" gutterBottom>
                Select the batsman out:
              </Typography>
              <FormControl fullWidth>
                <TextField
                  select
                  label="Batsman"
                  labelId="select-fielder-label"
                  value={outBatsman}
                  onChange={handleBatsmanOut}
                >
                  <MenuItem value={striker?.name}>{striker?.name}</MenuItem>
                  <MenuItem value={nonStriker.name}>{nonStriker.name}</MenuItem>
                </TextField>
              </FormControl>
            </>
          )}
          {(wicketType === "Caught" ||
            wicketType === "Run Out" ||
            wicketType === "Stumped") && (
            <>
              <Typography variant="body1" gutterBottom>
                Select the player involved:
              </Typography>
              <FormControl fullWidth>
                <TextField
                  select
                  label="Fielder"
                  labelId="select-fielder-label"
                  value={fielder}
                  onChange={handleFielderChange}
                >
                  {bowlingTeam?.players.map((player, index) => (
                    <MenuItem key={index} value={player}>
                      {player}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            </>
          )}

          <Typography variant="body1" gutterBottom>
            Select the next batsman:
          </Typography>
          <FormControl fullWidth>
            <TextField
              select
              label="Next Batsman"
              labelId="select-next-batsman-label"
              value={nextBatsman}
              onChange={handleNextBatsmanChange}
            >
              {battingTeam.players
                .filter((batsman) => {
                  const batsmanData = batsmen?.find((b) => b.name === batsman);
                  return !(
                    batsmanData &&
                    (batsmanData.isOut ||
                      (!batsmanData.isOut && !batsmanData.isNonStriker) ||
                      (!batsmanData.isOut && batsmanData.isNonStriker))
                  );
                })
                .map((batsman) => (
                  <MenuItem key={batsman} value={batsman}>
                    {batsman}
                  </MenuItem>
                ))}
            </TextField>
          </FormControl>
          {wicketType === "Run Out" && nextBatsman && notOutbatsman && (
            <>
              <Typography variant="body1" gutterBottom>
                Select the Striker:
              </Typography>
              <FormControl fullWidth>
                <TextField
                  select
                  label="Batsman"
                  labelId="select-fielder-label"
                  value={strikeBatsman}
                  onChange={handleStrikeBatsman}
                >
                  <MenuItem value={notOutbatsman}>{notOutbatsman}</MenuItem>
                  <MenuItem value={nextBatsman}>{nextBatsman}</MenuItem>
                </TextField>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsWicketDialogOpen(false)}
            color="secondary"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmWicket} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SelectBatsman;
