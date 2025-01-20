import React from "react";
import { Box, Grid, Typography, Button } from "@mui/material";
import MatchOverviewCard from "../components/Dashboard/MatchOverviewCard";
import OngoingMatchesCard from "../components/Dashboard/OngoingMatchesCard";
import UpcomingMatchesCard from "../components/Dashboard/UpcomingMatchesCard";
import CompletedMatchesCard from "../components/Dashboard/CompletedMatchesCard";

const DashboardPage = () => {
  return (
    <Box sx={{ padding: "16px" }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <MatchOverviewCard />
        </Grid>
        <Grid item xs={12} sm={6}>
          <OngoingMatchesCard />
        </Grid>
        <Grid item xs={12} sm={6}>
          <UpcomingMatchesCard />
        </Grid>
        <Grid item xs={12}>
          <CompletedMatchesCard />
        </Grid>
      </Grid>
      <Box sx={{ textAlign: "center", marginTop: "16px" }}>
        <Button
          variant="contained"
          color="primary"
          href="/create-match"
          sx={{ padding: "12px", width: "100%" }}
        >
          Create New Match
        </Button>
      </Box>
    </Box>
  );
};

export default DashboardPage;
