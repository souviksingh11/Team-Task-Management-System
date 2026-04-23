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
  Autocomplete,
} from "@mui/material";
import api from "@/lib/axios";
import Swal from "sweetalert2";

export default function POSPage() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [multiItems, setMultiItems] = useState<any[]>([]);

  // 🔄 Fetch
  const fetchItems = async () => {
    const res = await api.get("/api/items");
    setItems(res.data);
  };

  const fetchCustomers = async () => {
    const res = await api.get("/api/customers");
    setCustomers(res.data);
  };

  useEffect(() => {
    fetchItems();
    fetchCustomers();
  }, []);

  // 🔍 Filter
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ➕ Add item
  const addItem = (item: any) => {
  const exists = selectedItems.find((i) => i.id === item.id);

  if (exists) {
    if (exists.quantity >= item.stock) {
      return Swal.fire(
        "Stock limit",
        `Only ${item.stock} available`,
        "error"
      );
    }

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
    if (item.stock <= 0) {
      return Swal.fire("Out of stock", "", "error");
    }

    setSelectedItems([
      ...selectedItems,
      { ...item, quantity: 1, inputQty: "1" },
    ]);
  }
};

  // ❌ Remove item
  const removeItem = async (id: number) => {
    const result = await Swal.fire({
      title: "Remove item?",
      icon: "warning",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      setSelectedItems(selectedItems.filter((i) => i.id !== id));
    }
  };

  // ➖ Decrease
  const decreaseQty = (id: number) => {
    const item = selectedItems.find((i) => i.id === id);
    if (!item) return;

    if (item.quantity === 1) return removeItem(id);

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
  };

  // 🔢 Update qty
  const updateQty = (id: number, value: string) => {
    if (value === "") {
      setSelectedItems(
        selectedItems.map((i) =>
          i.id === id ? { ...i, inputQty: "", quantity: 0 } : i,
        ),
      );
      return;
    }

    const qty = Number(value);
    const item = selectedItems.find((i) => i.id === id);

    if (qty <= 0) {
      return Swal.fire("Invalid", "Quantity must be > 0", "warning");
    }

    if (qty > item.stock) {
      return Swal.fire("Stock limit", `Only ${item.stock}`, "error");
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

  // 🧾 Order
  const handleOrder = async () => {
  if (!selectedCustomer) {
    return Swal.fire("Error", "Select customer", "warning");
  }

  if (selectedItems.length === 0) {
    return Swal.fire("Error", "Cart empty", "warning");
  }

  // 🔥 STOCK VALIDATION
  const invalidItem = selectedItems.find(
    (i) => i.quantity > i.stock
  );

  if (invalidItem) {
    return Swal.fire(
      "Stock error",
      `${invalidItem.name} exceeds stock`,
      "error"
    );
  }

  try {
    await api.post("/api/orders", {
      customerName: selectedCustomer.name,
      items: selectedItems,
    });

    Swal.fire("Success 🎉", `Total ₹${total}`, "success");

    setSelectedItems([]);
    setSelectedCustomer(null);
    setMultiItems([]);
    fetchItems();
  } catch {
    Swal.fire("Error", "Order failed", "error");
  }
};

  return (
    <Container sx={{ mt: 1 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        POS System
      </Typography>

      {/* 👤 CUSTOMER DROPDOWN */}
      <Stack spacing={3} sx={{ mb: 2 }}>
        <Autocomplete
          options={customers}
          getOptionLabel={(opt) => opt?.name || ""}
          value={selectedCustomer}
          onChange={(e, val) => setSelectedCustomer(val)}
          isOptionEqualToValue={(o, v) => o.id === v?.id}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              {option.name}
            </li>
          )}
          renderInput={(params) => (
            <TextField {...params} label="Select Customer" />
          )}
        />
      </Stack>

      {/* 🧠 MULTI ITEM SELECT */}
      <Stack spacing={3} sx={{ mb: 2 }}>
        <Autocomplete
          multiple
          options={items}
          getOptionLabel={(opt) => opt?.name || ""}
          value={multiItems}
          onChange={(e, val) => {
            setMultiItems(val);
            val.forEach((item) => addItem(item));
          }}
          isOptionEqualToValue={(o, v) => o.id === v?.id}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              {option.name}
            </li>
          )}
          renderInput={(params) => (
            <TextField {...params} label="Select Items" />
          )}
        />
      </Stack>

      <Stack direction="row" spacing={3}>
        {/* 🛍️ ITEMS */}
        <Box sx={{ width: "50%" }}>
          <TextField
            fullWidth
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Stack spacing={2}>
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                sx={{
                  borderRadius: 3,
                  boxShadow: 2,
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 5,
                  },
                }}
              >
                <CardContent>
                  <Typography sx={{ fontWeight: "bold" }}>
                    {item.name}
                  </Typography>
                  <Typography color="primary">₹{item.price}</Typography>
                  <Typography variant="body2">Stock: {item.stock}</Typography>

                  <Button
                    sx={{ mt: 1 }}
                    variant="contained"
                    onClick={() => addItem(item)}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>

        {/* 🛒 CART */}
        <Box sx={{ width: "50%" }}>
          <Stack spacing={2}>
            {selectedItems.map((item) => (
              <Card
               key={item.id}
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  border: "1px solid #eee",
                }}
              >
                <CardContent>
                  <Typography sx={{ fontWeight: "bold" }}>
                    {item.name}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center", mt: 1 }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => decreaseQty(item.id)}
                    >
                      -
                    </Button>

                    <TextField
                      type="number"
                      value={item.inputQty}
                      onChange={(e) => updateQty(item.id, e.target.value)}
                      sx={{
                        width: 120,
                        "& input": { textAlign: "center", fontWeight: "bold" },
                      }}
                    />

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => addItem(item)}
                    >
                      +
                    </Button>

                    {/* 🔥 PUSH BUTTON TO RIGHT */}
                    <Box sx={{ flexGrow: 1 }} />

                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => removeItem(item.id)}
                      sx={{
                        backgroundColor: "#e53935",
                        color: "#fff",
                        borderRadius: 1,
                        px: 1,
                        fontWeight: "bold",
                        "&:hover": {
                          backgroundColor: "#c62828",
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      Remove
                    </Button>
                  </Stack>

                  <Typography
                    sx={{ mt: 1, fontWeight: "bold", color: "#2E7D32" }}
                  >
                    ₹{item.price * (item.quantity || 0)}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Paper
            sx={{
              p: 3,
              mt: 3,
              borderRadius: 3,
              boxShadow: 4,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Total: ₹{total}
            </Typography>

            <Button
  fullWidth
  variant="contained"
  sx={{
    mt: 2,
    py: 1.5,
    fontWeight: "bold",
    backgroundColor: "#1976d2",
    color: "#fff", // 🔥 IMPORTANT
    borderRadius: 2,
    "&:hover": {
      backgroundColor: "#115293",
    },
  }}
  onClick={handleOrder}
>
  PLACE ORDER
</Button>
          </Paper>
        </Box>
      </Stack>
    </Container>
  );
}
