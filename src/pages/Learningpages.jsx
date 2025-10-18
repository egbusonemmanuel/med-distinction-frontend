// src/pages/LearningPages.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

// ----------------- Quizzes -----------------
export const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:5000/api/quizzes")
      .then(res => setQuizzes(res.data))
      .catch(err => console.error(err));
  }, []);
  return (
    <div className="page">
      <h2>Quizzes</h2>
      <ul>
        {quizzes.map(q => (
          <li key={q._id}>{q.topic} ({q.questions.length} questions)</li>
        ))}
      </ul>
    </div>
  );
};

// ----------------- Exams -----------------
export const Exams = () => {
  const [exams, setExams] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:5000/api/exams")
      .then(res => setExams(res.data))
      .catch(err => console.error(err));
  }, []);
  return (
    <div className="page">
      <h2>Exams</h2>
      <ul>
        {exams.map(e => (
          <li key={e._id}>{e.title} ({e.questions.length} questions)</li>
        ))}
      </ul>
    </div>
  );
};

// ----------------- Groups -----------------
export const Groups = () => {
  const [groups, setGroups] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:5000/api/groups")
      .then(res => setGroups(res.data))
      .catch(err => console.error(err));
  }, []);
  return (
    <div className="page">
      <h2>Groups</h2>
      <ul>
        {groups.map(g => (
          <li key={g._id}>{g.name} ({g.members.length} members)</li>
        ))}
      </ul>
    </div>
  );
};

// ----------------- Competitions -----------------
export const Competitions = () => {
  const [competitions, setCompetitions] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:5000/api/competitions")
      .then(res => setCompetitions(res.data))
      .catch(err => console.error(err));
  }, []);
  return (
    <div className="page">
      <h2>Competitions</h2>
      <ul>
        {competitions.map(c => (
          <li key={c._id}>{c.name} ({c.groupIds.length} groups)</li>
        ))}
      </ul>
    </div>
  );
};

// ----------------- Leaderboard -----------------
export const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:5000/api/leaderboard")
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
    axios.get("http://localhost:5000/api/leaderboard/groups")
      .then(res => setGroups(res.data))
      .catch(err => console.error(err));
  }, []);
  return (
    <div className="page">
      <h2>Leaderboard</h2>
      <h3>Top Users</h3>
      <ol>{users.map(u => <li key={u._id}>{u.username} - {u.totalXP} XP</li>)}</ol>
      <h3>Top Groups</h3>
      <ol>{groups.map(g => <li key={g._id}>{g.name} - {g.totalXP} XP</li>)}</ol>
    </div>
  );
};

// ----------------- Optional default -----------------
export default { Quizzes, Exams, Groups, Competitions, Leaderboard };
