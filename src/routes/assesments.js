import express from "express";
import mongoose from "mongoose";

// Models (adjust paths if your project structure differs)
import Quiz from "../models/Quiz.js";
import Exam from "../models/Exam.js";
import Competition from "../models/Competition.js";
import Group from "../models/Group.js";
import Leaderboard from "../models/leaderboard.js";

const router = express.Router();

// Attempt model: create if not already defined (safe-guard for single-file usage)
const AttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["quiz", "exam"], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Quiz or Exam
  answers: [
    {
      questionId: String,
      selected: mongoose.Schema.Types.Mixed,
      correct: Boolean,
    },
  ],
  score: { type: Number, default: 0 },
  durationSec: Number,
  createdAt: { type: Date, default: Date.now },
});

const Attempt = mongoose.models.Attempt || mongoose.model("Attempt", AttemptSchema);

// Optional: auth middleware placeholder (replace with your real middleware)
// import { authMiddleware } from "../middleware/authCheck.js";
const authMiddleware = (req, res, next) => {
  // If you have authentication, attach req.user = { id: ..., name: ..., groups: [...] }
  // For now, allow through and assume frontend passes user identity in body (not secure)
  next();
};

/* =====================
   QUIZ ROUTES
   - create quiz (admin/instructor)
   - get quiz
   - attempt quiz
   - quiz leaderboard
===================== */

// Create a quiz
router.post("/quizzes", authMiddleware, async (req, res) => {
  try {
    const { topic, title, difficulty = "medium", questions = [] } = req.body;
    if (!title && !topic) return res.status(400).json({ error: "title or topic required" });

    const quiz = new Quiz({ topic, title: title || topic, difficulty, questions });
    await quiz.save();
    res.json({ success: true, quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create quiz" });
  }
});

// Get quiz by id
router.get("/quizzes/:id", authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

// Attempt quiz: expects { userId, answers: [{ questionId, selected }], durationSec }
router.post("/quizzes/:id/attempt", authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const { userId, answers = [], durationSec = 0 } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    // Score calculation: compare selected to correctAnswer field on each question
    let score = 0;
    const annotated = answers.map((ans) => {
      const q = quiz.questions.find((qq) => qq._id && qq._id.toString() === (ans.questionId || "")) ||
                quiz.questions.find((qq) => qq.question && qq.question === ans.questionText);
      const correct = !!(q && (ans.selected === q.correctAnswer));
      if (correct) score += 1;
      return { questionId: ans.questionId, selected: ans.selected, correct };
    });

    const attempt = new Attempt({
      user: userId,
      type: "quiz",
      targetId: quiz._id,
      answers: annotated,
      score,
      durationSec,
    });

    await attempt.save();

    // Optionally update leaderboard
    try {
      let userLb = await Leaderboard.findOne({ userId });
      if (!userLb) {
        userLb = new Leaderboard({ userId, name: req.body.name || "Unknown", xp: score, streak: 1, lastActive: new Date() });
      } else {
        userLb.xp += score;
        userLb.lastActive = new Date();
        await userLb.save();
      }
      await userLb.save();
    } catch (e) {
      console.warn("Failed to update leaderboard:", e.message);
    }

    res.json({ success: true, attempt, score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit quiz attempt" });
  }
});

// Quiz leaderboard
router.get("/quizzes/:id/leaderboard", authMiddleware, async (req, res) => {
  try {
    const attempts = await Attempt.find({ type: "quiz", targetId: req.params.id })
      .populate("user", "name")
      .sort({ score: -1, durationSec: 1 })
      .limit(50);

    const board = attempts.map((a) => ({ user: a.user?.name || a.user, score: a.score, time: a.durationSec, date: a.createdAt }));
    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch quiz leaderboard" });
  }
});

/* =====================
   EXAM ROUTES
===================== */

// Create exam
router.post("/exams", authMiddleware, async (req, res) => {
  try {
    const { title, duration = 60, questions = [] } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });
    const exam = new Exam({ title, duration, questions });
    await exam.save();
    res.json({ success: true, exam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create exam" });
  }
});

// Submit exam (once or multiple depending on logic)
router.post("/exams/:id/submit", authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    const { userId, answers = [], durationSec = 0 } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    // scoring as in quizzes
    let score = 0;
    const annotated = answers.map((ans) => {
      const q = exam.questions.find((qq) => qq._id && qq._id.toString() === (ans.questionId || "")) ||
                exam.questions.find((qq) => qq.question && qq.question === ans.questionText);
      const correct = !!(q && (ans.selected === q.correctAnswer));
      if (correct) score += 1;
      return { questionId: ans.questionId, selected: ans.selected, correct };
    });

    const attempt = new Attempt({ user: userId, type: "exam", targetId: exam._id, answers: annotated, score, durationSec });
    await attempt.save();

    // Update leaderboard (similar to quiz)
    try {
      let userLb = await Leaderboard.findOne({ userId });
      if (!userLb) {
        userLb = new Leaderboard({ userId, name: req.body.name || "Unknown", xp: score, streak: 1, lastActive: new Date() });
      } else {
        userLb.xp += score;
        userLb.lastActive = new Date();
        await userLb.save();
      }
      await userLb.save();
    } catch (e) {
      console.warn("Failed to update leaderboard:", e.message);
    }

    res.json({ success: true, attempt, score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit exam" });
  }
});

// Exam leaderboard
router.get("/exams/:id/leaderboard", authMiddleware, async (req, res) => {
  try {
    const attempts = await Attempt.find({ type: "exam", targetId: req.params.id })
      .populate("user", "name")
      .sort({ score: -1, durationSec: 1 })
      .limit(50);

    const board = attempts.map((a) => ({ user: a.user?.name || a.user, score: a.score, time: a.durationSec, date: a.createdAt }));
    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch exam leaderboard" });
  }
});

/* =====================
   GROUPS & COMPETITIONS
===================== */

// Join group (userId in body) - in production use authenticated user
router.post("/groups/:id/join", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }
    res.json({ success: true, group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to join group" });
  }
});

// Create competition (instructor/admin)
router.post("/competitions", authMiddleware, async (req, res) => {
  try {
    const { title, type, relatedId, groups = [], startDate, endDate } = req.body;
    if (!title || !type || !relatedId) return res.status(400).json({ error: "title, type and relatedId required" });
    const comp = new Competition({ title, type, relatedId, groups, startDate, endDate, results: [] });
    await comp.save();
    res.json({ success: true, comp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create competition" });
  }
});

// Submit attempt within competition
// Expects userId, answers, durationSec
router.post("/competitions/:id/attempt", authMiddleware, async (req, res) => {
  try {
    const comp = await Competition.findById(req.params.id).populate("groups");
    if (!comp) return res.status(404).json({ error: "Competition not found" });

    const { userId, answers = [], durationSec = 0 } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    // Determine user's group within the competition
    const userGroup = comp.groups.find((g) => g.members && g.members.includes(mongoose.Types.ObjectId(userId))) || null;

    // If groups are stored as ObjectIds without members populated, accept groupId in body
    let groupId = userGroup ? userGroup._id : req.body.groupId;
    if (!groupId) return res.status(400).json({ error: "Could not determine user's group. Provide groupId in request." });

    // Load target quiz/exam
    let target = null;
    if (comp.type === "quiz") target = await Quiz.findById(comp.relatedId);
    else target = await Exam.findById(comp.relatedId);
    if (!target) return res.status(404).json({ error: "Target quiz/exam not found" });

    // Score calculation (reuse logic)
    let score = 0;
    const annotated = answers.map((ans) => {
      const q = target.questions.find((qq) => qq._id && qq._id.toString() === (ans.questionId || "")) ||
                target.questions.find((qq) => qq.question && qq.question === ans.questionText);
      const correct = !!(q && (ans.selected === q.correctAnswer));
      if (correct) score += 1;
      return { questionId: ans.questionId, selected: ans.selected, correct };
    });

    // Save attempt
    const attempt = new Attempt({ user: userId, type: comp.type, targetId: comp.relatedId, answers: annotated, score, durationSec });
    await attempt.save();

    // Update competition.results
    let groupResult = comp.results.find((r) => r.group.toString() === groupId.toString());
    if (!groupResult) {
      groupResult = { group: mongoose.Types.ObjectId(groupId), score: 0, participants: [] };
      comp.results.push(groupResult);
    }
    groupResult.score += score;
    if (!groupResult.participants.map((p) => p.toString()).includes(userId.toString())) {
      groupResult.participants.push(mongoose.Types.ObjectId(userId));
    }

    await comp.save();

    // Optional: update platform leaderboard
    try {
      let userLb = await Leaderboard.findOne({ userId });
      if (!userLb) {
        userLb = new Leaderboard({ userId, name: req.body.name || "Unknown", xp: score, streak: 1, lastActive: new Date() });
      } else {
        userLb.xp += score;
        userLb.lastActive = new Date();
        await userLb.save();
      }
      await userLb.save();
    } catch (e) {
      console.warn("Failed to update leaderboard:", e.message);
    }

    res.json({ success: true, attempt, competition: comp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit competition attempt", details: err.message });
  }
});

// Competition leaderboard
router.get("/competitions/:id/leaderboard", authMiddleware, async (req, res) => {
  try {
    const comp = await Competition.findById(req.params.id).populate("groups");
    if (!comp) return res.status(404).json({ error: "Competition not found" });

    // Build board: map results -> group name & score
    const board = await Promise.all(comp.results.map(async (r) => {
      const group = await Group.findById(r.group).select("name members");
      return { group: group?.name || r.group, score: r.score, participants: r.participants?.length || 0 };
    }));

    // Sort descending
    board.sort((a, b) => b.score - a.score);
    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch competition leaderboard" });
  }
});

export default router;

