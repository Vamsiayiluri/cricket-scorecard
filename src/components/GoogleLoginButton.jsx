import React from "react";
import { useNavigate } from "react-router-dom";
import AppButton from "./ui/AppButton";
import { useToast } from "../context/ToastContext";
import { loginWithGoogle } from "../services/firebase/authService";

const GoogleLoginButton = ({ redirectTo = "/dashboard" }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      showToast("Signed in with Google", "success");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      showToast("Google sign-in failed", "error");
    }
  };

  return (
    <AppButton variant="outlined" onClick={handleGoogleLogin} sx={{ marginTop: "16px" }}>
      Sign in with Google
    </AppButton>
  );
};

export default GoogleLoginButton;
