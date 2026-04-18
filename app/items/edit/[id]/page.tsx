"use client";

import { useEffect } from "react";
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
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";

/* ✅ TYPE */
type FormFields = {
  name: string;
  category: string;
  subcategory: string;
  price: number;
  stock: number;
};

/* ✅ VALIDATION */
const schema = yup.object({
  name: yup.string().required("Name is required"),
  category: yup.string().required("Category is required"),
  subcategory: yup.string().required("Subcategory is required"),
  price: yup
    .number()
    .typeError("Price must be number")
    .required("Price required"),
  stock: yup
    .number()
    .typeError("Stock must be number")
    .required("Stock required"),
});

export default function EditItem() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const {
    register,
    handleSubmit,
    reset, // ✅ IMPORTANT
    formState: { errors },
  } = useForm<FormFields>({
    resolver: yupResolver(schema),
  });

  /* 🔥 FETCH ITEM (FIXED) */
  useEffect(() => {
    if (!id) return;

    const fetchItem = async () => {
      try {
        const res = await api.get(`/api/items/${id}`);

        console.log("API Response:", res.data);

        // ✅ Handle both cases (important)
        const item = res.data.data || res.data;

        // ✅ Fill form properly
        reset({
          name: item.name || "",
          category: item.category || "",
          subcategory: item.subcategory || "",
          price: item.price || 0,
          stock: item.stock || 0,
        });
      } catch (err) {
        console.log(err);
        Swal.fire("Error", "Failed to load item", "error");
      }
    };

    fetchItem();
  }, [id, reset]);

  /* ✏️ UPDATE */
  const onSubmit = async (data: FormFields) => {
    try {
      await api.put(`/api/items/${id}`, data);

      await Swal.fire({
        icon: "success",
        title: "Updated Successfully 🎉",
        confirmButtonColor: "#1976d2",
      });

      router.push("/items");
    } catch (err) {
      Swal.fire("Error", "Update failed", "error");
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
        // background: "linear-gradient(135deg, #e3f2fd, #fce4ec)",
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 4,
            backdropFilter: "blur(10px)",
            background: "rgba(255,255,255,0.9)",
            transition: "0.3s",

            "&:hover": {
              boxShadow: 12,
              transform: "scale(1.01)",
            },
          }}
        >
          {/* 🔥 TITLE */}
          <Typography
            variant="h4"
            align="center"
            sx={{ mb: 3, fontWeight: "bold" }}
          >
            ✏️ Edit Item
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            {(
              [
                "name",
                "category",
                "subcategory",
                "price",
                "stock",
              ] as (keyof FormFields)[]
            ).map((field) => (
              <TextField
                key={field}
                fullWidth
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                defaultValue=""
                type={
                  field === "price" || field === "stock" ? "number" : "text"
                }
                margin="normal"
                {...register(field)}
                error={!!errors[field]}
                helperText={errors[field]?.message}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    transition: "0.3s",
                    "&:hover fieldset": {
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
                background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                transition: "0.3s",

                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: 8,
                },
              }}
            >
              Update Item 🚀
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
