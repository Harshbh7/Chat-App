import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Chat from "./components/Chat";
import { auth, database } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import theme from "./theme";

const App = () => {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const studentsRef = ref(database, "student_list");
    onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStudents(Object.entries(data).map(([id, value]) => ({ id, ...value })));
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ? { uid: user.uid, email: user.email } : null);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/chat" /> : <Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat" element={user ? <Chat user={user} students={students} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={user ? "/chat" : "/login"} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;

