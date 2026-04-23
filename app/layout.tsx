"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { Box } from "@mui/material";

export default function RootLayout({ children }: any) {
  const pathname = usePathname();

  // 🔥 hide layout on auth pages
  const hideLayout =
    pathname === "/login" || pathname === "/register";

  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          {!hideLayout && <Navbar />}
          {!hideLayout && <Sidebar />}

          {/* ✅ Main Content Area */}
          <Box
            sx={{
              mt: hideLayout ? 0 : "64px",     // navbar height
              ml: hideLayout ? 0 : "220px",    // sidebar width
              p: 3,
            }}
          >
            {children}
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}