import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const MatchOverviewCard = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Match Overview
        </Typography>
        <Typography variant="body1">Total Matches: 25</Typography>
        <Typography variant="body1">Wins: 15</Typography>
        <Typography variant="body1">Losses: 10</Typography>
      </CardContent>
    </Card>
  );
};

export default MatchOverviewCard;
