import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Card,
  CardContent,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { motion } from "framer-motion";

const MotionCard = motion(Card);

const API_BASE = "http://localhost:4000/api";

export default function Leaderboard({ user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [leaderboard, setLeaderboard] = useState({}); // { quizId: { groupId: score } }
  const [recentResults, setRecentResults] = useState([]);

  // Load quizzes + groups
  useEffect(() => {
    axios.get(`${API_BASE}/quizzes`).then((res) => setQuizzes(res.data));
    axios.get(`${API_BASE}/groups`).then((res) => setGroups(res.data));

    if (user) {
      axios
        .get(`${API_BASE}/quizzes/results/${user.id}`)
        .then((res) => setRecentResults(res.data));
    }
  }, [user]);

  // Fetch leaderboard for a quiz
  const fetchLeaderboard = async (quizId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/competitions/leaderboard/${quizId}`
      );
      const quizResults = {};
      res.data.forEach((r) => {
        quizResults[r.groupId._id] = r.score;
      });
      setLeaderboard((prev) => ({ ...prev, [quizId]: quizResults }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 900 }}>
        🏆 Leaderboard
      </Typography>

      {/* Leaderboard per quiz */}
      {quizzes.map((q) => (
        <Card key={q._id} sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {q.title}
            </Typography>
            <Button
              variant="contained"
              size="small"
              sx={{ mt: 1 }}
              onClick={() => fetchLeaderboard(q._id)}
            >
              Refresh Leaderboard
            </Button>

            <Table sx={{ mt: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Group</TableCell>
                  <TableCell align="center">Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map((g) => (
                  <TableRow key={g._id}>
                    <TableCell>{g.name}</TableCell>
                    <TableCell align="center">
                      {leaderboard[q._id]?.[g._id] ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Recent Quiz Results */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12}>
          <MotionCard
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            sx={{
              p: 2,
              borderRadius: 3,
              background: "#fafafa",
              border: "1px solid #eee",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
              📊 Recent Quizzes
            </Typography>

            {recentResults.length === 0 ? (
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                No quizzes attempted yet.
              </Typography>
            ) : (
              <List>
                {recentResults.slice(0, 5).map((r, idx) => (
                  <ListItem
                    key={r._id}
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      background: idx % 2 === 0 ? "#f0f0f0" : "transparent",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 800 }}>
                          {r.quizId?.title || "Untitled Quiz"} — {r.score}/
                          {r.total}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ opacity: 0.6 }}>
                          {new Date(r.createdAt).toLocaleString()}
                        </Typography>
                      }
                    />
                    <Chip
                      label={`${Math.round((r.score / r.total) * 100)}%`}
                      sx={{
                        bgcolor: r.score / r.total >= 0.6 ? "#81c784" : "#ffb74d",
                        color: "#000",
                        fontWeight: 700,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </MotionCard>
        </Grid>
      </Grid>
    </div>
  );
}
