import React from "react";
import { Card, CardContent, Typography, List, ListItem } from "@mui/material";

const OngoingMatchesCard = () => {
  const ongoingMatches = [
    { id: 1, title: "Team A vs Team B", score: "125/4 in 15.3 overs" },
    { id: 2, title: "Team C vs Team D", score: "89/2 in 10 overs" },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Ongoing Matches
        </Typography>
        <List>
          {ongoingMatches.map((match) => (
            <ListItem key={match.id}>
              <Typography variant="body1">
                {match.title} - {match.score}
              </Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default OngoingMatchesCard;
