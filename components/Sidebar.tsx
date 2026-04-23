"use client";

import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Items", path: "/items" },
    { label: "Category", path: "/category" },
    { label: "Subcategory", path: "/subcategory" },
    { label: "Customer", path: "/customer" },
    { label: "POS", path: "/pos" },
    { label: "Orders", path: "/orders" },
  ];

  return (
    <Box
      sx={{
        width: 220,
        height: "100vh",
        background: "#1e293b",
        color: "white",
        position: "fixed",
        top: 64, // below navbar
        left: 0,
        display: "flex",
        flexDirection: "column",
        p: 2,
        gap: 1,
      }}
    >
      {menuItems.map((item) => (
        <Button
          key={item.path}
          onClick={() => router.push(item.path)}
          sx={{
            color: "white",
            justifyContent: "flex-start",
            "&:hover": {
              backgroundColor: "#334155",
            },
          }}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );
}