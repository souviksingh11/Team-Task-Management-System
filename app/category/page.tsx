"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Stack,
  IconButton,
  Divider,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import {
  //   useReactTable,
  //   getCoreRowModel,
  //   getSortedRowModel,
  ColumnDef,
} from "@tanstack/react-table";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CategoryIcon from "@mui/icons-material/Category";
import DataTable from "@/components/DataTable";
// import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
// import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// ✅ Validation
const schema = yup.object({
  name: yup.string().required("Category name is required"),
  description: yup.string().required("Description is required"),
});

export default function CategoryPage() {
  // const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 5;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // 🔄 Fetch
  const fetchData = async () => {
    const res = await axios.get(
      `/api/categories?page=${page}&limit=${limit}&search=${search}`,
    );

    setCategories(res.data.data);
    setTotalPages(res.data.totalPages);
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);
  // ✅ Submit
  const onSubmit = async (data: any) => {
    try {
      if (editId) {
        await axios.put(`/api/categories/${editId}`, data);
        Swal.fire("Updated!", "", "success");
      } else {
        await axios.post("/api/categories", data);
        Swal.fire("Added!", "", "success");
      }

      reset({ name: "", description: "" });
      setEditId(null);
      setOpen(false);
      fetchData();
    } catch (err: any) {
      Swal.fire("Error!", err.response?.data?.message, "error");
    }
  };

  // ❌ Delete
  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Delete Category?",
      icon: "warning",
      showCancelButton: true,
    });

    if (confirm.isConfirmed) {
      await axios.delete(`/api/categories/${id}`);
      fetchData();
    }
  };

  // ✏️ Edit
  const handleEdit = (cat: any) => {
    setEditId(cat.id);
    reset({
      name: cat.name,
      description: cat.description,
    });
    setOpen(true);
  };

  // 🔍 Filter
  const filtered = categories;

  // ✅ Columns
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "description", header: "Description" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <>
            <IconButton onClick={() => handleEdit(row.original)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDelete(row.original.id)}>
              <DeleteIcon />
            </IconButton>
          </>
        ),
      },
    ],
    [],
  );

  // const table = useReactTable({
  //   data: filtered,
  //   columns,
  //   getCoreRowModel: getCoreRowModel(),
  //   getSortedRowModel: getSortedRowModel(),
  // });

  return (
    <Container maxWidth="lg">
      {/* HEADER */}
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Category Dashboard
        </Typography>
      </Stack>

      <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Stack spacing={2}>
            {/* SEARCH + BUTTON */}
            <Stack direction="row" sx={{ width: "100%", alignItems: "center" }}>
              <TextField
                label="Search Category"
                size="small"
                sx={{ width: "300px" }}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // 🔥 important
                }}
              />

              <Box sx={{ flexGrow: 1 }} />

              <Button
                variant="contained"
                sx={{ px: 3, py: 1 }}
                onClick={() => {
                  setEditId(null);
                  reset({ name: "", description: "" });
                  setOpen(true);
                }}
              >
                + ADD
              </Button>
            </Stack>

            <Divider />

            {/* TABLE */}
            <DataTable data={filtered} columns={columns} />

            {/* ✅ PAGINATION */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mt: 2,
              }}
            >
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* POPUP */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editId ? "Edit Category" : "Add Category"}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)}>
            {editId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
