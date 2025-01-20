import React from "react";
import { Button } from "@mui/material";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const handleGoogleLogin = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log("Google login successful!");

      navigate("/dashboard");
    } catch (error) {
      console.error("Google login error:", error.message);
    }
  };

  return (
    <Button
      variant="outlined"
      color="primary"
      onClick={handleGoogleLogin}
      sx={{ marginTop: "16px" }}
    >
      Sign in with Google
    </Button>
  );
};

export default GoogleLoginButton;
