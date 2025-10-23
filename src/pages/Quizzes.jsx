import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  CircularProgress,
  IconButton,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { Upload, PlusCircle, FileText, Brain, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import DNAAnimation from "../components/DNAAnimation";

const API_URL = "http://localhost:4000/api/quizzes";

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", type: "success" });

  const [manualQuiz, setManualQuiz] = useState({
    title: "",
    topic: "",
    difficulty: "medium",
    questions: [{ question: "", options: ["", "", "", ""], answer: "" }],
  });

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get(API_URL);
        setQuizzes(res.data.quizzes || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuizzes();
  }, []);

  const showSnack = (msg, type = "success") => {
    setSnack({ open: true, msg, type });
  };

  // Handle manual quiz question changes
  const handleQuestionChange = (index, field, value) => {
    const updated = [...manualQuiz.questions];
    updated[index][field] = value;
    setManualQuiz({ ...manualQuiz, questions: updated });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...manualQuiz.questions];
    updated[qIndex].options[oIndex] = value;
    setManualQuiz({ ...manualQuiz, questions: updated });
  };

  const addQuestion = () => {
    setManualQuiz({
      ...manualQuiz,
      questions: [
        ...manualQuiz.questions,
        { question: "", options: ["", "", "", ""], answer: "" },
      ],
    });
  };

  const createManualQuiz = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/manual`, manualQuiz);
      setQuizzes([res.data.quiz, ...quizzes]);
      showSnack("Quiz created successfully!");
      setManualQuiz({
        title: "",
        topic: "",
        difficulty: "medium",
        questions: [{ question: "", options: ["", "", "", ""], answer: "" }],
      });
    } catch (err) {
      showSnack("Error creating quiz", "error");
    } finally {
      setLoading(false);
    }
  };

  const uploadQuiz = async () => {
    if (!file) return showSnack("Please select a file first", "warning");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setQuizzes([res.data.quiz, ...quizzes]);
      showSnack("Quiz generated from file!");
      setFile(null);
    } catch (err) {
      showSnack("Upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qIndex, option) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  const submitQuiz = () => {
    let correct = 0;
    selectedQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) correct++;
    });
    setScore(correct);
  };

  const deleteQuiz = async (id) => {
    if (!window.confirm("Delete this quiz?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setQuizzes(quizzes.filter((q) => q._id !== id));
      showSnack("Quiz deleted successfully");
    } catch (err) {
      showSnack("Failed to delete quiz", "error");
    }
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", p: 4, overflow: "hidden" }}>
      <DNAAnimation />

      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", mb: 3, color: "white", textAlign: "center" }}
      >
        🧠 MedLearn Quizzes
      </Typography>

      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              bgcolor: "#0e0e0ee0",
              color: "white",
              borderRadius: 3,
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography variant="h6" gutterBottom>
              <Brain size={20} style={{ marginRight: 8 }} />
              Generate Quiz from File
            </Typography>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ marginTop: "10px", marginBottom: "10px" }}
            />
            <Button
              variant="contained"
              startIcon={<Upload />}
              onClick={uploadQuiz}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={20} /> : "Upload & Generate"}
            </Button>
          </Paper>
        </Grid>

        {/* Manual Quiz */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              bgcolor: "#0e0e0ee0",
              color: "white",
              borderRadius: 3,
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography variant="h6" gutterBottom>
              <PlusCircle size={20} style={{ marginRight: 8 }} />
              Create Manual Quiz
            </Typography>

            <TextField
              label="Title"
              value={manualQuiz.title}
              onChange={(e) =>
                setManualQuiz({ ...manualQuiz, title: e.target.value })
              }
              fullWidth
              sx={{ mb: 2 }}
            />

            <TextField
              label="Topic"
              value={manualQuiz.topic}
              onChange={(e) =>
                setManualQuiz({ ...manualQuiz, topic: e.target.value })
              }
              fullWidth
              sx={{ mb: 2 }}
            />

            {manualQuiz.questions.map((q, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <TextField
                  label={`Question ${idx + 1}`}
                  value={q.question}
                  onChange={(e) => handleQuestionChange(idx, "question", e.target.value)}
                  fullWidth
                  sx={{ mb: 1 }}
                />
                {q.options.map((opt, oIdx) => (
                  <TextField
                    key={oIdx}
                    label={`Option ${oIdx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, oIdx, e.target.value)}
                    fullWidth
                    sx={{ mb: 1 }}
                  />
                ))}
                <TextField
                  label="Correct Answer"
                  value={q.answer}
                  onChange={(e) => handleQuestionChange(idx, "answer", e.target.value)}
                  fullWidth
                />
                <Divider sx={{ my: 2, bgcolor: "#333" }} />
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<PlusCircle />}
              onClick={addQuestion}
              sx={{ mr: 2, color: "#90caf9" }}
            >
              Add Question
            </Button>
            <Button
              variant="contained"
              onClick={createManualQuiz}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : "Save Quiz"}
            </Button>
          </Paper>
        </Grid>

        {/* Available Quizzes */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mt: 4, color: "white" }}>
            <FileText size={20} style={{ marginRight: 8 }} />
            Available Quizzes
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            {quizzes.map((quiz) => (
              <Grid item xs={12} md={4} key={quiz._id}>
                <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 200 }}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: "#1a1a1a",
                      color: "white",
                      boxShadow: "0px 0px 10px rgba(255,255,255,0.05)",
                    }}
                  >
                    <Typography variant="h6">{quiz.title}</Typography>
                    <Typography variant="body2" sx={{ color: "#aaa" }}>
                      {quiz.difficulty} • {quiz.questions.length} questions
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => setSelectedQuiz(quiz)}
                        sx={{ mr: 1 }}
                      >
                        Take Quiz
                      </Button>
                      <IconButton onClick={() => deleteQuiz(quiz._id)} color="error">
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Take Quiz Section */}
      {selectedQuiz && (
        <Paper
          sx={{
            p: 4,
            mt: 4,
            bgcolor: "#000000ee",
            color: "white",
            borderRadius: 4,
            boxShadow: "0px 0px 20px rgba(0,0,0,0.4)",
          }}
        >
          <Typography variant="h5">{selectedQuiz.title}</Typography>
          {selectedQuiz.questions.map((q, idx) => (
            <Box key={idx} sx={{ mt: 2 }}>
              <Typography>{idx + 1}. {q.question}</Typography>
              {q.options.map((opt, oIdx) => (
                <Button
                  key={oIdx}
                  variant={answers[idx] === opt ? "contained" : "outlined"}
                  sx={{ m: 1 }}
                  onClick={() => handleAnswer(idx, opt)}
                >
                  {opt}
                </Button>
              ))}
            </Box>
          ))}
          <Button variant="contained" onClick={submitQuiz} sx={{ mt: 3 }}>
            Submit Quiz
          </Button>

          {score !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ marginTop: "20px" }}
            >
              <Typography variant="h6" sx={{ color: "#90caf9" }}>
                ✅ You scored {score} / {selectedQuiz.questions.length}
              </Typography>
            </motion.div>
          )}
        </Paper>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.type}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Quizzes;
