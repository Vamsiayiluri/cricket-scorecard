import React, { useEffect, useState } from "react";
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
import { useToast } from "../../context/ToastContext";

function SelectBowler({
  bowlingTeam,
  isDialogOpen,
  scoreCard,
  setIsDialogOpen,
  updateNewBowler,
}) {
  const { showToast } = useToast();
  const [selectedBowler, setSelectedBowler] = useState("");
  const [bowlerSelected, setBowlerSelected] = useState("");
  const bowlers = scoreCard?.innings[scoreCard.currentInning - 1]?.bowlers;

  useEffect(() => {
    if (bowlers?.length === 1) {
      setBowlerSelected(bowlers[0].name);
    }
  }, [bowlers]);

  const handleBowlerChange = (event) => {
    setSelectedBowler(event.target.value);
  };

  const updateBowler = () => {
    debugger
    if (selectedBowler) {
      updateNewBowler(selectedBowler);
      setBowlerSelected(selectedBowler);
      setSelectedBowler("");
    } else {
      showToast("Please select a bowler", "warning");
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
              {bowlingTeam?.players
                .filter((player) => {
                  const bowlerData = bowlers.find((b) => b.name === player);
                  return !(bowlerData && bowlerData.name === bowlerSelected);
                })
                .map((player, index) => (
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
