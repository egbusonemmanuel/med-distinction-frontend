import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
} from "@mui/material";
import axios from "axios";

function Subscriptions() {
  const [plans] = useState([
    {
      id: "free",
      name: "Free",
      price: "$0",
      features: [
        "Access to basic content",
        "Limited flashcards",
        "No premium courses",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "$9.99/month",
      features: [
        "Full library access",
        "Unlimited flashcards",
        "Premium courses",
        "Quizzes & exams",
      ],
    },
    {
      id: "elite",
      name: "Elite",
      price: "$19.99/month",
      features: [
        "All Pro features",
        "Personalized learning path",
        "1-on-1 mentor support",
      ],
    },
  ]);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [proof, setProof] = useState(null);

  const handleSubmit = async () => {
    if (!selectedPlan || !proof) {
      alert("Please select a plan and upload proof of payment");
      return;
    }

    const formData = new FormData();
    formData.append("userId", "demo-user"); // 🔹 Replace with logged-in user
    formData.append("plan", selectedPlan.id);
    formData.append("proof", proof);

    try {
      const res = await axios.post(
        "http://localhost:4000/api/subscribe/manual",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert(res.data.message || "Payment proof submitted. Pending approval.");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit subscription");
    }
  };

  return (
    <Box padding={3}>
      <Typography variant="h4" marginBottom={3}>
        💳 Subscription Plans
      </Typography>

      <Typography variant="h6" color="primary" marginBottom={3}>
        📌 Pay to Account: <strong>1234567890 - MyBank (MedLearn Ltd)</strong>
      </Typography>

      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card
              sx={{
                cursor: "pointer",
                bgcolor:
                  selectedPlan?.id === plan.id ? "#e1bee7" : "#f8bbd0",
                "&:hover": { transform: "scale(1.03)", transition: "0.3s" },
              }}
            >
              <CardContent>
                <Typography variant="h6" marginBottom={1}>
                  {plan.name}
                </Typography>
                <Typography variant="h5" marginBottom={2}>
                  {plan.price}
                </Typography>
                <ul>
                  {plan.features.map((feat, idx) => (
                    <li key={idx}>
                      <Typography variant="body2">{feat}</Typography>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="contained"
                  sx={{ marginTop: 2 }}
                  onClick={() => setSelectedPlan(plan)}
                >
                  {selectedPlan?.id === plan.id
                    ? "Selected"
                    : "Select Plan"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedPlan && (
        <Box marginTop={4}>
          <Typography variant="h6">
            Upload proof of payment for {selectedPlan.name}:
          </Typography>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setProof(e.target.files[0])}
          />
          <Button
            variant="contained"
            color="success"
            sx={{ marginTop: 2, display: "block" }}
            onClick={handleSubmit}
          >
            Submit Proof
          </Button>
        </Box>
      )}
    </Box>
  );
}
export default Subscriptions;

