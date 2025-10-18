// src/pages/AdminPage.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { supabase } from "../supabaseClient";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/unpaid-users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const togglePayment = async (id, module) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/payment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module }),
      });
      if (!res.ok) throw new Error("Failed to toggle payment");
      fetchUsers(); // refresh list
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={2}>
        Admin: Unpaid Users
      </Typography>

      {users.length === 0 && <Typography>No unpaid users.</Typography>}

      {users.map((u) => (
        <Box key={u._id} sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
          <Typography sx={{ fontWeight: 600 }}>{u.full_name || u.email}</Typography>
          <Stack direction="row" spacing={1} mt={1}>
            {["library", "courses", "flashcards", "quizzes"].map((module) => (
              <Button
                key={module}
                variant={u.payment?.[module] ? "contained" : "outlined"}
                color={u.payment?.[module] ? "primary" : "secondary"}
                onClick={() => togglePayment(u._id, module)}
              >
                {module}
              </Button>
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
