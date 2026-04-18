"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: any) {
  const pathname = usePathname();

  // 🔥 hide navbar on auth pages
  const hideNavbar =
    pathname === "/login" || pathname === "/register";

  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          {!hideNavbar && <Navbar />} {/* ✅ FIX */}

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}