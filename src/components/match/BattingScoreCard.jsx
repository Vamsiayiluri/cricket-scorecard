/* eslint-disable react/prop-types */
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  TableContainer,
  Chip,
} from "@mui/material";
import { formatDismissal } from "../../utils/cricketScorecard";

function BattingScoreCard({ battingTeam, currentInning }) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
        {`Batting: ${battingTeam}`}
      </Typography>
      <TableContainer sx={{ borderRadius: 1, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, py: 1, px: 1.5, fontSize: "0.75rem" }}>Batsman</TableCell>
              <TableCell align="left" sx={{ fontWeight: 700, py: 1, px: 1.5, fontSize: "0.75rem" }}>Runs</TableCell>
              <TableCell align="left" sx={{ fontWeight: 700, py: 1, px: 1.5, fontSize: "0.75rem" }}>Balls</TableCell>
              <TableCell align="left" sx={{ fontWeight: 700, py: 1, px: 1.5, fontSize: "0.75rem" }}>4s</TableCell>
              <TableCell align="left" sx={{ fontWeight: 700, py: 1, px: 1.5, fontSize: "0.75rem" }}>6s</TableCell>
              <TableCell align="left" sx={{ fontWeight: 700, py: 1, px: 1.5, fontSize: "0.75rem" }}>SR</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentInning.batsmen &&
              currentInning.batsmen?.map((player, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:nth-of-type(odd)": {
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.015)"
                          : "rgba(15,23,42,0.02)",
                    },
                  }}
                >
                  <TableCell sx={{ py: 0.75, px: 1.5, fontSize: "0.8rem" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box component="span" sx={{ fontWeight: !player.isNonStriker ? 700 : 500 }}>
                        {player.name}
                      </Box>
                      {!player.isNonStriker && !player.isOut ? (
                        <Chip size="small" label="STR" color="primary" sx={{ height: 16, fontSize: "0.6rem", px: 0.5 }} />
                      ) : null}
                    </Box>
                    {player.isOut && (player.dismissal || player.dismissalType || player.wicketType) && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic", fontSize: "0.675rem", display: "block", mt: 0.25 }}>
                        {formatDismissal(player)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="left" sx={{ py: 0.75, px: 1.5, fontSize: "0.8rem", fontWeight: !player.isNonStriker && !player.isOut ? 700 : 500 }}>{player.runs}</TableCell>
                  <TableCell align="left" sx={{ py: 0.75, px: 1.5, fontSize: "0.8rem" }}>{player.balls}</TableCell>
                  <TableCell align="left" sx={{ py: 0.75, px: 1.5, fontSize: "0.8rem" }}>{player.fours || 0}</TableCell>
                  <TableCell align="left" sx={{ py: 0.75, px: 1.5, fontSize: "0.8rem" }}>{player.sixes || 0}</TableCell>
                  <TableCell align="left" sx={{ py: 0.75, px: 1.5, fontSize: "0.8rem", color: "text.secondary" }}>
                    {player.balls > 0
                      ? ((player.runs / player.balls) * 100).toFixed(1)
                      : "0.0"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default BattingScoreCard;
