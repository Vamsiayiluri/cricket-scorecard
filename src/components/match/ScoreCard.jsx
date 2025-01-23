import React, {
  Suspense,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Box, Typography, Grid, Paper, Stack, Button } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { getMatch, updateMatch } from "../../services/firebaseServices";
import ScoringActions from "./ScoringActions";
import SelectBowler from "./SelectBowler";
import CurrentOver from "./CurrentOver";
import EndOfInnings from "./EndOfInnings";
import BattingScoreCard from "./BattingScoreCard";
import BowlingScoreCard from "./BowlingScoreCard";
import MatchScoreCard from "./MatchScoreCard";

const Scorecard = () => {
  // const matchData = {
  //   matchId: "some-unique-id",
  //   matchDetails: {
  //     name: "Test Match",
  //     location: "Stadium",
  //     date: "2024-12-30",
  //   },
  //   teams: {
  //     teamA: {
  //       name: "Team A",
  //       batsmen: ["Player A1", "Player A2", "Player A3"],
  //     },
  //     teamB: {
  //       name: "Team B",
  //       batsmen: ["Player B1", "Player B2", "Player B3"],
  //     },
  //   },
  //   tossDetails: { winner: "Team A", decision: "bat" },
  //   scoringRules: { maxOvers: 20, extras: { wides: true, noBalls: true } },
  //   scoreCard: {
  //     currentInning: 1,
  //     innings: [
  //       {
  //         team: "teamA",
  //         runs: 0,
  //         wickets: 0,
  //         overs: 0,
  //         balls: 0,
  //         batsmen: [
  //           { name: "Player A1", runs: 0, balls: 0, isOut: false },
  //           { name: "Player A2", runs: 0, balls: 0, isOut: false },
  //         ],
  //       },
  //     ],
  //     currentBowler: { name: "Player B1", overs: 0, runs: 0, wickets: 0 },
  //   },
  //   status: "in-progress",
  //   createdAt: "2024-12-24T10:00:00Z",
  //   updatedAt: "2024-12-24T10:30:00Z",
  // };
  const matchReducer = (state, action) => {
    switch (action.type) {
      case "SET_MATCH_DATA":
        return {
          ...state,
          ...action.payload,
        };
      case "UPDATE_CURRENT_BOWLER": {
        const { selectedBowler } = action.payload;

        const currentInningIndex = state.scoreCard.currentInning - 1;
        const updatedInnings = [...state.scoreCard.innings];
        const inning = { ...updatedInnings[currentInningIndex] };

        const updatedBowlers = inning.bowlers.map((existingBowler) => ({
          ...existingBowler,
          currentBowler: false,
        }));

        const newBowler = {
          name: selectedBowler,
          balls: 0,
          overs: 0,
          runs: 0,
          wickets: 0,
          currentBowler: true,
        };

        const bowlerExists = updatedBowlers.some(
          (bowler) => bowler.name === selectedBowler
        );

        if (bowlerExists) {
          for (let bowler of updatedBowlers) {
            if (bowler.name === selectedBowler) {
              Object.assign(bowler, newBowler);
            }
          }
        } else {
          updatedBowlers.push(newBowler);
        }

        inning.bowlers = updatedBowlers;
        updatedInnings[currentInningIndex] = inning;
        const data = {
          ...state,
          scoreCard: {
            ...state.scoreCard,
            innings: updatedInnings,
          },
        };
        return {
          ...state,
          scoreCard: {
            ...state.scoreCard,
            innings: updatedInnings,
          },
        };
      }
      case "UPDATE_EXISTING_BOWLER": {
        const updatedInnings = [...state.scoreCard.innings];
        const currentInningIndex = state.scoreCard.currentInning - 1;

        const updatedBowlers = updatedInnings[currentInningIndex].bowlers.map(
          (bowler) => ({
            ...bowler,
            currentBowler: bowler.name === action.payload.selectedBowler,
          })
        );

        updatedInnings[currentInningIndex] = {
          ...updatedInnings[currentInningIndex],
          bowlers: updatedBowlers,
        };

        return {
          ...state,
          scoreCard: {
            ...state.scoreCard,
            innings: updatedInnings,
          },
        };
      }
      case "UPDATE_CURRENT_INNING": {
        const { currentInning } = action.payload;
        return {
          ...state,
          scoreCard: {
            ...state.scoreCard,
            currentInning,
          },
        };
      }

      case "UPDATE_SCORECARD":
        return {
          ...state,
          scoreCard: action.payload,
        };

      default:
        return state;
    }
  };
  const [searchParams] = useSearchParams();

  const [matchData, dispatch] = useReducer(matchReducer, null);
  const [scoreCard, setScoreCard] = useState(null);
  const [battingTeam, setBattingTeam] = useState(null);
  const [bowlingTeam, setBowlingTeam] = useState(null);
  const [currentInning, setCurrentInning] = useState(null);
  const [extras, setExtras] = useState({
    wide: false,
    noBall: false,
    byes: false,
    legByes: false,
    wicket: false,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [currentOver, setCurrentOver] = useState([]);
  const [isInningsOver, setIsInningsOver] = useState(false);

  useEffect(() => {
    async function fetchMatchData() {
      const matchId = searchParams.get("matchId");

      if (matchId) {
        try {
          const data = await getMatch(matchId);
          dispatch({
            type: "SET_MATCH_DATA",
            payload: data,
          });
        } catch (error) {
          console.error("Failed to fetch match data:", error);
        }
      }
    }

    fetchMatchData();
  }, []);
  useEffect(() => {
    if (matchData?.scoreCard?.innings?.length > 0) {
      const { scoreCard, teams } = matchData || {};
      setScoreCard(scoreCard);
      const currentInning = scoreCard.innings[scoreCard.currentInning - 1];

      const battingTeam =
        currentInning.team === "teamA" ? teams.teamA : teams.teamB;
      setBattingTeam(battingTeam);

      const bowlingTeam =
        currentInning.team === "teamA" ? teams.teamB : teams.teamA;
      setBowlingTeam(bowlingTeam);
      const { runs, wickets, overs, balls, batsmen, currentBowler } =
        currentInning;
      setCurrentInning(currentInning);
      // const totalOvers = overs + balls / 6;
      // setTotalOvers(totalOvers);
    }
  }, [matchData]);
  const handleEndOfInnings = async () => {
    await updateMatch(matchData);
    setIsInningsOver(true);
  };
  const updateMatchData = async (scoreCard) => {
    dispatch({
      type: "UPDATE_SCORECARD",
      payload: scoreCard, // Pass the updated scoreCard here
    });
    let compledBalls =
      matchData.scoreCard.innings[matchData.scoreCard.currentInning - 1].balls;
    const overCompleted = compledBalls % 6 === 0 && compledBalls !== 0;
    const maxOvers = matchData.scoringRules.maxOvers;

    if (
      overCompleted &&
      !extras.wide &&
      !extras.noBall &&
      currentInning.overs < maxOvers
    ) {
      setIsDialogOpen(true);
    } else if (
      currentInning.overs >= maxOvers ||
      currentInning.wickets === 10
    ) {
      // dispatch({
      //   type: "UPDATE_CURRENT_INNING",
      //   payload: { currentInning: 2 },
      // });
      await handleEndOfInnings();
    }
    setExtras({
      wide: false,
      noBall: false,
      byes: false,
      legByes: false,
      wicket: false,
    });
  };
  const calculateRunRate = (totalRuns, balls) => {
    const totalOvers = balls / 6;
    return totalOvers > 0 ? (totalRuns / totalOvers).toFixed(2) : 0;
  };

  const calculateRequiredRunRate = (totalRuns, balls) => {
    const runsLeft = matchData.scoreCard.innings[0].runs + 1 - totalRuns;
    const oversLeft = matchData.scoringRules.maxOvers - balls / 6;
    return oversLeft > 0 ? (runsLeft / oversLeft).toFixed(2) : 0;
  };
  const getTargetText = (targetRuns, runsScored, maxOvers, ballsBowled) => {
    const runsRequired = targetRuns + 1 - runsScored;

    const ballsRemaining = maxOvers * 6 - ballsBowled;

    return `${runsRequired} required off ${ballsRemaining} balls`;
  };
  const updateThisOver = (currentOverBowled) => {
    setCurrentOver(currentOverBowled);
  };

  const updateNewBowler = (selectedBowler) => {
    const bowler = currentInning.bowlers.find(
      (bowler) => bowler.name === selectedBowler
    );
    if (bowler) {
      dispatch({
        type: "UPDATE_EXISTING_BOWLER",
        payload: { selectedBowler },
      });
    } else if (selectedBowler) {
      dispatch({
        type: "UPDATE_CURRENT_BOWLER",
        payload: { selectedBowler },
      });
    }
    setCurrentOver([]);
    setIsDialogOpen(false);
  };
  return (
    <Box sx={{ padding: 2 }}>
      {matchData && currentInning && !isInningsOver && !showScoreCard && (
        <Suspense fallback={<div>Loading component...</div>}>
          <SelectBowler
            bowlingTeam={bowlingTeam}
            isDialogOpen={isDialogOpen}
            scoreCard={matchData.scoreCard}
            setIsDialogOpen={setIsDialogOpen}
            updateNewBowler={updateNewBowler}
          ></SelectBowler>

          <Grid spacing={3}>
            {matchData.scoreCard?.currentInning === 2 && (
              <Stack
                alignItems="flex-end"
                sx={{
                  marginBottom: "12px",
                  marginRight: "16px",
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    setShowScoreCard(true);
                  }}
                >
                  View Scorecard
                </Button>
              </Stack>
            )}
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ padding: 2, height: "82%" }}>
                  <Typography variant="h5">{battingTeam.name}</Typography>
                  <Typography variant="body1">
                    {" "}
                    {`Score: ${currentInning.runs}/${
                      currentInning.wickets
                    } in ${currentInning.overs.toFixed(1)} overs`}
                  </Typography>
                  <Typography variant="body2">
                    Extras: {currentInning.extras[0].total || 0} (w:
                    {currentInning.extras[0].wides || 0}, nb:
                    {currentInning.extras[0].noBalls || 0}, b:
                    {currentInning.extras[0].byes || 0}, lb:
                    {currentInning.extras[0].legByes || 0})
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Typography variant="body2">
                      {`Run Rate: ${calculateRunRate(
                        currentInning.runs,
                        currentInning.balls
                      )}`}
                    </Typography>
                    {matchData.scoreCard?.currentInning === 2 && (
                      <Typography variant="body2">
                        {`Required Run Rate: ${calculateRequiredRunRate(
                          currentInning.runs,
                          currentInning.balls
                        )}`}
                      </Typography>
                    )}
                  </Stack>
                  <Typography variant="body2">
                    {getTargetText(
                      matchData.scoreCard.innings[0].runs,
                      currentInning.runs,
                      matchData.scoringRules.maxOvers,
                      currentInning.balls
                    )}
                  </Typography>
                  <CurrentOver currentOver={currentOver}></CurrentOver>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper sx={{ padding: 2, marginBottom: 3 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h5">Update Scorecard</Typography>
                    <Button variant="outlined" onClick={handleEndOfInnings}>
                      {`End ${matchData.scoreCard.currentInning}${
                        matchData.scoreCard.currentInning === 1 ? "st" : "nd"
                      } Innings`}
                    </Button>
                  </Stack>
                  <ScoringActions
                    matchData={matchData}
                    battingTeam={battingTeam}
                    bowlingTeam={bowlingTeam}
                    updateMatchData={updateMatchData}
                    updateThisOver={updateThisOver}
                    currentOver={currentOver}
                    extras={extras}
                    setExtras={setExtras}
                    setCurrentOver={setCurrentOver}
                  ></ScoringActions>
                </Paper>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <BattingScoreCard
                  battingTeam={battingTeam}
                  currentInning={currentInning}
                ></BattingScoreCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <BowlingScoreCard
                  bowlingTeam={bowlingTeam}
                  currentInning={currentInning}
                ></BowlingScoreCard>
              </Grid>
            </Grid>
          </Grid>
        </Suspense>
      )}
      {isInningsOver && !showScoreCard && (
        <>
          <EndOfInnings
            matchId={matchData.matchId}
            isInningsOver={isInningsOver}
            battingTeam={battingTeam}
            bowlingTeam={bowlingTeam}
            currentInning={currentInning}
            setIsInningsOver={setIsInningsOver}
          ></EndOfInnings>
        </>
      )}
      {showScoreCard && !isInningsOver && (
        <>
          {" "}
          <MatchScoreCard
            showScoreCard={showScoreCard}
            setShowScoreCard={setShowScoreCard}
            matchData={matchData}
          ></MatchScoreCard>
        </>
      )}
    </Box>
  );
};

export default Scorecard;
