// src/pages/Dashboard.jsx
// ✅ Load admins from .env
const ADMIN_EMAILS = import.meta.env.VITE_ADMIN_EMAILS?.split(",") || [];

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  IconButton,
  LinearProgress,
  Button,
  Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  BookOpen,
  Brain,
  ClipboardCheck,
  GraduationCap,
  Heart,
  Medal,
  Lock,
  User,
} from "lucide-react";
import { fetchUserProfile as fetchProfile } from "../lib/api";


/* ============================
   Inject self-contained CSS for background animations
   ============================ */
function injectAnimatedCSS() {
  if (document.getElementById("medicohub-animated-css")) return;
  const s = document.createElement("style");
  s.id = "medicohub-animated-css";
  s.innerHTML = `
/* Subtle particle / cell drift */
@keyframes floaty {
  0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.9; }
  50% { transform: translateY(-14px) translateX(6px) scale(1.05); opacity: 1; }
  100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.9; }
}

/* DNA helix rotation */
@keyframes spin-helix {
  0% { transform: rotate(0deg) translateY(0); }
  100% { transform: rotate(360deg) translateY(0); }
}

/* ECG animate stroke */
@keyframes ecg-move {
  0% { stroke-dashoffset: 1000; }
  100% { stroke-dashoffset: 0; }
}

/* shine sweep for medals */
@keyframes shine {
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(200%); opacity: 0; }
}

/* gentle backdrop blur on panels for readability */
.mh-panel {
  backdrop-filter: blur(6px);
}

/* card lock overlay */
.mh-locked-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(5,10,20,0.45), rgba(5,10,20,0.55));
  border-radius: 8px;
  pointer-events: none;
}

/* reduced motion fallback */
@media (prefers-reduced-motion: reduce) {
  .dna-helix, .particle, .ecg-path, .medal-shine, .heartbeat-pulse { animation: none !important; }
}
  `;
  document.head.appendChild(s);
}

/* ============================
   Helpers & small components
   ============================ */
const MotionCard = motion(Card);
const MotionBox = motion(Box);

/* Animated numeric counter (digit-smooth) */
function AnimatedNumber({ value = 0, duration = 900, className = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf;
    const from = display;
    const to = value;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = Math.floor(from + (to - from) * eased);
      setDisplay(cur);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span className={className}>{display.toLocaleString()}</span>;
}

/* Liquid XP bar */
function LiquidXP({ xp = 0, next = 1000, accent = "#38bdf8", height = 14 }) {
  const pct = Math.min(100, Math.round(((xp ?? 0) / (next || 1)) * 100));
  return (
    <Box sx={{ width: "100%", mt: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, fontSize: 12 }}>
        <span style={{ opacity: 0.85 }}>Level progress</span>
        <span style={{ opacity: 0.85 }}>{pct}%</span>
      </Box>
      <Box
        sx={{
          width: "100%",
          height,
          borderRadius: height / 2,
          overflow: "hidden",
          background: "rgba(255,255,255,0.06)",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            height: "100%",
            background: `linear-gradient(90deg, ${accent}, #fbbf24 60%)`,
            boxShadow: "inset 0 -6px 14px rgba(0,0,0,0.18)",
          }}
        />
      </Box>
      <Box sx={{ mt: 0.5, fontSize: 12, opacity: 0.9 }}>
        <span style={{ float: "left" }}>{xp}/{next} XP</span>
        <span style={{ float: "right" }}>{pct}%</span>
        <div style={{ clear: "both" }} />
      </Box>
    </Box>
  );
}

/* Small Module Card (tilt + hover) with optional lock/disabled state */
function ModuleCard({
  icon,
  title,
  desc,
  onClick,
  accent,
  disabled = false,      // disabled if user cannot access
  lockLabel = "Locked",
  paymentRequired = false, // new: show payment message if module is locked
}) {
  return (
    <MotionCard
      whileHover={disabled ? {} : { scale: 1.03, y: -6 }}
      transition={{ type: "spring", stiffness: 160, damping: 14 }}
      onClick={disabled ? undefined : onClick}
      className="mh-panel"
      sx={{
        p: 2,
        height: "100%",
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.06)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Stack alignItems="center" spacing={1} sx={{ opacity: disabled ? 0.95 : 1 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${accent}14`,
            border: `1px solid ${accent}22`,
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8, textAlign: "center" }}>
          {desc}
        </Typography>
      </Stack>

      {disabled && (
        <div className="mh-locked-overlay" aria-hidden>
          <Box sx={{ textAlign: "center", color: "rgba(255,255,255,0.9)" }}>
            <Lock size={28} />
            <Typography sx={{ fontWeight: 800, mt: 1 }}>
              {lockLabel}
            </Typography>
            {paymentRequired ? (
              <Typography variant="caption" sx={{ display: "block", opacity: 0.9 }}>
                Payment required to unlock
              </Typography>
            ) : (
              <Typography variant="caption" sx={{ display: "block", opacity: 0.9 }}>
                Contact admin to request access
              </Typography>
            )}
          </Box>
        </div>
      )}
    </MotionCard>
  );
}


/* DNABackground: subtle rotating helix + drifting particles + ECG waveform */
function DNABackdrop({ dark, accent = "#38bdf8", ecgColor = "#fbbf24" }) {
  // small inline SVG: helix + ecg path
  return (
    <svg
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="dnaGrad" x1="0%" x2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="60%" stopColor={ecgColor} stopOpacity="0.12" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.06" />
        </linearGradient>
        <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      {/* faint radial glow */}
      <rect width="100%" height="100%" fill="transparent" />

      {/* drifting particles (circles) */}
      {[...Array(14)].map((_, i) => {
        const cx = 5 + i * 7;
        const cy = 20 + ((i * 13) % 80);
        const r = 6 + (i % 4) * 3;
        const delay = (i % 5) * 0.6;
        return (
          <circle
            key={`p-${i}`}
            cx={`${(cx * 10) % 1600}`}
            cy={`${(cy * 8) % 900}`}
            r={r}
            fill={accent}
            opacity={0.06 + (i % 3) * 0.03}
            style={{
              transformOrigin: "center",
              animation: `floaty 6s ${delay}s ease-in-out infinite`,
              filter: "blur(2px)",
            }}
          />
        );
      })}

      {/* left helix */}
      <g
        transform="translate(120,300)"
        style={{ animation: "spin-helix 40s linear infinite", transformOrigin: "center" }}
        opacity={0.9}
      >
        <path
          d="M0,0 C80, -80 160,80 240,0 C320,-80 400,80 480,0"
          stroke="url(#dnaGrad)"
          strokeWidth="4"
          fill="none"
          opacity="0.25"
        />
        <g opacity="0.18">
          <circle cx="0" cy="0" r="8" fill={accent} />
          <circle cx="240" cy="0" r="6" fill={ecgColor} />
          <circle cx="480" cy="0" r="7" fill={accent} />
        </g>
      </g>

      {/* right helix */}
      <g
        transform="translate(1200,380)"
        style={{ animation: "spin-helix 48s linear reverse infinite", transformOrigin: "center" }}
        opacity={0.88}
      >
        <path
          d="M0,0 C80, -80 160,80 240,0 C320,-80 400,80 480,0"
          stroke="url(#dnaGrad)"
          strokeWidth="4"
          fill="none"
          opacity="0.22"
        />
        <g opacity="0.14">
          <circle cx="60" cy="0" r="8" fill={ecgColor} />
          <circle cx="300" cy="0" r="6" fill={accent} />
          <circle cx="480" cy="0" r="6" fill={ecgColor} />
        </g>
      </g>

      {/* ECG waveform across bottom */}
      <g transform="translate(0,720)">
        <path
          d="M-100 40 L0 40 L40 10 L80 70 L120 40 L300 40 L340 10 L380 70 L420 40 L700 40 L740 10 L780 70 L820 40 L1200 40"
          stroke={ecgColor}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.14"
          style={{
            filter: "blur(0.8px)",
            strokeDasharray: 1000,
            strokeDashoffset: 1000,
            animation: "ecg-move 5s linear infinite",
          }}
        />
      </g>
    </svg>
  );
}

/* Medal shine overlay (used in leaderboard top 3) */
function MedalShine() {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "-120%",
          top: 0,
          width: "50%",
          height: "100%",
          transform: "skewX(-18deg)",
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.0), rgba(255,255,255,0.35), rgba(255,255,255,0.0))",
          animation: "shine 1.6s ease-in-out 0s",
        }}
        className="medal-shine"
      />
    </div>
  );
}

/* =============================
   Main Dashboard component
   ============================= */
export default function Dashboard() {
  injectAnimatedCSS();
  const navigate = useNavigate();

  // state
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(true); // start in dark cinematic mode

  // heartbeat tempo — makes pulses sync to streak
  const heartbeatRate = useMemo(() => 1 + Math.min(0.9, (stats?.streak ?? 0) / 40), [stats]);

  // theme choices (readable but atmospheric)
  const theme = useMemo(
    () =>
      darkMode
        ? {
            bg: "linear-gradient(180deg,#04102a,#081226)",
            text: "#E6F3FF",
            panel: "rgba(255,255,255,0.04)",
            accent: "#22a3ff",
            gold: "#fbbf24",
            panelBorder: "rgba(255,255,255,0.06)",
            lowOpacityRow: "rgba(255,255,255,0.02)",
          }
        : {
            bg: "linear-gradient(180deg,#f7fbff,#eef6ff)",
            text: "#062033",
            panel: "rgba(0,18,35,0.04)",
            accent: "#1e3a8a",
            gold: "#f59e0b",
            panelBorder: "rgba(0,18,35,0.08)",
            lowOpacityRow: "rgba(0,0,0,0.03)",
          },
    [darkMode]
  );

  const quotes = [
    "Medicine is a science of uncertainty and an art of probability. — W. Osler",
    "Wherever the art of Medicine is loved, there is also a love of Humanity. — Hippocrates",
    "Small steps every day build mastery. — MEDICO HUB",
    "Study the patient, not the disease. — William Osler",
  ];

  // load data
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          navigate("/");
          return;
        }
        setUser(session.user);

        const [p, s, lb] = await Promise.all([
          fetchProfile(),
          fetchUserStats(session.user.id),
          fetchLeaderboard(12),
        ]);

        if (!mounted) return;
        setProfile(p ?? {});
        setStats(
          s ?? {
            courses_enrolled: 0,
            flashcards_count: 0,
            quizzes_attempted: 0,
            xp: 0,
            streak: 0,
            rank: "—",
            level_next: 1000,
            achievements: [],
          }
        );
        setLeaderboard(lb ?? []);
        // slight delay for cinematic load
        setTimeout(() => mounted && setLoading(false), 700);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  // rotate quotes
  useEffect(() => {
    const t = setInterval(() => setQuoteIndex((i) => (i + 1) % quotes.length), 5200);
    return () => clearInterval(t);
  }, []);

  // realtime leaderboard update
  useEffect(() => {
    const sub = supabase
      .channel("public:leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard_scores" },
        () => {
          fetchLeaderboard(12).then((d) => setLeaderboard(d ?? [])).catch(console.error);
        }
      )
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  // rank calculation (keep stats.rank in sync)
  useEffect(() => {
    if (!stats || !leaderboard.length || !user) return;
    const sorted = [...leaderboard].sort((a, b) => b.xp - a.xp);
    const rankIndex = sorted.findIndex((u) => u.id === user.id);
    setStats((prev) => (prev ? { ...prev, rank: rankIndex >= 0 ? `#${rankIndex + 1}` : "—" } : prev));
  }, [leaderboard, user, stats]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const displayName = profile?.full_name || user?.email?.split?.[0] || "Student";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  // helper medal emoji
  const topEmoji = (i) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`);

  // ✅ Admin override + paid logic
const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);
const isPaidLibrary = !!profile?.access?.library;
const isPaidCourses = !!profile?.access?.courses;

const approvedLibrary = isAdmin || isPaidLibrary;
const approvedCourses = isAdmin || isPaidCourses;

  /* --------------------
     Loading / initial view
     -------------------- */
  if (loading) {
    return (
      <motion.div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: theme.bg,
          color: theme.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <DNABackdrop dark={darkMode} accent={theme.accent} ecgColor={theme.gold} />
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.1 }}>
          <Heart size={72} style={{ color: theme.gold, filter: `drop-shadow(0 8px 24px ${theme.gold}33)` }} />
        </motion.div>
        <Typography variant="h6" sx={{ mt: 2, color: theme.text, fontWeight: 800 }}>
          Booting MEDICO HUB…
        </Typography>
      </motion.div>
    );
  }

  /* =====================
     Main Dashboard UI
     ===================== */
  return (
    <motion.div
      animate={{ background: theme.bg, color: theme.text }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{ minHeight: "100vh", width: "100%", position: "relative", overflowX: "hidden" }}
    >
      {/* animated backdrop (SVG) */}
      <DNABackdrop dark={darkMode} accent={theme.accent} ecgColor={theme.gold} />

      <Box sx={{ position: "relative", zIndex: 2, p: { xs: 2, md: 4 } }}>
        {/* Top bar: heartbeat + toggle */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 / heartbeatRate, ease: "easeInOut" }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Heart style={{ color: theme.gold, filter: `drop-shadow(0 6px 18px ${theme.gold}33)` }} />
                <div>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {displayName}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>
                    {profile?.role || "Student"}
                  </Typography>
                </div>
              </div>
            </motion.div>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={darkMode ? "Switch to Light" : "Switch to Dark"}>
              <IconButton
                onClick={() => setDarkMode((d) => !d)}
                sx={{ color: theme.text, bgcolor: "transparent" }}
              >
                {darkMode ? <Sun /> : <Moon />}
              </IconButton>
            </Tooltip>

            <Button
              onClick={handleSignOut}
              variant="contained"
              sx={{
                background: `linear-gradient(90deg, ${theme.accent}, ${theme.gold})`,
                color: "#001f3f",
                fontWeight: 800,
                borderRadius: 2,
                px: 2,
                py: 0.6,
              }}
            >
              Sign Out
            </Button>
          </Stack>
        </Box>

        {/* Header */}
        <Box textAlign="center" mb={3}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              background: `linear-gradient(90deg, ${theme.accent}, ${theme.gold})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 1.2,
            }}
          >
            MEDICO HUB
          </Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.85, mt: 0.5 }}>
            Your playful, medical command center
          </Typography>
        </Box>

        {/* Top row: Session panel + Modules */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={6}>
            <MotionCard
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mh-panel"
              sx={{
                p: 2,
                borderRadius: 3,
                background: theme.panel,
                border: `1px solid ${theme.panelBorder}`,
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                    SESSION
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                    <AnimatedNumber value={stats?.xp ?? 0} /> XP
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>
                    Level {profile?.level ?? 1} • Rank {stats?.rank}
                  </Typography>

                  <LiquidXP xp={stats?.xp ?? 0} next={stats?.level_next ?? 1000} accent={theme.accent} />
                </Box>

                <Box sx={{ width: 160, textAlign: "center" }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Streak
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, mt: 0.5 }}>
                      <AnimatedNumber value={stats?.streak ?? 0} /> days
                    </Typography>
                  </Box>

                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 0.9 / heartbeatRate }}
                    style={{ marginTop: 8 }}
                  >
                    <Heart style={{ color: theme.gold }} />
                  </motion.div>

                  <Box mt={1}>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      Achievements
                    </Typography>
                    <Box display="flex" gap={1} justifyContent="center" mt={1}>
                      {(stats?.achievements ?? []).slice(0, 3).length ? (
                        (stats?.achievements ?? []).slice(0, 3).map((a, i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 6,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: `${theme.accent}14`,
                              border: `1px solid ${theme.accent}22`,
                            }}
                          >
                            <Medal size={14} style={{ color: theme.gold }} />
                          </Box>
                        ))
                      ) : (
                        <Typography variant="caption" sx={{ opacity: 0.6 }}>
                          No badges yet
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </MotionCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <ModuleCard
                  title="Library"
                  desc="Videos, audio & docs"
                  icon={<BookOpen />}
                  onClick={() => navigate("/library")}
                  accent={theme.accent}
                  disabled={!approvedLibrary}
                  lockLabel="Academic library locked"
                />
              </Grid>
              <Grid item xs={6}>
                <ModuleCard
                  title="Flashcards"
                  desc="Memorize fast"
                  icon={<Brain />}
                  onClick={() => navigate("/flashcards")}
                  accent={theme.accent}
                />
              </Grid>
              <Grid item xs={6}>
                <ModuleCard
                  title="Quizzes"
                  desc="Challenge knowledge"
                  icon={<ClipboardCheck />}
                  onClick={() => navigate("/quizzes")}
                  accent={theme.accent}
                />
              </Grid>
              <Grid item xs={6}>
                <ModuleCard
                  title="Courses"
                  desc="Structured paths"
                  icon={<GraduationCap />}
                  onClick={() => navigate("/courses")}
                  accent={theme.accent}
                  disabled={!approvedCourses}
                  lockLabel="Courses locked"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Middle row: Leaderboard + Quick stats */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={7}>
            <MotionCard
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mh-panel"
              sx={{ p: 2, borderRadius: 3, background: theme.panel, border: `1px solid ${theme.panelBorder}` }}
            >
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                🏥 Leaderboard
              </Typography>

              <List>
                {leaderboard.length === 0 ? (
                  <Typography variant="caption" sx={{ opacity: 0.6 }}>
                    No leaderboard data yet.
                  </Typography>
                ) : (
                  leaderboard.map((lb, idx) => {
                    const isMe = user && lb.id === user.id;
                    const xpPct = Math.min(100, Math.round(((lb.xp ?? 0) % 2000) / 2000 * 100));
                    return (
                      <motion.div key={lb.id ?? idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}>
                        <ListItem
                          sx={{
                            mb: 1,
                            borderRadius: 2,
                            background: idx % 2 === 0 ? theme.lowOpacityRow : "transparent",
                            alignItems: "center",
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                            <Chip
                              label={topEmoji(idx)}
                              sx={{
                                bgcolor: idx === 0 ? theme.gold : "transparent",
                                color: idx === 0 ? "#000" : theme.text,
                                fontWeight: 800,
                              }}
                            />
                            <Avatar src={lb.avatar_url} />
                            <ListItemText
                              primary={<Typography sx={{ fontWeight: isMe ? 900 : 700 }}>{lb.name}</Typography>}
                              secondary={<Typography variant="caption" sx={{ opacity: 0.6 }}>{lb.title ?? "Medic"}</Typography>}
                            />
                          </Stack>

                          <Box sx={{ width: 220, mr: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={xpPct}
                              sx={{
                                height: 10,
                                borderRadius: 8,
                                background: "rgba(255,255,255,0.03)",
                                "& .MuiLinearProgress-bar": {
                                  background: isMe ? `linear-gradient(90deg, ${theme.gold}, ${theme.accent})` : `linear-gradient(90deg, ${theme.accent}, ${theme.gold})`,
                                },
                              }}
                            />
                            <Typography variant="caption" sx={{ ml: 0.5 }}>
                              {lb.xp ?? 0} XP
                            </Typography>
                          </Box>
                        </ListItem>
                      </motion.div>
                    );
                  })
                )}
              </List>
            </MotionCard>
          </Grid>

          <Grid item xs={12} md={5}>
            <MotionCard initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mh-panel" sx={{ p: 2, borderRadius: 3, background: theme.panel, border: `1px solid ${theme.panelBorder}` }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Quick Diagnostics
              </Typography>

              <Grid container spacing={1} mt={1}>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                      Courses
                    </Typography>
                    <Typography sx={{ fontWeight: 900 }}><AnimatedNumber value={stats?.courses_enrolled ?? 0} /></Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                      Flashcards
                    </Typography>
                    <Typography sx={{ fontWeight: 900 }}><AnimatedNumber value={stats?.flashcards_count ?? 0} /></Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                      Quizzes
                    </Typography>
                    <Typography sx={{ fontWeight: 900 }}><AnimatedNumber value={stats?.quizzes_attempted ?? 0} /></Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                      Rank
                    </Typography>
                    <Typography sx={{ fontWeight: 900 }}>{stats?.rank}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box mt={2}>
                <Button onClick={() => navigate("/profile")} fullWidth sx={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.gold})`, color: "#001f3f", fontWeight: 800 }}>
                  Open Profile & Achievements
                </Button>
              </Box>
            </MotionCard>
          </Grid>
        </Grid>

        {/* Footer: holographic quote */}
        <Box textAlign="center" mt={3}>
          <MotionBox initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} sx={{ display: "inline-block", p: 2, borderRadius: 2, background: theme.panel, border: `1px solid ${theme.panelBorder}` }}>
            <Typography variant="subtitle1" sx={{ fontStyle: "italic", opacity: 0.95 }}>{quotes[quoteIndex]}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.6, display: "block", mt: 0.6 }}>{new Date().toLocaleDateString()}</Typography>
          </MotionBox>
        </Box>
      </Box>
    </motion.div>
  );
}
