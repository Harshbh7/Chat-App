// src/components/Header.jsx
import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; 
import Swal from "sweetalert2";
import { createPeerConnection, createOffer, createAnswer } from "../utils/webrtc";

const Header = ({ user, onVoiceCall }) => {
  // Logout Function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Swal.fire({
        icon: "success",
        title: "Logged out successfully!",
        text: "You have been logged out.",
        timer: 2000,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: error.message,
      });
    }
  };

  const handleVoiceCall = () => {
    if (onVoiceCall) {
      onVoiceCall(); 
    }
  };

  return (
    <AppBar position="static" color="primary" lg={{ width: "100%", marginBottom: 2 }}>
      <Toolbar sx={{ width: "100%" }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {user ? `Welcome, ${user.displayName || user.email}` : "Chat App"}
        </Typography>
        {user && (
          <>
            <Button color="inherit" onClick={handleVoiceCall}>
              Voice Call
            </Button>
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{ textTransform: "none" }}
            >
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
