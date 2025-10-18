// src/pages/Landing.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Eye, Target, BookOpen, Users, Award, Twitter, Linkedin, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import logo from "../assets/medicohub-logo.jpg";

// 🌊 Water-Feel Button
function WaterButton({ children, onClick }) {
  const handleClick = (e) => {
    const button = e.currentTarget;
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = "ripple";
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    if (onClick) onClick(e);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.95 }}
      style={{ display: "inline-block", borderRadius: 999 }}
    >
      <button
        onClick={handleClick}
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "14px 36px",
          borderRadius: "999px",
          fontWeight: "bold",
          fontSize: "1.1rem",
          color: "white",
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(135deg, #1e40af, #fbbf24, #1e40af)",
          backgroundSize: "200% 200%",
          animation: "flow 6s ease infinite, pulse 3s ease-in-out infinite",
          boxShadow:
            "0 8px 24px rgba(30, 64, 175, 0.4), 0 4px 12px rgba(251, 191, 36, 0.3)",
        }}
      >
        {children}
      </button>

      <style>
        {`
          @keyframes flow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.03); }
          }
          .ripple {
            position: absolute;
            width: 20px;
            height: 20px;
            background: rgba(251, 191, 36, 0.6);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-effect 0.6s linear;
            pointer-events: none;
          }
          @keyframes ripple-effect {
            to {
              transform: scale(15);
              opacity: 0;
            }
          }
        `}
      </style>
    </motion.div>
  );
}

// 💎 Subscription Card
function SubscriptionCard({ title, price, features, accent, onSubscribe }) {
  return (
    <motion.div whileHover={{ scale: 1.03, y: -5 }} transition={{ type: "spring", stiffness: 150, damping: 12 }}>
      <Card
        sx={{
          p: 3,
          borderRadius: 4,
          textAlign: "center",
          height: "100%",
          border: `2px solid ${accent}33`,
          background: `${accent}0d`,
          boxShadow: `0 8px 24px ${accent}33, 0 0 15px ${accent}33`,
          transition: "0.3s",
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ color: accent, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="900" sx={{ mb: 2 }}>
          {price}
        </Typography>
        <Stack spacing={1} mb={3}>
          {features.map((f, i) => (
            <Typography key={i} variant="body2" sx={{ opacity: 0.8 }}>
              • {f}
            </Typography>
          ))}
        </Stack>
        <Button
          fullWidth
          onClick={onSubscribe}
          sx={{
            py: 1,
            fontWeight: 800,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${accent}, #fbbf24)`,
            color: "#001f3f",
          }}
        >
          Subscribe
        </Button>
      </Card>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  // About MedicoHub Features
  const aboutFeatures = [
    {
      icon: <Eye size={28} />,
      title: "Vision",
      text: "To be the leading hub that empowers medical students with the tools, guidance, and opportunities they need to excel academically, professionally, and personally.",
    },
    {
      icon: <Target size={28} />,
      title: "Mission",
      text: "To provide mentorship, curated learning resources, skill development, and support systems that make medical education more structured, accessible, and impactful.",
    },
  ];

  // Why Choose MedicoHub
  const whyFeatures = [
    {
      icon: <BookOpen size={28} />,
      title: "Curated Academic Library",
      text: "Access well-organized resources, quizzes, and past questions tailored for your growth.",
    },
    {
      icon: <Users size={28} />,
      title: "Mentorship & Community",
      text: "Connect with mentors and peers, collaborate, and grow within a global medical network.",
    },
    {
      icon: <Award size={28} />,
      title: "Track & Showcase Achievements",
      text: "Compete on leaderboards, earn badges, and build a portfolio that matters.",
    },
  ];

  const plans = [
    {
      title: "Free",
      price: "$0",
      features: ["Access to Quizzes", "Leaderboard", "Basic Library"],
      accent: "#1e40af",
    },
    {
      title: "Pro",
      price: "$9.99/mo",
      features: ["All Free features", "Unlimited Flashcards", "Premium Courses", "Exclusive Leaderboards"],
      accent: "#f59e0b",
    },
    {
      title: "Elite",
      price: "$19.99/mo",
      features: ["Everything in Pro", "1-on-1 Mentorship", "Early Access to Features", "Special Badge"],
      accent: "#10b981",
    },
  ];

  return (
    <Box sx={{ bgcolor: "white", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* Navbar */}
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid #f1f1f1", backdropFilter: "blur(10px)" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box component="img" src={logo} alt="MedicoHub" sx={{ width: 40, height: 40, borderRadius: 2 }} />
            <Typography fontWeight="bold" variant="h6">MedicoHub</Typography>
          </Box>
          <Box display={{ xs: "none", md: "flex" }} gap={4} fontWeight="medium">
            <button style={{ background: "none", border: "none", cursor: "pointer" }}>Demo</button>
            <button style={{ background: "none", border: "none", cursor: "pointer" }}>Community</button>
            <button style={{ background: "none", border: "none", cursor: "pointer" }}>Careers</button>
          </Box>
          <WaterButton onClick={() => navigate("/auth")}>Get Started</WaterButton>
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <Container sx={{ textAlign: "center", py: 14 }}>
        <Typography variant="h2" fontWeight="bold" sx={{
          mb: 3,
          background: "linear-gradient(90deg, #1e40af, #fbbf24)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          The Future of Medical Learning
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto", mb: 5 }}>
          MedicoHub isn’t just a platform—it’s <b>mentorship</b>, <b>curated resources</b>, and a <b>global community</b>.
        </Typography>
        <WaterButton onClick={() => navigate("/auth")}>🚀 Join MedicoHub</WaterButton>
      </Container>

      {/* About MedicoHub */}
      <Container sx={{ py: 12 }}>
        <Typography variant="h4" fontWeight="900" textAlign="center" mb={6}>About MedicoHub</Typography>
        <Grid container spacing={4}>
          {aboutFeatures.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <motion.div whileHover={{ scale: 1.03 }}>
                <Card sx={{
                  p: 4,
                  borderRadius: 4,
                  textAlign: "center",
                  boxShadow: "0 4px 20px rgba(30,64,175,0.15), 0 0 15px rgba(30,64,175,0.1)",
                  transition: "0.3s",
                }}>
                  <Box sx={{ mb: 2, color: "#1e40af" }}>{feature.icon}</Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>{feature.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{feature.text}</Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Why Choose MedicoHub */}
      <Container sx={{ py: 12 }}>
        <Typography variant="h4" fontWeight="900" textAlign="center" mb={6}>Why Choose MedicoHub?</Typography>
        <Grid container spacing={4}>
          {whyFeatures.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Card sx={{
                  p: 4,
                  borderRadius: 4,
                  textAlign: "center",
                  background: "linear-gradient(145deg, #ffffff, #f8f9ff)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 0 15px rgba(251,191,36,0.15)",
                  transition: "0.3s",
                }}>
                  <Box sx={{ mb: 2, color: "#f59e0b" }}>{feature.icon}</Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>{feature.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{feature.text}</Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Subscription Plans */}
      <Container sx={{ py: 12 }}>
        <Typography variant="h4" fontWeight="900" textAlign="center" mb={6}>💎 Subscription Plans</Typography>
        <Grid container spacing={4}>
          {plans.map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <SubscriptionCard
                title={plan.title}
                price={plan.price}
                features={plan.features}
                accent={plan.accent}
                onSubscribe={() => setSelectedPlan(plan)}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Subscription Modal */}
      <Dialog open={!!selectedPlan} onClose={() => setSelectedPlan(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Your Subscription</DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>{selectedPlan.title} - {selectedPlan.price}</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>Please make payment to the following account:</Typography>
              <Typography variant="h6">Account Name: Favour Ukpong</Typography>
              <Typography variant="h6">Account Number: 0775608543</Typography>
              <Typography variant="h6">Bank: GTB</Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                After payment, click <strong>Proceed</strong> to register/login. The admin will approve your subscription.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPlan(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            if (selectedPlan) localStorage.setItem("pendingPlan", selectedPlan.title);
            navigate("/auth");
          }}>
            Proceed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer */}
      <Box sx={{ py: 6, textAlign: "center", borderTop: "1px solid #eee" }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} MedicoHub. All rights reserved.
        </Typography>
        <Box display="flex" justifyContent="center" gap={3} mt={2}>
          <Twitter size={20} style={{ cursor: "pointer" }} />
          <Linkedin size={20} style={{ cursor: "pointer" }} />
          <Instagram size={20} style={{ cursor: "pointer" }} />
        </Box>
      </Box>
    </Box>
  );
}
