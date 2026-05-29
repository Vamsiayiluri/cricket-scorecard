import React from "react";
import {
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Box,
} from "@mui/material";

function BowlingScoreCard({ bowlingTeam, currentInning }) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
        {`Bowling: ${bowlingTeam}`}
      </Typography>
      <TableContainer sx={{ borderRadius: 1, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, py: 1, px: 1.5, fontSize: "0.75rem" }}>Bowler</TableCell>
              <TableCell align="left" sx={{ fontWeight: 700, py: 1, px: 1.5, fontSize: "0.75rem" }}>Overs</TableCell>
              <TableCell align="left" sx={{ fontWeight: 700, py: 1, px: 1.5, fontSize: "0.75rem" }}>Runs</TableCell>
              <TableCell align="left" sx={{ fontWeight: 700, py: 1, px: 1.5, fontSize: "0.75rem" }}>Wkts</TableCell>
              <TableCell align="left" sx={{ fontWeight: 700, py: 1, px: 1.5, fontSize: "0.75rem" }}>Eco</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentInning.bowlers &&
              currentInning.bowlers.map((bowler, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:nth-of-type(odd)": { bgcolor: "rgba(255,255,255,0.01)" } }}
                >
                  <TableCell sx={{ py: 0.75, px: 1.5, fontSize: "0.8rem" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box component="span" sx={{ fontWeight: bowler.currentBowler ? 700 : 500 }}>
                        {bowler.name}
                      </Box>
                      {bowler.currentBowler && (
                        <Chip size="small" label="Current" color="primary" sx={{ height: 16, fontSize: "0.6rem", px: 0.5 }} />
                      )}
                    </Box>
                  </TableCell>

                  <TableCell align="left" sx={{ py: 0.75, px: 1.5, fontSize: "0.8rem" }}>{bowler.overs.toFixed(1)}</TableCell>
                  <TableCell align="left" sx={{ py: 0.75, px: 1.5, fontSize: "0.8rem", fontWeight: bowler.currentBowler ? 700 : 500 }}>{bowler.runs}</TableCell>
                  <TableCell align="left" sx={{ py: 0.75, px: 1.5, fontSize: "0.8rem", fontWeight: bowler.currentBowler ? 700 : 500 }}>{bowler.wickets}</TableCell>
                  <TableCell align="left" sx={{ py: 0.75, px: 1.5, fontSize: "0.8rem", color: "text.secondary" }}>
                    {bowler.balls > 0
                      ? (bowler.runs / (bowler.balls / 6)).toFixed(2)
                      : "0.00"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default BowlingScoreCard;
