import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

function SelectBowler({
  bowlingTeam,
  isDialogOpen,
  setIsDialogOpen,
  updateNewBowler,
}) {
  console.log(bowlingTeam, "select bowler");

  const [selectedBowler, setSelectedBowler] = useState("");

  const handleBallUpdate = () => {
    setIsDialogOpen(true);
    // const bowler = scoreCard.currentBowler;
    // bowler.balls = (bowler.balls || 0) + 1;

    // // If 6 balls are completed, update overs and show the dialog
    // if (bowler.balls === 6) {
    //   bowler.overs = (bowler.overs || 0) + 1;
    //   bowler.balls = 0; // Reset balls after completing an over

    //   setIsDialogOpen(true);
    // }

    // setScoreCard({ ...scoreCard, currentBowler: bowler });
  };

  const handleBowlerChange = (event) => {
    setSelectedBowler(event.target.value);
    console.log(event.target.value, "bowler");
  };

  const updateBowler = () => {
    if (selectedBowler) {
      updateNewBowler(selectedBowler);
    } else {
      alert("Please select a bowler");
    }
  };

  return (
    <div>
      {/* Dialog for selecting the next bowler */}
      <Dialog open={isDialogOpen}>
        <DialogTitle>Select Next Bowler</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Please select the next bowler for the new over:
          </Typography>
          <FormControl fullWidth>
            <TextField
              select
              label="Bowler"
              labelId="select-bowler-label"
              value={selectedBowler}
              onChange={handleBowlerChange}
            >
              {bowlingTeam?.players.map((player, index) => (
                <MenuItem key={index} value={player}>
                  {player}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={!selectedBowler}
            onClick={updateBowler}
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SelectBowler;
