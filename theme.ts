import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light", // 🔥 IMPORTANT
    background: {
      default: "#f5f7fb",
      paper: "#ffffff",
    },
  },
});

export default theme;