/* eslint-disable react/prop-types */
import {
  Box,
  LinearProgress,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

const WizardStepper = ({ steps, activeStep, completedSteps = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const progress = ((activeStep + 1) / steps.length) * 100;

  // Custom step icon renderer for a premium sports-tech SaaS feel
  const CustomStepIcon = (props) => {
    const { active, completed, icon } = props;

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "50%",
          fontSize: "0.75rem",
          fontWeight: 800,
          transition: "transform 150ms ease, background-color 150ms ease",
          backgroundColor: completed
            ? "success.main"
            : active
            ? "primary.main"
            : "rgba(255, 255, 255, 0.05)",
          border: completed
            ? "none"
            : active
            ? "1px solid #8B5CF6"
            : "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: active
            ? "0 0 8px rgba(108, 99, 255, 0.25)"
            : "none",
          color: completed || active ? "#F8FAFC" : "text.secondary",
        }}
      >
        {completed ? (
          <CheckIcon sx={{ fontSize: 12, strokeWidth: 2.5, color: "#071120" }} />
        ) : (
          icon
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        mb: 2,
        p: { xs: 1.5, md: 2 },
        borderRadius: 1, // Inherits 8px from baseline theme
        bgcolor: "background.paper",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "primary.main" }}>
          Step {activeStep + 1} of {steps.length}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>
          {Math.round(progress)}% Complete
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          mb: 2,
          height: 3,
          borderRadius: 999,
          bgcolor: "rgba(255,255,255,0.06)",
          "& .MuiLinearProgress-bar": {
            borderRadius: 999,
            background: "linear-gradient(90deg, #6C63FF 0%, #8B5CF6 50%, #22C55E 100%)",
          },
        }}
      />

      <Stepper
        activeStep={activeStep}
        alternativeLabel={!isMobile}
        orientation={isMobile ? "vertical" : "horizontal"}
        sx={{
          "& .MuiStepConnector-line": {
            borderColor: "rgba(255, 255, 255, 0.06)",
            borderWidth: "1.5px",
          },
          "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
            borderColor: "primary.main",
          },
          "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
            borderColor: "success.main",
          },
        }}
      >
        {steps.map((step, index) => (
          <Step key={step.id} completed={completedSteps.includes(index)}>
            <StepLabel
              StepIconComponent={(props) => <CustomStepIcon {...props} icon={index + 1} />}
              optional={
                index === activeStep && !isMobile ? (
                  <Typography variant="caption" sx={{ color: "primary.light", fontWeight: 700, fontSize: "0.72rem" }}>
                    In progress
                  </Typography>
                ) : null
              }
              sx={{
                "& .MuiStepLabel-label": {
                  fontWeight: index === activeStep ? 700 : 500,
                  fontSize: { xs: "0.9rem", md: "0.85rem" },
                  color: index === activeStep ? "text.primary" : "text.secondary",
                  mt: 0.5,
                },
              }}
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default WizardStepper;
