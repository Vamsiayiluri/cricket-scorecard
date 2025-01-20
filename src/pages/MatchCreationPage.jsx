import React, { useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import MatchDetailsForm from "../components/MatchCreation/MatchDetailsForm";
import TeamsSetupForm from "../components/MatchCreation/TeamsSetupForm";
import TossDetailsForm from "../components/MatchCreation/TossDetailsForm";
import ScoringRulesForm from "../components/MatchCreation/ScoringRulesForm";
import NotesForm from "../components/MatchCreation/NotesForm";
import PreviewMatch from "../components/MatchCreation/PreviewMatch";
import { saveMatch } from "../services/firebaseServices";
import { useDispatch } from "react-redux";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import db from "../firebase-config";
import { useNavigate } from "react-router-dom";

const steps = [
  "Match Details",
  "Teams Setup",
  "Toss Details",
  "Scoring Rules",
  "Notes",
  "Preview",
];

const MatchCreationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    matchDetails: {},
    teams: {},
    tossDetails: {},
    scoringRules: {},
    notes: "",
  });

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      try {
        const matchData = {
          ...formData,
          createdAt: new Date().toISOString(),
        };
        console.log("success");

        await saveMatch(matchData, dispatch, navigate);
      } catch (error) {
        console.error("Error saving match: ", error);
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFormUpdate = (stepData) => {
    setFormData((prevData) => ({ ...prevData, ...stepData }));
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <MatchDetailsForm
            data={formData.matchDetails}
            onUpdate={(data) => handleFormUpdate({ matchDetails: data })}
          />
        );
      case 1:
        return (
          <TeamsSetupForm
            data={formData.teams}
            teamData={formData.matchDetails}
            onUpdate={(data) => handleFormUpdate({ teams: data })}
          />
        );
      case 2:
        return (
          <TossDetailsForm
            data={formData.tossDetails}
            teamData={formData.teams}
            onUpdate={(data) => handleFormUpdate({ tossDetails: data })}
          />
        );
      case 3:
        return (
          <ScoringRulesForm
            data={formData.scoringRules}
            onUpdate={(data) => handleFormUpdate({ scoringRules: data })}
          />
        );
      case 4:
        return (
          <NotesForm
            data={formData.notes}
            onUpdate={(data) => handleFormUpdate({ notes: data })}
          />
        );
      case 5:
        return <PreviewMatch data={formData} />;
      default:
        return "Unknown Step";
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        padding: "16px",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Create New Match
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box
        sx={{
          marginTop: "16px",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {renderStepContent(activeStep)}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: "48px",
        }}
      >
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        <Button onClick={handleNext} variant="contained" color="primary">
          {activeStep === steps.length - 1 ? "Start Match" : "Next"}
        </Button>
      </Box>
    </Box>
  );
};

export default MatchCreationPage;
