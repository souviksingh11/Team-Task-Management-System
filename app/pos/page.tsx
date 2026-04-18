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
  Box,
  Paper,
} from "@mui/material";
import api from "@/lib/axios";
import Swal from "sweetalert2";

export default function POSPage() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");

  // 🔄 Fetch items
  const fetchItems = async () => {
    const res = await api.get("/api/items");
    setItems(res.data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter((item) =>
  item.name.toLowerCase().includes(search.toLowerCase())
);

  // ➕ Add item
  const addItem = (item: any) => {
    const exists = selectedItems.find((i) => i.id === item.id);

    if (exists) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.id === item.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                inputQty: String(i.quantity + 1),
              }
            : i,
        ),
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        { ...item, quantity: 1, inputQty: "1" }, // ✅ start from 1
      ]);
    }
  };

  const removeItem = async (id: number) => {
  const result = await Swal.fire({
    title: "Remove item?",
    text: "Do you want to remove this item from cart?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
  });

  if (result.isConfirmed) {
    setSelectedItems(selectedItems.filter((i) => i.id !== id));
  }
};

  const decreaseQty = (id: number) => {
    const item = selectedItems.find((i) => i.id === id);

    if (!item) return;

    if (item.quantity === 1) {
      // remove if qty becomes 0
      removeItem(id);
    } else {
      setSelectedItems(
        selectedItems.map((i) =>
          i.id === id
            ? {
                ...i,
                quantity: i.quantity - 1,
                inputQty: String(i.quantity - 1),
              }
            : i,
        ),
      );
    }
  };
  

  // 🔢 Update qty (BEST PRACTICE)
  const updateQty = (id: number, value: string) => {
    // ✅ allow empty (but mark invalid)
    if (value === "") {
      setSelectedItems(
        selectedItems.map((i) =>
          i.id === id
            ? { ...i, inputQty: "", quantity: 0 } // 👈 important
            : i,
        ),
      );
      return;
    }

    const qty = Number(value);

    if (qty <= 0) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid Quantity",
        text: "Quantity must be greater than 0",
      });
    }

    const item = selectedItems.find((i) => i.id === id);

    if (qty > item.stock) {
      return Swal.fire({
        icon: "error",
        title: "Stock Limit",
        text: `Only ${item.stock} available`,
      });
    }

    setSelectedItems(
      selectedItems.map((i) =>
        i.id === id ? { ...i, quantity: qty, inputQty: value } : i,
      ),
    );
  };

  // 💰 Total
  const total = selectedItems.reduce(
    (sum, i) => sum + i.price * (i.quantity || 0),
    0,
  );

  // 🧾 Place Order
  const handleOrder = async () => {
    // ❌ customer validation
    if (!customerName) {
      return Swal.fire("Error", "Enter customer name", "warning");
    }

    // ❌ empty cart
    if (selectedItems.length === 0) {
      return Swal.fire("Error", "Cart is empty", "warning");
    }

    // ❌ quantity validation
    for (const item of selectedItems) {
      // ❌ EMPTY
      if (item.inputQty === "") {
        return Swal.fire({
          icon: "warning",
          title: "Missing Quantity",
          text: `Enter quantity for ${item.name}`,
        });
      }

      // ❌ ZERO OR NEGATIVE
      if (item.quantity <= 0) {
        return Swal.fire({
          icon: "error",
          title: "Invalid Quantity",
          text: "Quantity must be greater than 0",
        });
      }

      // ❌ STOCK EXCEEDED
      if (item.quantity > item.stock) {
        return Swal.fire({
          icon: "error",
          title: "Stock Limit",
          text: `${item.name} has only ${item.stock} items`,
        });
      }
    }

    try {
      await api.post("/api/orders", {
        customerName,
        items: selectedItems,
      });

      await Swal.fire({
        icon: "success",
        title: "Order Placed 🎉",
        text: `Total: ₹${total}`,
      });

      setSelectedItems([]);
      setCustomerName("");
      fetchItems();
    } catch (err) {
      Swal.fire("Error ❌", "Order failed", "error");
    }
  };

  return (
  <Container
    sx={{
      mt: 5,
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e3f2fd, #fce4ec)",
      p: 3,
      borderRadius: 3,
    }}
  >
    <Typography
      variant="h4"
      sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}
    >
      🧾 POS System
    </Typography>

    {/* CUSTOMER */}
    <TextField
      label="Customer Name"
      fullWidth
      sx={{
        mb: 3,
        background: "white",
        borderRadius: 2,
      }}
      value={customerName}
      onChange={(e) => setCustomerName(e.target.value)}
    />

    <Stack direction="row" spacing={3}>
      {/* ITEMS */}
      <Box sx={{ width: "50%" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          🛍️ Items
        </Typography>
        <TextField
  fullWidth
  placeholder="🔍 Search items..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  sx={{
    mb: 2,
    background: "white",
    borderRadius: 2,

    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": {
        borderColor: "#1976d2",
      },
    },
  }}
/>

        <Stack spacing={2}>
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              sx={{
                borderRadius: 4,
                boxShadow: 4,
                transition: "0.3s",

                "&:hover": {
                  transform: "translateY(-6px) scale(1.02)",
                  boxShadow: 10,
                },
              }}
            >
              <CardContent>
                <Typography variant="h6">{item.name}</Typography>
                <Typography color="text.secondary">
                  {item.category}
                </Typography>
                <Typography>₹{item.price}</Typography>
                <Typography>Stock: {item.stock}</Typography>

                <Button
                  variant="contained"
                  onClick={() => addItem(item)}
                  sx={{
                    mt: 2,
                    background:
                      "linear-gradient(90deg, #1976d2, #42a5f5)",
                    transition: "0.3s",

                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: 6,
                    },
                  }}
                >
                  ➕ Add
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>

      {/* CART */}
      <Box sx={{ width: "50%" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          🛒 Cart
        </Typography>

        <Stack spacing={2}>
          {selectedItems.map((item) => (
            <Card
              key={item.id}
              sx={{
                borderRadius: 4,
                boxShadow: 4,
                transition: "0.3s",

                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: 10,
                },
              }}
            >
              <CardContent>
                <Typography variant="h6">{item.name}</Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 2, alignItems: "center" }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => decreaseQty(item.id)}
                    sx={btnHover}
                  >
                    -
                  </Button>

                  <TextField
                    type="number"
                    value={item.inputQty}
                    onChange={(e) =>
                      updateQty(item.id, e.target.value)
                    }
                    error={item.inputQty === ""}
                    helperText={item.inputQty === "" ? "Required" : ""}
                    sx={{ width: 80 }}
                  />

                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() => addItem(item)}
                    sx={btnHover}
                  >
                    +
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => removeItem(item.id)}
                    sx={btnHover}
                  >
                    Remove
                  </Button>
                </Stack>

                <Typography sx={{ mt: 2, fontWeight: "bold" }}>
                  ₹{item.price * (item.quantity || 0)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* TOTAL */}
        <Paper
          sx={{
            p: 3,
            mt: 3,
            borderRadius: 4,
            boxShadow: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h6">
            Total: ₹{total}
          </Typography>

          <Button
            variant="contained"
            fullWidth
            onClick={handleOrder}
            sx={{
              mt: 2,
              py: 1.3,
              fontWeight: "bold",
              background:
                "linear-gradient(90deg, #43a047, #66bb6a)",
              transition: "0.3s",

              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: 8,
              },
            }}
          >
            🚀 Place Order
          </Button>
        </Paper>
      </Box>
    </Stack>
  </Container>
);


}
/* 🔥 BUTTON HOVER STYLE */
const btnHover = {
  transition: "0.3s",
  "&:hover": {
    transform: "scale(1.1)",
    boxShadow: 4,
  },
};
