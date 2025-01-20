import React, { Suspense, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { getMatch } from "../../services/firebaseServices";
import ScoringActions from "./ScoringActions";
import SelectBowler from "./SelectBowler";
import SelectBatsman from "./Selectbatsman";
import CurrentOver from "./CurrentOver";

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
  const [searchParams] = useSearchParams();
  const [matchData, setMatchData] = useState(null);
  const [scoreCard, setScoreCard] = useState(null);
  const [battingTeam, setBattingTeam] = useState(null);
  const [bowlingTeam, setBowlingTeam] = useState(null);
  const [currentInning, setCurrentInning] = useState(null);
  const [extras, setExtras] = useState({});
  const [check, setCheck] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentOver, setCurrentOver] = useState([]);
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
  useEffect(() => {
    if (matchData?.scoreCard?.innings?.length > 0 && check) {
      const { scoreCard, teams } = matchData || {};
      setScoreCard(scoreCard);
      const currentInning = scoreCard.innings[scoreCard.currentInning - 1];
      const extras = currentInning.extras[0];
      setExtras(extras);
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
  const updateMatchData = (scoreCard) => {
    setCheck(false);

    setMatchData({ ...matchData, scoreCard: scoreCard });

    let compledBalls =
      matchData.scoreCard.innings[matchData.scoreCard.currentInning - 1].balls;
    const overCompleted = compledBalls % 6 === 0 && compledBalls !== 0;
    if (overCompleted) {
      setIsDialogOpen(true);
    }
  };
  const updateThisOver = (currentOverBowled) => {
    setCurrentOver(currentOverBowled);
  };
  const updateNewBowler = (selectedBowler) => {
    const bowler = currentInning.bowlers.find(
      (bowler) => bowler.name === selectedBowler
    );
    console.log(matchData, "d");
    if (bowler) {
      setMatchData((prevMatchData) => {
        const updatedMatchData = {
          ...prevMatchData,
          scoreCard: {
            ...prevMatchData.scoreCard,
            innings: [...prevMatchData.scoreCard.innings],
          },
        };

        const inning =
          updatedMatchData.scoreCard.innings[
            updatedMatchData.scoreCard.currentInning - 1
          ];

        const updatedBowlers = inning.bowlers.map((bowler) => ({
          ...bowler,
          currentBowler: bowler.name === selectedBowler,
        }));

        inning.bowlers = updatedBowlers;

        return updatedMatchData;
      });
    } else if (selectedBowler) {
      const bowler = {
        name: selectedBowler,
        balls: 0,
        overs: 0,
        runs: 0,
        wickets: 0,
        currentBowler: true,
      };
      setMatchData((prevMatchData) => {
        const updatedMatchData = {
          ...prevMatchData,
          scoreCard: {
            ...prevMatchData.scoreCard,
            innings: [...prevMatchData.scoreCard.innings],
          },
        };
        console.log(updatedMatchData, "2");

        const currentInningIndex = updatedMatchData.scoreCard.currentInning - 1;
        const inning = updatedMatchData.scoreCard.innings[currentInningIndex];

        const updatedBowlers = inning.bowlers.map((existingBowler) => ({
          ...existingBowler,
          currentBowler: false,
        }));
        console.log(updatedMatchData, updatedBowlers, "3");
        const newBowler = { ...bowler, currentBowler: true };
        updatedMatchData.scoreCard.innings[currentInningIndex].bowlers = [
          ...updatedBowlers,
          newBowler,
        ];
        console.log(updatedMatchData, "data");
        return updatedMatchData;
      });
    }
    setCurrentOver([]);

    setIsDialogOpen(false);
  };
  return (
    <Box sx={{ padding: 2 }}>
      {matchData && currentInning && (
        <Suspense fallback={<div>Loading component...</div>}>
          <SelectBowler
            bowlingTeam={bowlingTeam}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            updateNewBowler={updateNewBowler}
          ></SelectBowler>
          <Grid spacing={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ padding: 2, height: "82%" }}>
                  <Typography variant="h5" sx={{ marginBottom: 1 }}>
                    Team Summary
                  </Typography>
                  <Typography variant="body1">
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
                  <CurrentOver currentOver={currentOver}></CurrentOver>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper sx={{ padding: 2, marginBottom: 3 }}>
                  <Typography variant="h5">Update Scorecard</Typography>
                  <ScoringActions
                    matchData={matchData}
                    battingTeam={battingTeam}
                    bowlingTeam={bowlingTeam}
                    updateMatchData={updateMatchData}
                    updateThisOver={updateThisOver}
                    currentOver={currentOver}
                    setCurrentOver={setCurrentOver}
                  ></ScoringActions>
                </Paper>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ padding: 2 }}>
                  <Typography variant="h6" sx={{ marginBottom: 1 }}>
                    {`Batting Team: ${battingTeam.name}`}
                  </Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Batsman</TableCell>
                        <TableCell align="left">Runs</TableCell>
                        <TableCell align="left">Balls</TableCell>
                        <TableCell align="left">4s</TableCell>
                        <TableCell align="left">6s</TableCell>
                        <TableCell align="left">Strike Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentInning.batsmen &&
                        currentInning.batsmen?.map((player, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box>
                                <span>{player.name}</span>
                                {!player.isNonStriker && <span> *</span>}
                              </Box>
                              <Box>
                                {player.isOut && player.dismissal && (
                                  <span
                                    style={{
                                      fontStyle: "italic",
                                      color: "#555",
                                    }}
                                  >
                                    {player.dismissal}
                                  </span>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="right">{player.runs}</TableCell>
                            <TableCell align="right">{player.balls}</TableCell>
                            <TableCell align="right">
                              {player.fours || 0}
                            </TableCell>
                            <TableCell align="right">
                              {player.sixes || 0}
                            </TableCell>
                            <TableCell align="right">
                              {player.balls > 0
                                ? ((player.runs / player.balls) * 100).toFixed(
                                    2
                                  )
                                : "0.00"}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ padding: 2 }}>
                  <Typography variant="h6" sx={{ marginBottom: 1 }}>
                    {`Bowling Team: ${bowlingTeam.name}`}
                  </Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Bowler</TableCell>
                        <TableCell align="right">Overs</TableCell>
                        <TableCell align="right">Runs</TableCell>
                        <TableCell align="right">Wickets</TableCell>
                        <TableCell align="right">Economy</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentInning.bowlers &&
                        currentInning.bowlers.map((bowler, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {" "}
                              <span>{bowler.name}</span>
                              {bowler.currentBowler && <span> *</span>}
                            </TableCell>

                            <TableCell align="right">
                              {bowler.overs.toFixed(1)}
                            </TableCell>
                            <TableCell align="right">{bowler.runs}</TableCell>
                            <TableCell align="right">
                              {bowler.wickets}
                            </TableCell>
                            <TableCell align="right">
                              {bowler.balls > 0
                                ? (bowler.runs / (bowler.balls / 6)).toFixed(2)
                                : "0.00"}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Box></Box>
        </Suspense>
      )}
    </Box>
  );
};

export default Scorecard;
