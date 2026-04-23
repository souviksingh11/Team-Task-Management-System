"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
import api from "@/lib/axios";
import DataTable from "@/components/DataTable";
import { useForm, Controller } from "react-hook-form";

export default function Dashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const fetchItems = async () => {
    try {
      const res = await api.get("/api/items");
      setItems(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const { control, watch } = useForm({
    defaultValues: {
      search: "",
    },
  });

  const searchValue = watch("search");
  useEffect(() => {
    fetchItems();
  }, []);

  // 📊 Stats
  const totalItems = items.length;
  const totalStock = items.reduce((acc, i) => acc + i.stock, 0);
  const totalValue = items.reduce((acc, i) => acc + i.price * i.stock, 0);

  // 🔍 SEARCH FILTER
  const filteredData = useMemo(() => {
    return items.filter((i) =>
      i.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [items, searchValue]);

  // 🧠 TABLE COLUMNS
  const columns = [
    {
      accessorKey: "name",
      header: "Item Name",
    },
    {
      accessorKey: "category.name",
      header: "Category",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }: any) => (
        <span style={{ fontWeight: "bold" }}>₹{row.original.price}</span>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }: any) => (
        <span
          style={{
            fontWeight: "bold",
            color: row.original.stock <= 5 ? "red" : "green",
          }}
        >
          {row.original.stock}
        </span>
      ),
    },
    {
      header: "Value",
      cell: ({ row }: any) => (
        <span style={{ fontWeight: "bold", color: "#1976d2" }}>
          ₹{row.original.price * row.original.stock}
        </span>
      ),
    },
  ];

  return (
    <Container sx={{ mt: 1 }}>
      {/* 🔥 TITLE */}
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Dashboard
      </Typography>

      {/* 📊 STATS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 3,
          mb: 4,
        }}
      >
        {[
          { label: "Total Items", value: totalItems },
          { label: "Total Stock", value: totalStock },
          { label: "Inventory Value", value: `₹${totalValue}` },
        ].map((stat, index) => (
          <Card
            key={index}
            sx={{
              boxShadow: 3,
              transition: "all 0.3s ease",
              borderRadius: 3,
              p: 2,
              background: "#1976d2",
              color: "#fff",
              "&:hover": {
                transform: "translateY(-6px) scale(1.02)",
                boxShadow: 8,
                borderColor: "#1976d2",
              },
            }}
          >
            <CardContent>
              <Typography>{stat.label}</Typography>
              <Typography variant="h5" sx={{ fontWeight: "bold", mt: 1 }}>
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* 🔍 SEARCH */}
      <Controller
        name="search"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Search Items" // 🔥 THIS FIXES IT
            size="small"
            sx={{
              width: "370px",
              mb: 3,
              background: "#fff",
              borderRadius: 2,
            }}
          />
        )}
      />

      {/* 📊 TABLE */}
      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <DataTable data={filteredData} columns={columns} />
      </Box>

      {/* EMPTY STATE */}
      {items.length === 0 && (
        <Typography
          variant="h6"
          sx={{ mt: 4, textAlign: "center", color: "gray" }}
        >
          No items found
        </Typography>
      )}
    </Container>
  );
}
