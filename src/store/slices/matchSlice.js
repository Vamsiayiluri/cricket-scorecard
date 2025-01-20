import { createSlice } from "@reduxjs/toolkit";

const matchesSlice = createSlice({
  name: "matches",
  initialState: {
    matches: [],
  },
  reducers: {
    addMatch: (state, action) => {
      // Add a new match to the matches array
      console.log(action.payload, "data");
      state.matches.push(action.payload);
    },
    updateMatch: (state, action) => {
      // Update an existing match
      const index = state.matches.findIndex(
        (match) => match.matchId === action.payload.matchId
      );
      if (index !== -1) {
        state.matches[index] = { ...state.matches[index], ...action.payload };
      }
    },
    deleteMatch: (state, action) => {
      // Delete a match by matchId
      state.matches = state.matches.filter(
        (match) => match.matchId !== action.payload.matchId
      );
    },
    setMatches: (state, action) => {
      // Replace the matches array with new data (useful when fetching from DB)
      state.matches = action.payload;
    },
  },
});

export const { addMatch, updateMatch, deleteMatch, setMatches } =
  matchesSlice.actions;

export default matchesSlice.reducer;
