// src/pages/Courses.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  IconButton,
  Grid,
  Chip,
  CircularProgress,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { motion } from "framer-motion";
import { PlusCircle, Trash2, BookOpen, ChevronDown, Upload } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

// 3D background imports
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";

// Motion card for animations
const MotionCard = motion(Card);

// 3D Background Component
function Background3D() {
  return (
    <Canvas
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
      camera={{ position: [0, 0, 5], fov: 75 }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      {/* Stars effect */}
      <Stars radius={50} depth={50} count={5000} factor={4} fade />

      {/* Floating Sphere */}
      <mesh rotation={[0.4, 0.2, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#1e3a8a" wireframe />
      </mesh>

      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
    </Canvas>
  );
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");
  const [moduleDoc, setModuleDoc] = useState("");
  const [assignments, setAssignments] = useState([{ title: "", deadline: null }]);

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/api/courses");

      // Sort courses so the most recent is first
      const sortedCourses = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setCourses(sortedCourses);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Generate new course
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:4000/api/courses/generate", {
        topic,
        email: "demo@user.com",
      });

      // Correctly push the new course to the top
      setCourses((prev) => [res.data.course, ...prev]);
      setTopic("");
    } catch (err) {
      console.error(err);
      setError("❌ Failed to generate course");
    } finally {
      setLoading(false);
    }
  };

  // Delete course
  const handleDelete = async (id) => {
    if (!id) return alert("Invalid course ID");
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await axios.delete(`http://localhost:4000/api/courses/${id}`, {
        data: { email: "demo@user.com" },
      });
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      setError("❌ Failed to delete course");
    }
  };

  // -----------------------------
  // Add Module + Assignments
  // -----------------------------
  const handleAssignmentChange = (index, field, value) => {
    const updated = [...assignments];
    updated[index][field] = value;
    setAssignments(updated);
  };

  const addAssignmentField = () => {
    setAssignments((prev) => [...prev, { title: "", deadline: null }]);
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://localhost:4000/api/library/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setModuleDoc(res.data.filename);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to upload document");
    }
  };

  const handleAddModule = async () => {
    if (!selectedCourse || !moduleTitle.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:4000/api/courses/${selectedCourse._id}/modules`,
        {
          title: moduleTitle,
          description: moduleDesc,
          documents: moduleDoc ? [moduleDoc] : [],
          assignments: assignments
            .filter((a) => a.title.trim())
            .map((a) => ({
              title: a.title,
              deadline: a.deadline ? a.deadline.toISOString() : null,
            })),
        }
      );

      setCourses((prev) =>
        prev.map((c) =>
          c._id === selectedCourse._id ? { ...c, curriculum: res.data.curriculum } : c
        )
      );

      // reset
      setOpenDialog(false);
      setModuleTitle("");
      setModuleDesc("");
      setModuleDoc("");
      setAssignments([{ title: "", deadline: null }]);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to add module");
    }
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* 3D Background */}
      <Background3D />

      {/* Foreground Content */}
      <Box sx={{ position: "relative", zIndex: 2, p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Typography
          variant="h4"
          fontWeight={900}
          mb={3}
          sx={{
            background: "linear-gradient(90deg,#1e3a8a,#fbbf24)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          📖 Courses
        </Typography>

        {/* Error Message */}
        {error && (
          <Typography
            variant="body2"
            sx={{
              color: "red",
              background: "rgba(255,0,0,0.1)",
              p: 1,
              borderRadius: 2,
              mb: 2,
            }}
          >
            {error}
          </Typography>
        )}

        {/* Input + Button */}
        <Stack direction="row" spacing={2} mb={4}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Enter topic..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={loading}
            startIcon={<PlusCircle size={18} />}
            sx={{
              background: "linear-gradient(90deg,#1e3a8a,#fbbf24)",
              color: "white",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { opacity: 0.9 },
            }}
          >
            {loading ? "Generating..." : "Generate"}
          </Button>
        </Stack>

        {/* Loading spinner */}
        {loading && courses.length === 0 && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress color="warning" />
          </Box>
        )}

        {/* Course Grid */}
        <Grid container spacing={3}>
          {courses.map((course, i) => (
            <Grid item xs={12} sm={6} md={4} key={course._id || i}>
              <MotionCard
                whileHover={{ scale: 1.05, y: -4 }}
                transition={{ type: "spring", stiffness: 120, damping: 10 }}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="h6" fontWeight={700}>
                      {course.title || "Untitled"}
                    </Typography>
                    <IconButton color="error" onClick={() => handleDelete(course._id)}>
                      <Trash2 size={18} />
                    </IconButton>
                  </Stack>
                  <Chip
                    label={course.category || "General"}
                    size="small"
                    icon={<BookOpen size={14} />}
                    sx={{
                      mb: 1,
                      background: "rgba(30,58,138,0.1)",
                      color: "#1e3a8a",
                      fontWeight: 600,
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: "0.9rem",
                      lineHeight: 1.4,
                      mb: 2,
                    }}
                  >
                    {course.description || "No description available."}
                  </Typography>

                  {/* Add Module Button */}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PlusCircle size={14} />}
                    onClick={() => {
                      setSelectedCourse(course);
                      setOpenDialog(true);
                    }}
                    sx={{ mb: 2 }}
                  >
                    Add Module
                  </Button>

                  {/* Curriculum Accordion */}
                  {course.curriculum?.length > 0 &&
                    course.curriculum.map((mod, idx) => (
                      <Accordion key={idx} sx={{ borderRadius: 2, mb: 1 }}>
                        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
                          <Typography fontWeight={600}>{mod.title}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {/* Documents */}
                          <Stack spacing={1} mb={1}>
                            {mod.documents?.map((doc, i) => (
                              <Link
                                key={i}
                                href={`http://localhost:4000/api/library/${doc}`}
                                target="_blank"
                                underline="hover"
                                sx={{ display: "block", fontSize: "0.85rem" }}
                              >
                                📄 {doc}
                              </Link>
                            ))}
                          </Stack>

                          {/* Assignments */}
                          <Stack spacing={1}>
                            {mod.assignments?.map((a, i) => (
                              <Chip
                                key={i}
                                label={`${a.title} — Due: ${
                                  a.deadline
                                    ? new Date(a.deadline).toLocaleDateString()
                                    : "No deadline"
                                }`}
                                color={
                                  a.deadline && new Date(a.deadline) < new Date()
                                    ? "error"
                                    : "success"
                                }
                                sx={{ fontWeight: 500 }}
                              />
                            ))}
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <Box textAlign="center" mt={6}>
            <Typography variant="h6" color="text.secondary">
              No courses yet. Try generating one!
            </Typography>
          </Box>
        )}

        {/* Add Module Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>Add Module</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Module Title"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              fullWidth
            />
            <TextField
              label="Description"
              value={moduleDesc}
              onChange={(e) => setModuleDesc(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />

            {/* Document Upload */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Upload size={16} />}
                size="small"
              >
                Upload Doc
                <input type="file" hidden onChange={handleDocUpload} />
              </Button>
              {moduleDoc && (
                <Typography variant="body2" color="text.secondary">
                  📄 {moduleDoc}
                </Typography>
              )}
            </Stack>

            {/* Assignments Section */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
              Assignments
            </Typography>
            {assignments.map((a, i) => (
              <Stack key={i} direction="row" spacing={2} alignItems="center">
                <TextField
                  label="Assignment Title"
                  value={a.title}
                  onChange={(e) => handleAssignmentChange(i, "title", e.target.value)}
                  fullWidth
                />
                <DatePicker
                  label="Deadline"
                  value={a.deadline}
                  onChange={(newValue) => handleAssignmentChange(i, "deadline", newValue)}
                  slotProps={{ textField: { size: "small" } }}
                />
              </Stack>
            ))}
            <Button size="small" onClick={addAssignmentField}>
              ➕ Add Assignment
            </Button>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleAddModule}
              startIcon={<PlusCircle size={16} />}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
