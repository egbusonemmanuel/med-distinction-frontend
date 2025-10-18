// quiz-server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import pdfParse from "pdf-parse";
import dotenv from "dotenv";
import { CohereClient } from "cohere-ai";
import Quiz from "./models/Quiz.js"; // Quiz schema

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Quiz DB connected"))
.catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ Cohere AI client
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// ✅ Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

/**
 * Upload PDF, extract text, generate quiz with Cohere
 */
app.post("/api/quizzes/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Read uploaded PDF
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;

    // Ask Cohere to generate quiz questions
    const response = await cohere.generate({
      model: "command-xlarge-nightly",
      prompt: `Generate 5 multiple-choice quiz questions with 4 options each based on this text:\n\n${extractedText}\n\nFormat:\nQ: question?\nA) option1\nB) option2\nC) option3\nD) option4\nCorrect: <letter>`,
      max_tokens: 400,
      temperature: 0.6,
    });

    const rawText = response.generations[0].text;

    // Save quiz in DB
    const quiz = new Quiz({
      topic: req.file.originalname.replace(".pdf", ""),
      questions: rawText, // store raw text or parse into structured JSON
    });

    await quiz.save();

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ message: "✅ Quiz generated and saved", quiz });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: "Failed to process quiz" });
  }
});

/**
 * Get all quizzes
 */
app.get("/api/quizzes", async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

const PORT = process.env.QUIZ_PORT || 4001;
app.listen(PORT, () =>
  console.log(`🚀 Quiz server running at http://localhost:${PORT}`)
);
