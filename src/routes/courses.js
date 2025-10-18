// src/pages/Courses.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch courses");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Generate course
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:4000/api/courses/generate", { topic });
      setCourses(prev => [res.data, ...prev]);
      setTopic("");
    } catch (err) {
      console.error(err);
      setError("Failed to generate course");
    } finally {
      setLoading(false);
    }
  };

  // Delete course
  const handleDelete = async (id) => {
    if (!id) return alert("Invalid course ID");
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await axios.delete(`http://localhost:4000/api/courses/${id}`);
      setCourses(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete course");
    }
  };

  return (
    <div className="container">
      <h1>Courses</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="Enter topic..."
        />
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Course"}
        </button>
      </div>

      <ul>
        {courses.map(course => (
          <li key={course._id} style={{ marginBottom: "1rem" }}>
            <strong>{course.title}</strong> ({course.category})<br />
            {course.description}<br />
            <button onClick={() => handleDelete(course._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Courses;
