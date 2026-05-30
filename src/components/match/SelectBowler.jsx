/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  FormControl,
  MenuItem,
  TextField,
} from "@mui/material";
import { useToast } from "../../context/ToastContext";
import AppButton from "../ui/AppButton";

function SelectBowler({
  bowlingTeam,
  isDialogOpen,
  scoreCard,
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
      <Dialog open={isDialogOpen} fullWidth maxWidth="xs">
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
          <AppButton
            disabled={!selectedBowler}
            onClick={updateBowler}
          >
            Confirm
          </AppButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SelectBowler;
