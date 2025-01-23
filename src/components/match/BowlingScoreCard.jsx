import React, { useState } from "react";
import {
  Button,
  Typography,
  Stack,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
} from "@mui/material";

function BowlingScoreCard({ bowlingTeam, currentInning }) {
  return (
    <>
      <Paper sx={{ padding: 2 }}>
        <Typography variant="h6" sx={{ marginBottom: 1 }}>
          {`Bowling Team: ${bowlingTeam}`}
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bowler</TableCell>
              <TableCell align="left">Overs</TableCell>
              <TableCell align="left">Runs</TableCell>
              <TableCell align="left">Wickets</TableCell>
              <TableCell align="left">Economy</TableCell>
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

                  <TableCell align="left">{bowler.overs.toFixed(1)}</TableCell>
                  <TableCell align="left">{bowler.runs}</TableCell>
                  <TableCell align="left">{bowler.wickets}</TableCell>
                  <TableCell align="left">
                    {bowler.balls > 0
                      ? (bowler.runs / (bowler.balls / 6)).toFixed(2)
                      : "0.00"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}

export default BowlingScoreCard;
