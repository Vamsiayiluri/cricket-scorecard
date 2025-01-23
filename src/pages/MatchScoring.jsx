import React, { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Box, Typography } from "@mui/material";
import ScoringActions from "../components/match/ScoringActions";
import Scorecard from "../components/match/ScoreCard";
import StartMatch from "../components/match/startMatch";
import ScorecardTwo from "../components/match/ScorecardTwo";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getMatch, updateMatch } from "../services/firebaseServices";

const MatchScoring = () => {
  const [matchData, setMatchData] = useState(null);
  const [showMatchData, setShowMatchData] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const match = useSelector((state) => state.match);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    async function fetchMatchData() {
      const matchId = searchParams.get("matchId");
      if (matchId) {
        try {
          const data = await getMatch(matchId);
          setMatchData(data);
        } catch (error) {
          console.error("Failed to fetch match data:", error);
        }
      }
    }
    fetchMatchData();
  }, []);

  const startMatch = async (matchData) => {
    await updateMatch(matchData);
    navigate(`/score-card?matchId=${matchData.matchId}`);
  };

  return (
    <Box sx={{ padding: 3 }}>
      {matchData && (
        <Suspense fallback={<div>Loading component...</div>}>
          <StartMatch matchData={matchData} onStart={startMatch}></StartMatch>
        </Suspense>
      )}
    </Box>
  );
};

export default MatchScoring;
