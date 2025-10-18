// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Typography, Card, Stack } from "@mui/material";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get("/api/users");
    setUsers(res.data);
  };

  const upgradeUser = async (userId, plan) => {
    await axios.post("/api/admin/upgrade", { userId, plan });
    fetchUsers(); // refresh
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Stack spacing={2}>
        {users.map((u) => (
          <Card key={u._id} style={{ padding: 16 }}>
            <Typography variant="h6">{u.name} ({u.email})</Typography>
            <Typography>Plan: {u.subscriptionPlan}</Typography>
            <Typography>Status: {u.subscriptionStatus}</Typography>
            <Stack direction="row" spacing={2} mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => upgradeUser(u._id, "Pro")}
              >
                Upgrade to Pro
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => upgradeUser(u._id, "Elite")}
              >
                Upgrade to Elite
              </Button>
            </Stack>
          </Card>
        ))}
      </Stack>
    </div>
  );
}
