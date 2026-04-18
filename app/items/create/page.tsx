"use client";

import { useForm } from "react-hook-form";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

/* ✅ TYPE FIRST (IMPORTANT) */
type FormFields = {
  name: string;
  category: string;
  subcategory: string;
  price: number;
  stock: number;
};

/* ✅ VALIDATION */
const schema = yup.object({
  name: yup.string().required("Item name is required"),
  category: yup.string().required("Category is required"),
  subcategory: yup.string().required("Subcategory is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .positive("Price must be positive")
    .required("Price is required"),
  stock: yup
    .number()
    .typeError("Stock must be a number")
    .min(0, "Stock cannot be negative")
    .required("Stock is required"),
});

export default function CreateItem() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: yupResolver(schema),
  });

  /* ✅ FIELD CONFIG (TYPE SAFE) */
  const fields: {
    name: keyof FormFields;
    label: string;
    type?: string;
  }[] = [
    { name: "name", label: "Item Name" },
    { name: "category", label: "Category" },
    { name: "subcategory", label: "Subcategory" },
    { name: "price", label: "Price", type: "number" },
    { name: "stock", label: "Stock", type: "number" },
  ];

  /* ✅ SUBMIT */
  const onSubmit = async (data: FormFields) => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/api/items",
        {
          ...data,
          price: Number(data.price),
          stock: Number(data.stock),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await Swal.fire({
        icon: "success",
        title: "Item Created 🎉",
        confirmButtonColor: "#1976d2",
      });

      router.push("/items");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error ❌",
        text: err.response?.data?.error || "Something went wrong",
      });
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // background:
        //   "linear-gradient(135deg, #e3f2fd, #fce4ec)",
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 4,
            backdropFilter: "blur(12px)",
            background: "rgba(255,255,255,0.9)",
            transition: "0.3s",

            "&:hover": {
              transform: "scale(1.01)",
              boxShadow: 15,
            },
          }}
        >
          {/* 🔥 TITLE */}
          <Typography
            variant="h4"
            align="center"
            sx={{
              mb: 3,
              fontWeight: "bold",
              letterSpacing: 1,
            }}
          >
            ➕ Create Item
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            {fields.map((field) => (
              <TextField
                key={field.name}
                fullWidth
                label={field.label}
                type={field.type || "text"}
                margin="normal"
                {...register(field.name)}
                error={!!errors[field.name]}
                helperText={errors[field.name]?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    transition: "0.3s",

                    "&:hover fieldset": {
                      borderColor: "#1976d2",
                    },

                    "&.Mui-focused fieldset": {
                      borderWidth: "2px",
                      borderColor: "#1976d2",
                    },
                  },
                }}
              />
            ))}

            {/* 🔥 BUTTON */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                py: 1.3,
                fontWeight: "bold",
                fontSize: "16px",
                background:
                  "linear-gradient(90deg, #1976d2, #42a5f5)",
                transition: "0.3s",

                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: 8,
                },
              }}
            >
              Create Item 🚀
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}