"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  CardActions,
  Box,
} from "@mui/material";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    category: "",
    price: "",
  });

  const router = useRouter();

  // 🔄 Fetch items
  const fetchItems = async () => {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== ""),
      );

      const query = new URLSearchParams(cleanFilters as any).toString();

      const res = await api.get(`/api/items?${query}`);
      setItems(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchItems, 300);
    return () => clearTimeout(delay);
  }, [filters]);

  // ➕➖ Update stock
  const updateStock = async (id: number, type: "increase" | "decrease") => {
    try {
      await api.patch("/api/items/stock", {
        id,
        type,
        quantity: 1,
      });

      fetchItems();
    } catch (err) {
      console.log(err);
    }
  };

  // ❌ DELETE ITEM
  const deleteItem = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This item will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/api/items/${id}`);

      Swal.fire("Deleted!", "Item removed successfully", "success");

      fetchItems();
    } catch {
      Swal.fire("Error", "Failed to delete item", "error");
    }
  };

  const buttonHover = {
    transition: "0.3s",
    "&:hover": {
      transform: "scale(1.08)",
      boxShadow: 4,
    },
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        📦 Items
      </Typography>

      {/* FILTER */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <TextField
          label="Category"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />

        <TextField
          label="Max Price"
          type="number"
          value={filters.price}
          onChange={(e) => setFilters({ ...filters, price: e.target.value })}
        />

        <Button variant="contained" onClick={fetchItems} sx={buttonHover}>
          Filter
        </Button>

        <Button
          variant="outlined"
          onClick={() => router.push("/items/create")}
          sx={buttonHover}
        >
          ➕ Add Item
        </Button>
      </Stack>

      {/* ITEMS GRID (professional look) */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        {items.map((item) => (
          <Card
            key={item.id}
            sx={{
              width: 300,
              borderRadius: 3,
              boxShadow: 4,
              transition: "0.3s",

              "&:hover": {
                transform: "translateY(-5px) scale(1.03)",
                boxShadow: 8,
              },
            }}
          >
            <CardContent>
              <Typography variant="h6">{item.name}</Typography>

              <Typography color="text.secondary">
                Category: {item.category}
              </Typography>

              <Typography>Price: ₹{item.price}</Typography>
              <Typography>Stock: {item.stock}</Typography>
            </CardContent>

            <CardActions sx={{ justifyContent: "space-between" }}>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  color="success"
                  onClick={() => updateStock(item.id, "increase")}
                  sx={buttonHover}
                >
                  +
                </Button>

                <Button
                  size="small"
                  color="error"
                  onClick={() => updateStock(item.id, "decrease")}
                  sx={buttonHover}
                >
                  -
                </Button>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  onClick={() => router.push(`/items/edit/${item.id}`)}
                  sx={buttonHover}
                >
                  ✏️ Edit
                </Button>

                <Button
                  size="small"
                  color="error"
                  onClick={() => deleteItem(item.id)}
                  sx={buttonHover}
                >
                  Delete
                </Button>
              </Stack>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Container>
  );
}
