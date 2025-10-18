// src/pages/Competitions.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Competitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [title, setTitle] = useState("");
  const [quizId, setQuizId] = useState("");
  const [groupIds, setGroupIds] = useState([]);

  useEffect(() => {
    fetchCompetitions();
    fetchQuizzes();
    fetchGroups();
  }, []);

  const fetchCompetitions = async () => {
    const res = await axios.get("http://localhost:4000/api/competitions");
    setCompetitions(res.data);
  };

  const fetchQuizzes = async () => {
    const res = await axios.get("http://localhost:4000/api/quizzes");
    setQuizzes(res.data);
  };

  const fetchGroups = async () => {
    const res = await axios.get("http://localhost:4000/api/groups");
    setGroups(res.data);
  };

  const createCompetition = async () => {
    try {
      await axios.post("http://localhost:4000/api/competitions", {
        title,
        quizId,
        groupIds,
      });
      fetchCompetitions();
    } catch (err) {
      console.error("Error creating competition:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Competitions</h2>

      <div className="mb-6">
        <input
          className="border p-2 mr-2"
          placeholder="Competition Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          className="border p-2 mr-2"
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
        >
          <option value="">Select Quiz</option>
          {quizzes.map((q) => (
            <option key={q._id} value={q._id}>
              {q.title || q.topic}
            </option>
          ))}
        </select>
        <select
          multiple
          className="border p-2 mr-2"
          value={groupIds}
          onChange={(e) =>
            setGroupIds([...e.target.selectedOptions].map((o) => o.value))
          }
        >
          {groups.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={createCompetition}
        >
          Create Competition
        </button>
      </div>

      <h3 className="font-semibold">Existing Competitions</h3>
      // Competitions.jsx
<ul>
  {competitions.map(c => (
    <li key={c._id}>
      <h3>{c.title}</h3>
      <p>Type: {c.type}</p>
      <button onClick={() => startCompetition(c._id)}>Start</button>
      <button onClick={() => viewLeaderboard(c._id)}>Leaderboard</button>
    </li>
  ))}
</ul>

    </div>
  );
};

export default Competitions;
