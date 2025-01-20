import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import "./firebase-config";
import ProtectedRoute from "./pages/ProtectedRoute";
import MatchCreationPage from "./pages/MatchCreationPage";
import MatchScoring from "./pages/MatchScoring";
import Scorecard from "./components/match/ScoreCard";
import { Box } from "@mui/material";
const App = () => {
  return (
    <Box>
      <Navbar />
      <Box
        sx={{
          marginTop: "64px",
        }}
      >
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-match"
              element={
                <ProtectedRoute>
                  <MatchCreationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/start-match"
              element={
                <ProtectedRoute>
                  <MatchScoring />
                </ProtectedRoute>
              }
            />
            <Route
              path="/score-card"
              element={
                <ProtectedRoute>
                  <Scorecard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </Box>
    </Box>
  );
};

export default App;
