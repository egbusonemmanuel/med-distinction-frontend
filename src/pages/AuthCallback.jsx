// src/pages/AuthCallback.jsx
import { useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      // Save session so user remains logged in
      supabase.auth.setSession({ access_token, refresh_token })
        .then(() => {
          navigate("/dashboard"); // Redirect after successful auth
        })
        .catch(() => {
          navigate("/auth");
        });
    } else {
      navigate("/auth");
    }
  }, [navigate]);

  return (
    <Box sx={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "#22a3ff"
    }}>
      <CircularProgress color="inherit" />
    </Box>
  );
}
