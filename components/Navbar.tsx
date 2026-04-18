"use client";

import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <AppBar position="static" sx={{ background: "#1976d2" }}>
      <Toolbar sx={{ display: "flex", alignItems: "center" }}>
        
        {/* LEFT LOGO */}
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Inventory POS
        </Typography>

        {/* CENTER MENU */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mx: "auto", // 👉 pushes this to center
          }}
        >
          <Button
            color="inherit"
            onClick={() => router.push("/dashboard")}
            sx={hoverStyle}
          >
            Dashboard
          </Button>

          <Button
            color="inherit"
            onClick={() => router.push("/items")}
            sx={hoverStyle}
          >
            📦 Items
          </Button>

          <Button
            color="inherit"
            onClick={() => router.push("/items/create")}
            sx={hoverStyle}
          >
            ➕ Add
          </Button>

          <Button
            color="inherit"
            onClick={() => router.push("/pos")}
            sx={hoverStyle}
          >
            🧾 POS
          </Button>
        </Box>

        {/* RIGHT LOGOUT */}
        <Button
          color="error"
          variant="outlined"
          onClick={logout}
          sx={{
            borderColor: "white",
            color: "white",
            "&:hover": {
              backgroundColor: "white",
              color: "#1976d2",
              borderColor: "white",
            },
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

/* 🔥 Hover Style for buttons */
const hoverStyle = {
  transition: "0.3s",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.2)",
    transform: "scale(1.05)",
  },
};