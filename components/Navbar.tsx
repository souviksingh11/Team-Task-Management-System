"use client";

import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Navbar() {
  const router = useRouter();

  const logout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Logout",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("token");
      document.cookie = "token=; Max-Age=0; path=/";

      await Swal.fire({
        icon: "success",
        title: "Logged out!",
        timer: 1000,
        showConfirmButton: false,
      });

      router.replace("/login");
    }
  };

  return (
    <AppBar position="fixed" sx={{ background: "#1976d2" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
          Inventory POS
        </Typography>

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
            },
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}