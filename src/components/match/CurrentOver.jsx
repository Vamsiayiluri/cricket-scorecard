import React, { useState } from "react";
import { Container, Typography, Button, Grid, Box } from "@mui/material";

function CurrentOver({ currentOver }) {
  return (
    <Box sx={{ marginTop: 3 }}>
      <Typography variant="h6">This Over:</Typography>
      {currentOver && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {currentOver?.map((ball, index) => (
            <Typography
              key={index}
              sx={{
                backgroundColor: "#f0f0f0",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              {ball}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default CurrentOver;
