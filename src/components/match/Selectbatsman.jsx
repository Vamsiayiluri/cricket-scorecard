/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  FormControl,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
} from "@mui/material";
import { updateScoreCard } from "../../helpers/updateScorecard";
import { useToast } from "../../context/ToastContext";
import { scoringLog } from "../../utils/scoringDiagnostics";
import {
  buildDismissalDetails,
  DISMISSAL_TYPES,
  DISMISSALS_REQUIRING_FIELDER,
  formatDismissal,
  formatOverFromBalls,
} from "../../utils/cricketScorecard";
import AppButton from "../ui/AppButton";

function SelectBatsman({
  battingTeam,
  bowlingTeam,
  scoreCard,
  runs,
  extras,
  rules,
  isWicketDialogOpen,
  setIsWicketDialogOpen,
  updateWicketAndNewBatsman,
}) {
  const { showToast } = useToast();
  const [wicketType, setWicketType] = useState("");
  const [nextBatsman, setNextBatsman] = useState("");
  const [fielder, setFielder] = useState("");
  const [outBatsman, setOutBatsman] = useState("");
  const [notOutbatsman, setNotOutBatsman] = useState("");
  const [strikeBatsman, setStrikeBatsman] = useState("");
  const batsmen = scoreCard?.innings?.[scoreCard.currentInning - 1]?.batsmen || [];

  const inning = scoreCard.innings[scoreCard.currentInning - 1];
  const striker = inning.batsmen.find(
    (player) => !player.isOut && !player.isNonStriker
  );
  const nonStriker = inning.batsmen.find(
    (player) => !player.isOut && player.isNonStriker
  );
  const availableNextBatsmen = (battingTeam?.players || []).filter((batsman) => {
    const batsmanData = batsmen?.find((b) => b.name === batsman);
    return !(
      batsmanData &&
      (batsmanData.isOut ||
        (!batsmanData.isOut && !batsmanData.isNonStriker) ||
        (!batsmanData.isOut && batsmanData.isNonStriker))
    );
  });

  const getInvalidWicketMessage = () => {
    if (!wicketType) return "Please select the wicket type.";
    if (extras.noBall && wicketType !== DISMISSAL_TYPES.RUN_OUT) {
      return "Only run out is allowed as a wicket on a no-ball in this scoring flow.";
    }
    if (extras.wide && ![DISMISSAL_TYPES.RUN_OUT, DISMISSAL_TYPES.STUMPED].includes(wicketType)) {
      return "Only run out or stumped is allowed as a wicket on a wide.";
    }
    if (DISMISSALS_REQUIRING_FIELDER.includes(wicketType) && !fielder) {
      return "Please select the player involved.";
    }
    if (wicketType === DISMISSAL_TYPES.RUN_OUT && !outBatsman) {
      return "Please select the batter who is run out.";
    }
    if (availableNextBatsmen.length > 0 && !nextBatsman) {
      return "Please select the next batsman.";
    }
    if (wicketType === DISMISSAL_TYPES.RUN_OUT && availableNextBatsmen.length > 0 && !strikeBatsman) {
      return "Please select who will be on strike after the run out.";
    }
    return "";
  };

  const handleWicketTypeChange = (event) => {
    setWicketType(event.target.value);
    setFielder("");
    setOutBatsman("");
    setStrikeBatsman("");
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
    scoringLog("wicket.dialog.confirm", {
      wicketType,
      nextBatsman,
      runs,
      extras,
      outBatsman,
    });
    const invalidMessage = getInvalidWicketMessage();
    if (invalidMessage) {
      showToast(invalidMessage, "warning");
      return;
    }
    scoreCard = await updateScoreCard(scoreCard, "ADD_RUNS", { runs, extras, rules });
    const inning = scoreCard.innings[scoreCard.currentInning - 1];
    const striker = inning.batsmen.find(
      (player) => !player.isOut && !player.isNonStriker
    );
    const nonStriker = inning.batsmen.find(
      (player) => !player.isOut && player.isNonStriker
    );
    const bowler = inning.bowlers.find((bowler) => bowler.currentBowler);
    const bowlerName = bowler?.name || "";
    const dismissalDetails = buildDismissalDetails({
      dismissalType: wicketType,
      fielder,
      bowler: bowlerName,
    });
    let dismissedBatsman = striker;

    if (wicketType === DISMISSAL_TYPES.RUN_OUT) {
      if (outBatsman === striker.name) {
        striker.isOut = true;
        striker.isNonStriker = true;
        Object.assign(striker, dismissalDetails);
        striker.wicketType = wicketType;
        striker.dismissal = formatDismissal(striker);
        dismissedBatsman = striker;
        if (strikeBatsman === nextBatsman) {
          nonStriker.isNonStriker = true;
        } else {
          nonStriker.isNonStriker = false;
        }
      } else {
        nonStriker.isOut = true;
        nonStriker.isNonStriker = true;
        Object.assign(nonStriker, dismissalDetails);
        nonStriker.wicketType = wicketType;
        nonStriker.dismissal = formatDismissal(nonStriker);
        dismissedBatsman = nonStriker;

        if (strikeBatsman === nextBatsman) {
          striker.isNonStriker = true;
        } else {
          striker.isNonStriker = false;
        }
      }
    } else {
      striker.isOut = true;
      striker.isNonStriker = true;
      Object.assign(striker, dismissalDetails);
      striker.wicketType = wicketType;
      striker.dismissal = formatDismissal(striker);
      if (bowler) {
        bowler.wickets += 1;
      }
      dismissedBatsman = striker;
    }

    inning.wickets += 1;
    inning.fallOfWickets = [
      ...(inning.fallOfWickets || []),
      {
        wicket: inning.wickets,
        score: inning.runs,
        over: formatOverFromBalls(inning.balls),
        batter: dismissedBatsman?.name || outBatsman || striker?.name || "",
      },
    ];

    if (nextBatsman) {
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
    }

    updateWicketAndNewBatsman({ ...scoreCard });
    setIsWicketDialogOpen(false);
    setWicketType("");
    setNextBatsman("");
    setFielder("");
    setOutBatsman("");
    setNotOutBatsman("");
    setStrikeBatsman("");
  };

  return (
    <div>
      <Dialog
        open={isWicketDialogOpen}
        onClose={() => setIsWicketDialogOpen(false)}
        fullWidth
        maxWidth="sm"
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
                value={DISMISSAL_TYPES.BOWLED}
                control={<Radio />}
                label="Bowled"
              />
              <FormControlLabel
                value={DISMISSAL_TYPES.CAUGHT}
                control={<Radio />}
                label="Caught"
              />
              <FormControlLabel
                value={DISMISSAL_TYPES.RUN_OUT}
                control={<Radio />}
                label="Run Out"
              />
              <FormControlLabel value={DISMISSAL_TYPES.LBW} control={<Radio />} label="LBW" />
              <FormControlLabel
                value={DISMISSAL_TYPES.STUMPED}
                control={<Radio />}
                label="Stumped"
              />
              <FormControlLabel
                value={DISMISSAL_TYPES.HIT_WICKET}
                control={<Radio />}
                label="Hit Wicket"
              />
            </RadioGroup>
          </FormControl>

          {wicketType === DISMISSAL_TYPES.RUN_OUT && striker && nonStriker && (
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
          {DISMISSALS_REQUIRING_FIELDER.includes(wicketType) && (
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
                  {(bowlingTeam?.players || []).map((player, index) => (
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
              {availableNextBatsmen
                .map((batsman) => (
                  <MenuItem key={batsman} value={batsman}>
                    {batsman}
                  </MenuItem>
                ))}
            </TextField>
          </FormControl>
          {wicketType === DISMISSAL_TYPES.RUN_OUT && nextBatsman && notOutbatsman && (
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
          <AppButton
            variant="outlined"
            onClick={() => setIsWicketDialogOpen(false)}
          >
            Cancel
          </AppButton>
          <AppButton onClick={handleConfirmWicket}>
            Confirm
          </AppButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SelectBatsman;
