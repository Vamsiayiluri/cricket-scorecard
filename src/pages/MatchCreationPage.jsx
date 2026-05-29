import { useCallback, useEffect, useMemo, useState } from "react";
/* eslint-disable react/prop-types */
import { Box, Stack, Paper } from "@mui/material";
import MatchDetailsForm from "../components/MatchCreation/MatchDetailsForm";
import TeamsSetupForm from "../components/MatchCreation/TeamsSetupForm";
import TossDetailsForm from "../components/MatchCreation/TossDetailsForm";
import ScoringRulesForm from "../components/MatchCreation/ScoringRulesForm";
import NotesForm from "../components/MatchCreation/NotesForm";
import PreviewMatch from "../components/MatchCreation/PreviewMatch";
import WizardStepper from "../components/MatchCreation/WizardStepper";
import DraftRecoveryBanner from "../components/MatchCreation/DraftRecoveryBanner";
import StepErrorAlert from "../components/MatchCreation/StepErrorAlert";
import { saveMatch } from "../services/firebaseServices";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/ui/PageContainer";
import { useToast } from "../context/ToastContext";
import AppButton from "../components/ui/AppButton";
import {
  EMPTY_MATCH_FORM,
  MATCH_CREATION_STEPS,
} from "../constants/matchCreation";
import {
  validateStep,
  validateAllSteps,
  getStepErrorMessage,
} from "../utils/matchCreationValidation";
import {
  loadMatchCreationDraft,
  saveMatchCreationDraft,
  clearMatchCreationDraft,
  hasMeaningfulDraft,
} from "../utils/matchCreationDraft";

const normalizeTeamsFromDetails = (formData) => {
  const teams = formData.teams || {};
  return {
    ...formData,
    teams: {
      teamA: {
        ...EMPTY_MATCH_FORM.teams.teamA,
        ...teams.teamA,
        name: teams.teamA?.name || formData.matchDetails?.teamA || "",
      },
      teamB: {
        ...EMPTY_MATCH_FORM.teams.teamB,
        ...teams.teamB,
        name: teams.teamB?.name || formData.matchDetails?.teamB || "",
      },
    },
  };
};

const MatchCreationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(EMPTY_MATCH_FORM);
  const [stepErrors, setStepErrors] = useState({});
  const [stepErrorMessage, setStepErrorMessage] = useState("");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(null);

  const steps = MATCH_CREATION_STEPS;
  const isLastStep = activeStep === steps.length - 1;

  useEffect(() => {
    const draft = loadMatchCreationDraft();
    if (draft && hasMeaningfulDraft(draft.formData)) {
      setPendingDraft(draft);
    }
  }, []);

  useEffect(() => {
    if (!hasMeaningfulDraft(formData)) {
      return undefined;
    }
    const timer = setTimeout(() => {
      saveMatchCreationDraft(formData, activeStep);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData, activeStep]);

  const handleRestoreDraft = () => {
    if (!pendingDraft) {
      return;
    }
    setFormData(normalizeTeamsFromDetails(pendingDraft.formData));
    setActiveStep(pendingDraft.activeStep ?? 0);
    setPendingDraft(null);
    showToast("Draft restored", "info");
  };

  const handleDiscardDraft = () => {
    clearMatchCreationDraft();
    setPendingDraft(null);
    showToast("Draft discarded", "info");
  };

  const handleFormUpdate = useCallback((stepData) => {
    setFormData((prev) => {
      const next = { ...prev, ...stepData };
      if (stepData.matchDetails) {
        return normalizeTeamsFromDetails(next);
      }
      return next;
    });
    setStepErrorMessage("");
  }, []);

  const markStepCompleted = (stepIndex) => {
    setCompletedSteps((prev) => (prev.includes(stepIndex) ? prev : [...prev, stepIndex]));
  };

  const runStepValidation = (stepIndex) => {
    const result = validateStep(stepIndex, formData);
    if (!result.valid) {
      setStepErrors(result.errors);
      setStepErrorMessage(getStepErrorMessage(result));
      return result;
    }
    setStepErrors({});
    setStepErrorMessage("");
    markStepCompleted(stepIndex);
    return result;
  };

  const handleCreateMatch = async () => {
    const allValid = validateAllSteps(formData);
    if (!allValid.valid) {
      setStepErrors(allValid.errors);
      setStepErrorMessage("Please fix all issues in the review sections before creating.");
      showToast("Fix validation errors before creating match", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = normalizeTeamsFromDetails({
        ...formData,
        createdAt: new Date().toISOString(),
      });
      await saveMatch(payload, dispatch, navigate);
      clearMatchCreationDraft();
      showToast("Match created successfully! Set up opening players next.", "success");
    } catch {
      showToast("Unable to save match. Please review details and retry.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (isLastStep) {
      await handleCreateMatch();
      return;
    }

    if (!runStepValidation(activeStep).valid) {
      showToast(getStepErrorMessage(validateStep(activeStep, formData)), "warning");
      return;
    }

    setActiveStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setStepErrorMessage("");
    setActiveStep((prev) => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToStep = (stepIndex) => {
    setStepErrorMessage("");
    setActiveStep(stepIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentStepErrors = useMemo(() => stepErrors, [stepErrors]);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <MatchDetailsForm
            data={formData.matchDetails}
            errors={currentStepErrors}
            onUpdate={(data) => handleFormUpdate({ matchDetails: data })}
          />
        );
      case 1:
        return (
          <TeamsSetupForm
            data={formData.teams}
            teamData={formData.matchDetails}
            errors={currentStepErrors}
            onUpdate={(data) => handleFormUpdate({ teams: data })}
          />
        );
      case 2:
        return (
          <TossDetailsForm
            data={formData.tossDetails}
            teamData={formData.teams}
            errors={currentStepErrors}
            onUpdate={(data) => handleFormUpdate({ tossDetails: data })}
          />
        );
      case 3:
        return (
          <ScoringRulesForm
            data={formData.scoringRules}
            errors={currentStepErrors}
            onUpdate={(data) => handleFormUpdate({ scoringRules: data })}
          />
        );
      case 4:
        return (
          <NotesForm
            data={formData.notes}
            isPublic={formData.isPublic}
            onUpdate={(data) => handleFormUpdate({ notes: data })}
            onUpdateVisibility={(next) => handleFormUpdate({ isPublic: next })}
          />
        );
      case 5:
        return (
          <PreviewMatch
            data={formData}
            onEditStep={goToStep}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageContainer
      title="Launch New Match"
      subtitle="Complete the guided setup telemetry. Progress is autosaved dynamically."
    >
      {pendingDraft && (
        <DraftRecoveryBanner
          savedAt={pendingDraft.savedAt}
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
        />
      )}

      <WizardStepper
        steps={steps}
        activeStep={activeStep}
        completedSteps={completedSteps}
      />

      <StepErrorAlert message={stepErrorMessage} />

      <Box
        sx={{
          width: "100%",
          maxWidth: 960,
          mx: "auto",
          px: { xs: 0, sm: 1 },
          pb: 14,
        }}
      >
        <Paper
          sx={{
            p: { xs: 1.5, md: 2.5 },
            borderRadius: 1, // Inherits 8px from baseline theme
            bgcolor: "background.paper",
            border: "1px solid rgba(255, 255, 255, 0.04)",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
          }}
        >
          {renderStepContent()}
        </Paper>
      </Box>

      <PaperActions
        activeStep={activeStep}
        isLastStep={isLastStep}
        isSubmitting={isSubmitting}
        onBack={handleBack}
        onNext={handleNext}
      />
    </PageContainer>
  );
};

const PaperActions = ({ activeStep, isLastStep, isSubmitting, onBack, onNext }) => (
  <Box
    sx={{
      position: "fixed",
      bottom: 16,
      left: { xs: 16, md: "calc(260px + 24px)" },
      right: 16,
      py: 1,
      px: 2,
      borderRadius: 1, // Inherits 8px from baseline theme
      bgcolor: "rgba(15, 23, 42, 0.9)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      zIndex: 10,
      backdropFilter: "blur(8px)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6)",
      transition: "transform 150ms ease",
    }}
  >
    <Stack
      direction={{ xs: "column-reverse", sm: "row" }}
      spacing={1.5}
      justifyContent="space-between"
      sx={{ maxWidth: 720, mx: "auto" }}
    >
      <AppButton
        variant="outlined"
        disabled={activeStep === 0 || isSubmitting}
        onClick={onBack}
        fullWidth
        sx={{ minHeight: 38 }}
      >
        Previous Step
      </AppButton>
      <AppButton
        variant="contained"
        onClick={onNext}
        disabled={isSubmitting}
        loading={isSubmitting}
        fullWidth
        sx={{ minHeight: 38 }}
      >
        {isSubmitting ? "Deploying..." : isLastStep ? "Create Match & Start scoring" : "Continue"}
      </AppButton>
    </Stack>
  </Box>
);

export default MatchCreationPage;
