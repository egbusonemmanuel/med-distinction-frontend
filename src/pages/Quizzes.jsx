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
} from "@mui/material";
import { Upload, PlusCircle, FileText, Brain, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import DNAAnimation from "../components/DNAAnimation"; // We'll create this next

const API_URL = "http://localhost:4000/api/quizzes";

const Quizzes = ({ user }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [file, setFile] = useState(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [manualQuiz, setManualQuiz] = useState({
    title: "",
    topic: "",
    difficulty: "medium",
    questions: [{ question: "", options: ["", "", "", ""], answer: "" }],
  });

  // Load all quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      const res = await axios.get(API_URL);
      setQuizzes(res.data.quizzes || []);
    };
    fetchQuizzes();
  }, []);

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

  // Add another question
  const addQuestion = () => {
    setManualQuiz({
      ...manualQuiz,
      questions: [
        ...manualQuiz.questions,
        { question: "", options: ["", "", "", ""], answer: "" },
      ],
    });
  };

  // Create quiz manually
  const createManualQuiz = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/manual`, manualQuiz);
      setQuizzes([res.data.quiz, ...quizzes]);
      setManualQuiz({
        title: "",
        topic: "",
        difficulty: "medium",
        questions: [{ question: "", options: ["", "", "", ""], answer: "" }],
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload file to generate quiz
  const uploadQuiz = async () => {
  if (!file) return alert("Please select a file first");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post("http://localhost:4000/api/quizzes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("✅ Upload successful:", res.data);
  } catch (err) {
    console.error("❌ Upload error:", err);
  }
};


  // Handle answers
  const handleAnswer = (qIndex, option) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  // Submit quiz
  const submitQuiz = async () => {
    let correct = 0;
    selectedQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) correct++;
    });
    setScore(correct);
  };

  // Delete quiz
  const deleteQuiz = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    setQuizzes(quizzes.filter((q) => q._id !== id));
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
        {/* Upload or Generate Quiz */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: "#101010d9", color: "white", borderRadius: 3 }}>
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
            >
              {loading ? <CircularProgress size={20} /> : "Upload & Generate"}
            </Button>
          </Paper>
        </Grid>

        {/* Manual Quiz Creation */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: "#101010d9", color: "white", borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              <PlusCircle size={20} style={{ marginRight: 8 }} />
              Create Manual Quiz
            </Typography>

            <TextField
              label="Title"
              value={manualQuiz.title}
              onChange={(e) => setManualQuiz({ ...manualQuiz, title: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />

            <TextField
              label="Topic"
              value={manualQuiz.topic}
              onChange={(e) => setManualQuiz({ ...manualQuiz, topic: e.target.value })}
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

        {/* Quiz List */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mt: 4, color: "white" }}>
            <FileText size={20} style={{ marginRight: 8 }} />
            Available Quizzes
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            {quizzes.map((quiz) => (
              <Grid item xs={12} md={4} key={quiz._id}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: "#1a1a1a",
                      color: "white",
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

      {/* Take Quiz Modal */}
      {selectedQuiz && (
        <Paper
          sx={{
            p: 4,
            mt: 4,
            bgcolor: "#000000ee",
            color: "white",
            borderRadius: 4,
          }}
        >
          <Typography variant="h5">{selectedQuiz.title}</Typography>
          {selectedQuiz.questions.map((q, idx) => (
            <Box key={idx} sx={{ mt: 2 }}>
              <Typography>
                {idx + 1}. {q.question}
              </Typography>
              {q.options.map((opt, oIdx) => (
                <Button
                  key={oIdx}
                  variant={
                    answers[idx] === opt ? "contained" : "outlined"
                  }
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
    </Box>
  );
};

export default Quizzes;
