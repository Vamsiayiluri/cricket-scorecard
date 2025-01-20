import React from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Stack,
} from "@mui/material";

const PreviewMatch = ({ data, onConfirm }) => {
  const {
    matchDetails = {},
    teams = {},
    tossDetails = {},
    scoringRules = {},
    notes = "",
  } = data;

  const handleSubmit = () => {
    onConfirm();
  };

  return (
    <Stack width="600px">
      <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Match Preview
        </Typography>

        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="h6">Match Details</Typography>
          <Divider />
          <Box sx={{ marginTop: 2 }}>
            <Typography> {matchDetails.name}</Typography>
            <Typography>Location: {matchDetails.venue}</Typography>
            <Typography>Date: {matchDetails.dateTime}</Typography>
          </Box>
        </Box>

        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="h6">Teams</Typography>
          <Divider />
          <Box sx={{ marginTop: 2 }}>
            <Grid container spacing={4}>
              {/* Team A */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="h6"
                  sx={{ textAlign: "center", marginBottom: 2 }}
                >
                  {teams.teamA?.name}
                </Typography>
                {teams.teamA?.players.map((player, index) => (
                  <Card
                    key={index}
                    variant="outlined"
                    sx={{ backgroundColor: "#f5f5f5", marginBottom: 2 }}
                  >
                    <CardContent>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {player || "Player not named"}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Grid>

              {/* Team B */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="h6"
                  sx={{ textAlign: "center", marginBottom: 2 }}
                >
                  {teams.teamB?.name}
                </Typography>
                {teams.teamB?.players.map((player, index) => (
                  <Card
                    key={index}
                    variant="outlined"
                    sx={{ backgroundColor: "#f5f5f5", marginBottom: 2 }}
                  >
                    <CardContent>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {player || "Player not named"}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="h6">Toss Details</Typography>
          <Divider />
          <Box sx={{ marginTop: 2 }}>
            <Typography>
              Toss Winner: {tossDetails.winner || "Not selected yet"}
            </Typography>
            <Typography>
              Decision: {tossDetails.decision || "Not decided yet"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="h6">Scoring Rules</Typography>
          <Divider />
          <Box sx={{ marginTop: 2 }}>
            <Typography>Overs per side: {scoringRules.overs}</Typography>
            <Typography>Runs for Wide: {scoringRules.wide}</Typography>
            <Typography>Runs for No-ball: {scoringRules.noBall}</Typography>
          </Box>
        </Box>

        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="h6">Additional Notes</Typography>
          <Divider />
          <Box sx={{ marginTop: 2 }}>
            <Typography>{notes || "No additional notes provided"}</Typography>
          </Box>
        </Box>
      </Paper>
    </Stack>
  );
};

export default PreviewMatch;
