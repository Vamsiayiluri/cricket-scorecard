/* eslint-disable react/prop-types */
import { useState } from "react";
import { Autocomplete, Button, FormHelperText, Stack, TextField, Typography } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

/**
 * Player add input used in both TeamFormDialog and TeamsSetupForm.
 *
 * Shows catalog players as autocomplete options. Allows free-text entry for
 * players not in the catalog (freeSolo). On add, calls onAdd(name, playerId).
 * Players without a catalog entry get playerId = null (manual entry).
 */
const PlayerSearchInput = ({ catalogPlayers = [], currentNames = [], onAdd, error, atMax }) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);

  const available = catalogPlayers.filter(
    (p) => !currentNames.some((n) => n.toLowerCase() === p.name.toLowerCase())
  );

  const doAdd = (name, playerId = null) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    if (currentNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) return;
    onAdd(trimmed, playerId);
    setInputValue("");
    setSelectedOption(null);
  };

  const handleChange = (_, value) => {
    if (value && typeof value === "object") {
      doAdd(value.name, value.playerId);
    } else {
      setSelectedOption(null);
    }
  };

  return (
    <Stack spacing={0.5}>
      <Stack direction="row" spacing={1}>
        <Autocomplete
          freeSolo
          options={available}
          getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.name)}
          value={selectedOption}
          inputValue={inputValue}
          onInputChange={(_, v) => setInputValue(v)}
          onChange={handleChange}
          disabled={atMax}
          sx={{ flexGrow: 1 }}
          renderOption={(props, option) => (
            <li {...props} key={option.playerId}>
              <Stack>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {option.name}
                </Typography>
                {(option.role || option.battingStyle) && (
                  <Typography variant="caption" color="text.secondary">
                    {[option.role, option.battingStyle].filter(Boolean).join(" · ")}
                  </Typography>
                )}
              </Stack>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label={available.length > 0 ? "Search catalog or type name" : "Add player name"}
              size="small"
              error={Boolean(error)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  doAdd(inputValue);
                }
              }}
            />
          )}
        />
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => doAdd(inputValue)}
          disabled={atMax || !inputValue.trim()}
          sx={{ minHeight: 38, flexShrink: 0, borderRadius: 1 }}
        >
          Add
        </Button>
      </Stack>
      {error && (
        <FormHelperText error sx={{ fontSize: "0.675rem" }}>
          {error}
        </FormHelperText>
      )}
    </Stack>
  );
};

export default PlayerSearchInput;
