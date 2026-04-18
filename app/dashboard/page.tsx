"use client";

import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function Dashboard() {
  const [items, setItems] = useState<any[]>([]);

  const fetchItems = async () => {
    try {
      const res = await api.get("/api/items");
      setItems(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 📊 Stats
  const totalItems = items.length;
  const totalStock = items.reduce((acc, i) => acc + i.stock, 0);
  const totalValue = items.reduce((acc, i) => acc + i.price * i.stock, 0);

  return (
    <Container sx={{ mt: 5 }}>
      {/* 🔥 TITLE */}
      <Typography
        variant="h4"
        sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}
      >
        📊 Dashboard Overview
      </Typography>

      {/* 📊 STATS CARDS */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          mb: 5,
        }}
      >
        {[
          { label: "Total Items", value: totalItems },
          { label: "Total Stock", value: totalStock },
          { label: "Inventory Value", value: `₹${totalValue}` },
        ].map((stat, index) => (
          <Box
            key={index}
            sx={{ flex: "1 1 250px" }}
          >
            <Card
              sx={{
                borderRadius: 4,
                p: 2,
                color: "white",
                background:
                  "linear-gradient(135deg, #1976d2, #42a5f5)",
                boxShadow: 5,
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 8,
                },
              }}
            >
              <CardContent>
                <Typography variant="h6">{stat.label}</Typography>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* 📦 ITEMS SECTION */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        📦 Items
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        {items.map((item) => (
          <Box
            key={item.id}
            sx={{
              width: {
                xs: "100%",
                sm: "48%",
                md: "30%",
              },
            }}
          >
            <Card
              sx={{
                borderRadius: 4,
                p: 1,
                boxShadow: 4,
                background: "#ffffff",
                transition: "0.3s",
                position: "relative",
                overflow: "hidden",

                "&:hover": {
                  transform: "scale(1.04)",
                  boxShadow: 8,
                },

                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "5px",
                  background:
                    "linear-gradient(90deg, #1976d2, #42a5f5)",
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  {item.name}
                </Typography>

                <Typography color="text.secondary">
                  📂 {item.category}
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  💰 Price: <b>₹{item.price}</b>
                </Typography>

                <Typography>
                  📦 Stock: <b>{item.stock}</b>
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Container>
  );
}