import React from "react";
import { Card, CardContent, Typography, List, ListItem } from "@mui/material";

const CompletedMatchesCard = () => {
  const completedMatches = [
    { id: 1, title: "Team A vs Team B", result: "Team A won by 5 wickets" },
    { id: 2, title: "Team C vs Team D", result: "Team D won by 3 runs" },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Completed Matches
        </Typography>
        <List>
          {completedMatches.map((match) => (
            <ListItem key={match.id}>
              <Typography variant="body1">
                {match.title} - {match.result}
              </Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default CompletedMatchesCard;
