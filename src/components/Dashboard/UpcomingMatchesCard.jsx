import React from "react";
import { Card, CardContent, Typography, List, ListItem } from "@mui/material";

const UpcomingMatchesCard = () => {
  const upcomingMatches = [
    { id: 1, title: "Team A vs Team C", date: "Dec 26, 2024, 3:00 PM" },
    { id: 2, title: "Team B vs Team D", date: "Dec 27, 2024, 10:00 AM" },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Upcoming Matches
        </Typography>
        <List>
          {upcomingMatches.map((match) => (
            <ListItem key={match.id}>
              <Typography variant="body1">
                {match.title} - {match.date}
              </Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default UpcomingMatchesCard;
