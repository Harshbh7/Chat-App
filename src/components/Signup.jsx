import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
  IconButton,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../firebase";
import { ref, set } from "firebase/database";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dm23icoaz/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setImageUrl(data.secure_url);
    } catch (error) {
      setError("Image upload failed. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      await set(ref(database, `student_list/${userId}`), {
        name,
        email,
        imageUrl,
      });

      navigate("/chat");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Grid
      sx={{ maxHeight: "100vh"}}
    >
      <Grid item xs={12} sm={8} md={5} lg={12} sx={{width: '50vw'}}>
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            padding: 3,
            boxShadow: 3,
            width: '25vw' ,
          }}
        >
          <Typography variant="h5" align="center" sx={{ marginBottom: 3 }}>
            Sign Up
          </Typography>
          {error && (
            <Typography color="error" variant="body2" sx={{ marginBottom: 2 }}>
              {error}
            </Typography>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ marginBottom: 2 }}
              required
            />
            <TextField
              label="Email"
              fullWidth
              variant="outlined"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ marginBottom: 2 }}
              required
            />
            <TextField
              label="Password"
              fullWidth
              variant="outlined"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ marginBottom: 2 }}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowPassword}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm Password"
              fullWidth
              variant="outlined"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ marginBottom: 2 }}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowConfirmPassword}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ marginBottom: 2 }}>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {imageUrl && (
                <Box mt={1} textAlign="center">
                  <img src={imageUrl} alt="Preview" width={100} style={{ borderRadius: "8px" }} />
                </Box>
              )}
            </Box>
            <Button variant="contained" color="primary" fullWidth type="submit" sx={{ marginBottom: 2 }}>
              Sign Up
            </Button>
          </form>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Signup;