import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    const auth = getAuth();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      const actionCodeSettings = {
        url: "http://localhost:5173/dashboard",
        handleCodeInApp: true,
      };
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await sendEmailVerification(user, actionCodeSettings);

      setSuccess(
        "Account created successfully! Please check your inbox to verify your email."
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="primary">{success}</Typography>}
      <TextField
        label="Email"
        variant="outlined"
        size="small"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ marginBottom: "16px" }}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        size="small"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ marginBottom: "16px" }}
      />
      <TextField
        label="Confirm Password"
        type="password"
        variant="outlined"
        size="small"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        sx={{ marginBottom: "16px" }}
      />
      <Button variant="contained" color="primary" onClick={handleRegister}>
        Send Verification link
      </Button>
      <Typography sx={{ marginTop: "16px" }}>
        Already have an account? <a href="/login">Login</a>
      </Typography>
    </Box>
  );
};

export default RegisterPage;
