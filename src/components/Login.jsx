// src/components/Login.jsx
import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";
import Swal from "sweetalert2";
import Signup from "./Signup"; 

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignup, setIsSignup] = useState(false); 
  
  const handleLogin = async () => {
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please enter both email and password.",
      });
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setUser({ uid: user.uid, email: user.email });
      setIsLoggedIn(true);

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: `Welcome, ${user.email}!`,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.message,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsLoggedIn(false);

      Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "You have successfully logged out.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: error.message,
      });
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        margin: "0 auto",
        mt: 8,
        p: 4,
        boxShadow: 2,
        borderRadius: 2,
      }}
    >
      {isSignup ? (
        <>
          <Signup setUser={setUser} />
          <Typography align="center" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Button onClick={() => setIsSignup(false)}>Login</Button>
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h4" align="center" gutterBottom>
            {isLoggedIn ? "Welcome Back!" : "Login"}
          </Typography>
          {!isLoggedIn ? (
            <>
              <TextField
                fullWidth
                variant="outlined"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" fullWidth onClick={handleLogin}>
                Login
              </Button>
              <Typography align="center" sx={{ mt: 2 }}>
                Don't have an account?{" "}
                <Button onClick={() => setIsSignup(true)}>Sign Up</Button>
              </Typography>
            </>
          ) : (
            <Button variant="contained" fullWidth color="error" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </>
      )}
    </Box>
  );
};

export default Login;
