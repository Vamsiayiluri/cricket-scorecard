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

function BattingScoreCard({ battingTeam, currentInning }) {
  return (
    <>
      <Paper sx={{ padding: 2 }}>
        <Typography variant="h6" sx={{ marginBottom: 1 }}>
          {`Batting Team: ${battingTeam}`}
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
                  <TableCell align="left">{player.runs}</TableCell>
                  <TableCell align="left">{player.balls}</TableCell>
                  <TableCell align="left">{player.fours || 0}</TableCell>
                  <TableCell align="left">{player.sixes || 0}</TableCell>
                  <TableCell align="left">
                    {player.balls > 0
                      ? ((player.runs / player.balls) * 100).toFixed(2)
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

export default BattingScoreCard;
