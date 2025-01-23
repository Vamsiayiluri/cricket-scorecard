import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import {
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const auth = getAuth();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user.emailVerified) {
        navigate("/dashboard");
      } else {
        const actionCodeSettings = {
          url: "http://localhost:5173/dashboard",
          handleCodeInApp: true,
        };
        await sendEmailVerification(user, actionCodeSettings);
        setError(
          "Please verify your email before logging in. Verificaion email sent"
        );
      }
    } catch (err) {
      setError("Invalid email or password.");
      console.error(err.message);
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
        Login
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Email"
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        size="small"
        sx={{ marginBottom: "16px" }}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        size="small"
        sx={{ marginBottom: "16px" }}
      />
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Login
      </Button>
      <GoogleLoginButton />
      <Typography sx={{ marginTop: "16px" }}>
        Don't have an account? <a href="/register">Register</a>
      </Typography>
    </Box>
  );
};

export default LoginPage;
