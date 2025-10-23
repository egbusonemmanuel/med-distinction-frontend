// src/pages/FlashcardsStudy.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Box,
  IconButton,
  Typography,
  Stack,
  LinearProgress,
  Alert,
  CardActionArea,
  CssBaseline,
  createTheme,
  ThemeProvider,
  Switch,
  FormControlLabel,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Plus, Trash2, Shuffle, Moon, Sun } from "lucide-react";

export default function FlashcardsStudy() {
  const [cards, setCards] = useState([]);
  const [newCard, setNewCard] = useState({ front: "", back: "", topic: "" });
  const [flipped, setFlipped] = useState({});
  const [studied, setStudied] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("light");

  const API_BASE = import.meta.env.VITE_API_URL; // ✅ use env var

  const lightColors = ["#fff59d", "#ffccbc", "#c8e6c9", "#bbdefb", "#f8bbd0"];
  const darkColors = ["#bdb76b", "#bc8f8f", "#6b8e23", "#4682b4", "#8b668b"];

  const theme = createTheme({
    palette: {
      mode,
      background: {
        default: mode === "light" ? "#f3f2ef" : "#121212",
        paper: mode === "light" ? "#fff" : "#1d1d1d",
      },
      text: {
        primary: mode === "light" ? "#000" : "#fff",
      },
    },
  });

  // Fetch flashcards
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/flashcards`);
        setCards(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load flashcards.");
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [API_BASE]);

  const handleNewCardChange = (e) => {
    const { name, value } = e.target;
    setNewCard((prev) => ({ ...prev, [name]: value }));
  };

  // Add flashcard
  const addCard = async () => {
    if (!newCard.front || !newCard.back) {
      setError("Both front and back fields are required.");
      return;
    }
    try {
      setSaving(true);
      const palette = mode === "light" ? lightColors : darkColors;

      const res = await axios.post(`${API_BASE}/flashcards`, {
        ...newCard,
        color: palette[cards.length % palette.length],
      });

      const addedCard = res.data;
      setCards((prev) => [addedCard, ...prev]);
      setNewCard({ front: "", back: "", topic: "" });
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to add flashcard.");
    } finally {
      setSaving(false);
    }
  };

  // Delete flashcard
  const deleteCard = async (id) => {
    try {
      await axios.delete(`${API_BASE}/flashcards/${id}`);
      setCards((prev) => prev.filter((c) => c._id !== id));
      setStudied((prev) => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
    } catch (err) {
      console.error(err);
      setError("Failed to delete flashcard.");
    }
  };

  // Flip card
  const handleFlip = (id) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
    setStudied((prev) => {
      const updated = new Set(prev);
      updated.add(id);
      if (updated.size === cards.length && cards.length > 0) launchConfetti();
      return updated;
    });
  };

  // Shuffle cards
  const shuffleCards = () =>
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));

  const handleModeChange = () =>
    setMode((prev) => (prev === "light" ? "dark" : "light"));

  const studiedCount = studied.size;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          p: 4,
          minHeight: "100vh",
          background: theme.palette.background.default,
          position: "relative",
        }}
      >
        <canvas
          id="background-canvas"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <canvas
          id="confetti-canvas"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <Box sx={{ position: "relative", zIndex: 2 }}>
          {/* Create new flashcard form */}
          <Card
            sx={{
              mb: 4,
              p: 2,
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
            }}
          >
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Front"
                    name="front"
                    value={newCard.front}
                    onChange={handleNewCardChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Back"
                    name="back"
                    value={newCard.back}
                    onChange={handleNewCardChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Topic"
                    name="topic"
                    value={newCard.topic}
                    onChange={handleNewCardChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={
                      saving ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <Plus size={18} />
                      )
                    }
                    onClick={addCard}
                    disabled={saving || !newCard.front || !newCard.back}
                  >
                    {saving ? "Saving..." : "Create Flashcard"}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {/* Progress bar */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Typography variant="h6">
              📚 Studied: {studiedCount} / {cards.length}
            </Typography>
            <Box sx={{ flexGrow: 1, mx: 2 }}>
              <LinearProgress
                variant="determinate"
                value={
                  cards.length ? (studiedCount / cards.length) * 100 : 0
                }
                sx={{ height: 8, borderRadius: 5 }}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Shuffle size={18} />}
                onClick={shuffleCards}
              >
                Shuffle
              </Button>
              <FormControlLabel
                control={
                  <Switch checked={mode === "dark"} onChange={handleModeChange} />
                }
                label={mode === "dark" ? <Moon size={20} /> : <Sun size={20} />}
              />
            </Box>
          </Stack>

          {/* Cards Grid */}
          <Box sx={{ maxHeight: "70vh", overflowY: "auto" }}>
            <Grid container spacing={3}>
              {cards.length === 0 && !loading && !error ? (
                <Grid item xs={12}>
                  <Typography
                    variant="h5"
                    align="center"
                    color="text.secondary"
                  >
                    No flashcards yet! Create one above.
                  </Typography>
                </Grid>
              ) : (
                cards.map((card, index) => {
                  const palette =
                    mode === "light" ? lightColors : darkColors;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={card._id}>
                      <CardActionArea
                        component="div"
                        className={`sticky-card ${
                          flipped[card._id] ? "flipped" : ""
                        }`}
                        onClick={() => handleFlip(card._id)}
                        style={{
                          background: palette[index % palette.length],
                          transform: `rotate(${
                            index % 2 === 0 ? -3 : 3
                          }deg)`,
                        }}
                      >
                        <div className="sticky-inner">
                          <div className="sticky-front">
                            <Typography variant="h6" align="center">
                              {card.front}
                            </Typography>
                          </div>
                          <div className="sticky-back">
                            <Typography align="center">
                              {card.back}
                            </Typography>
                            {card.topic && (
                              <Chip
                                label={card.topic}
                                size="small"
                                sx={{
                                  mt: 1,
                                  bgcolor: "rgba(0,0,0,0.1)",
                                }}
                              />
                            )}
                            <IconButton
                              color="error"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCard(card._id);
                              }}
                              sx={{
                                position: "absolute",
                                bottom: 8,
                                right: 8,
                              }}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </div>
                        </div>
                      </CardActionArea>
                    </Grid>
                  );
                })
              )}
            </Grid>
          </Box>

          <style>{`
            .sticky-card {
              width: 220px;
              height: 220px;
              padding: 1rem;
              border-radius: 8px;
              box-shadow: 0 6px 12px rgba(0,0,0,0.2);
              transition: transform 0.3s, box-shadow 0.3s;
              position: relative;
              cursor: pointer;
              margin: auto;
            }
            .sticky-card:hover {
              transform: scale(1.05) rotate(0deg) !important;
              box-shadow: 0 12px 24px rgba(0,0,0,0.3);
            }
            .sticky-inner {
              width: 100%;
              height: 100%;
              position: relative;
              transform-style: preserve-3d;
              transition: transform 0.6s;
            }
            .sticky-card.flipped .sticky-inner {
              transform: rotateY(180deg);
            }
            .sticky-front, .sticky-back {
              position: absolute;
              width: 100%;
              height: 100%;
              backface-visibility: hidden;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 1rem;
              flex-direction: column;
            }
            .sticky-back {
              transform: rotateY(180deg);
            }
          `}</style>
        </Box>
      </Box>
    </ThemeProvider>
  );

  // Confetti animation
  function launchConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * 50,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      tilt: Math.random() * 10 - 10,
      tiltAngle: Math.random() * Math.PI,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.r);
        ctx.stroke();
      });
    }

    function update() {
      particles.forEach((p) => {
        p.y += Math.cos(0.01 + p.d) + 3 + p.r / 2;
        p.x += Math.sin(0.01);
        p.tiltAngle += 0.1;
        p.tilt = Math.sin(p.tiltAngle) * 15;
        if (p.y > canvas.height) p.y = -10;
      });
    }

    let interval = setInterval(() => {
      draw();
      update();
    }, 30);

    setTimeout(() => clearInterval(interval), 3000);
  }
}
