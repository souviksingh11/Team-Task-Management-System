"use client";

import { useForm } from "react-hook-form";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
});

export default function Register() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      await axios.post("/api/auth/register", data);

      // ✅ Sweet Success Alert
      await Swal.fire({
        icon: "success",
        title: "Registration Successful 🎉",
        text: "You can now login",
        confirmButtonColor: "#1976d2",
      });

      router.push("/login");
    } catch (err: any) {
      // ❌ Error Alert
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err.response?.data?.error || "Something went wrong",
      });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: 4,
            width: "100%",
            borderRadius: 3,
          }}
        >
          <Typography variant="h4" align="center" sx={{ mb: 3 }}>
            Create Account
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Full Name"
              margin="normal"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message as string}
            />

            <TextField
              fullWidth
              label="Email Address"
              margin="normal"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message as string}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message as string}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                py: 1.2,
                fontWeight: "bold",
              }}
            >
              Register
            </Button>
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Already have an account?{" "}
              <span
                style={{
                  color: "#1976d2",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => router.push("/login")}
              >
                Login
              </span>
            </Typography>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
