import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";

// Floating DNA & Water Animations
const FloatingParticles = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        zIndex: 0,
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      }}
    >
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={"dna" + i}
          initial={{ x: Math.random() * width, y: -100, opacity: 0 }}
          animate={{
            y: height + 100,
            opacity: [0, 0.7, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
          style={{
            position: "absolute",
            fontSize: Math.random() * 60 + 40,
            color: "rgba(34,163,255,0.4)",
            filter: "drop-shadow(0 0 10px #22a3ff)",
          }}
        >
          🧬
        </motion.div>
      ))}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={"water" + i}
          initial={{ x: Math.random() * width, y: -50, opacity: 0 }}
          animate={{
            y: height + 50,
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
          style={{
            position: "absolute",
            fontSize: Math.random() * 40 + 20,
            color: "rgba(34, 255, 222,0.3)",
            filter: "blur(2px)",
          }}
        >
          💧
        </motion.div>
      ))}
    </Box>
  );
};

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ open: false, text: "", severity: "info" });

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleEmailLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage({ open: true, text: error.message, severity: "error" });
    } else {
      setMessage({ open: true, text: "Login successful!", severity: "success" });
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    setLoading(false);
    if (error) {
      setMessage({ open: true, text: error.message, severity: "error" });
    }
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      <FloatingParticles />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100vh",
          px: 2,
        }}
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          style={{ width: "100%", maxWidth: 450 }}
        >
          <Paper
            elevation={16}
            sx={{
              p: 5,
              borderRadius: 4,
              backgroundColor: "rgba(0,0,0,0.85)",
              color: "#fff",
              backdropFilter: "blur(10px)",
              textAlign: "center",
            }}
          >
            <Typography variant="h4" mb={4} fontWeight="bold" color="#22a3ff">
              Med Portal
            </Typography>

            <TextField
              label="Email"
              variant="filled"
              fullWidth
              margin="dense"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{ disableUnderline: true }}
              sx={{
                backgroundColor: "rgba(255,255,255,0.05)",
                input: { color: "#fff" },
                label: { color: "#bbb" },
                mb: 2,
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="filled"
              fullWidth
              margin="dense"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                disableUnderline: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePassword} sx={{ color: "#fff" }}>
                      {showPassword ? <EyeOff /> : <Eye />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: "rgba(255,255,255,0.05)",
                input: { color: "#fff" },
                label: { color: "#bbb" },
                mb: 3,
              }}
            />

            <Button
              variant="contained"
              fullWidth
              sx={{
                mb: 2,
                background: "linear-gradient(90deg, #22a3ff, #00ffc8)",
                fontWeight: "bold",
                py: 1.5,
              }}
              onClick={handleEmailLogin}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              sx={{
                borderColor: "#22a3ff",
                color: "#22a3ff",
                py: 1.5,
                fontWeight: "bold",
                background: "rgba(255,255,255,0.05)",
                "&:hover": {
                  background: "rgba(34,163,255,0.2)",
                },
              }}
              onClick={handleGoogleLogin}
            >
              Continue with Google
            </Button>
          </Paper>
        </motion.div>
      </Box>

      <Snackbar
        open={message.open}
        autoHideDuration={4000}
        onClose={() => setMessage((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={message.severity} sx={{ width: "100%" }}>
          {message.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
