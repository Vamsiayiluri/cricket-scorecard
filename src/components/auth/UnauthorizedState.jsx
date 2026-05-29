import React from "react";
import { Stack, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AppButton from "../ui/AppButton";
import AppCard from "../ui/AppCard";
import PageContainer from "../ui/PageContainer";

const UnauthorizedState = ({
  title = "Access restricted",
  message = "You do not have permission to view this page.",
  showLogin = false,
}) => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Stack sx={{ maxWidth: 480, mx: "auto", mt: { xs: 4, md: 8 } }}>
        <AppCard title={title} subtitle={message}>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <AppButton variant="outlined" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </AppButton>
            {showLogin && (
              <AppButton component={RouterLink} to="/login">
                Sign In
              </AppButton>
            )}
          </Stack>
        </AppCard>
      </Stack>
    </PageContainer>
  );
};

export default UnauthorizedState;
