import React from "react";
import { Chip } from "@mui/material";

const colorMap = {
  scheduled: "default",
  "in-progress": "primary",
  completed: "success",
  error: "error",
};

const StatusBadge = ({ status, label }) => {
  return <Chip size="small" label={label || status} color={colorMap[status] || "default"} variant="outlined" />;
};

export default StatusBadge;
