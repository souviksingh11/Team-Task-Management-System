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
  Grid,
  Box,
  IconButton,
  Divider,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { ColumnDef } from "@tanstack/react-table";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CategoryIcon from "@mui/icons-material/Category";
// import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
// import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DataTable from "@/components/DataTable";

// ✅ Validation
const schema = yup.object({
  name: yup.string().required("Subcategory name required"),
  description: yup.string().required("Description required"),
  categoryId: yup.string().required("Select category"),
});

export default function SubcategoryPage() {
  // const [subcategories, setSubcategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [subcategories, setSubcategories] = useState<any[]>([]);
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
      categoryId: "",
    },
  });

  // 🔄 Fetch
  const fetchData = async () => {
    const subRes = await axios.get(
      `/api/subcategories?page=${page}&limit=${limit}&search=${search}`,
    );

    const catRes = await axios.get("/api/categories");

    setSubcategories(subRes.data.data);
    setTotalPages(subRes.data.totalPages);
    setCategories(catRes.data.data);
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  // ✅ Submit
  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      categoryId: Number(data.categoryId),
    };

    try {
      if (editId) {
        await axios.put(`/api/subcategories/${editId}`, payload);
        Swal.fire("Updated!", "", "success");
      } else {
        await axios.post("/api/subcategories", payload);
        Swal.fire("Added!", "", "success");
      }

      reset({ name: "", description: "", categoryId: "" });
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
      title: "Delete Subcategory?",
      icon: "warning",
      showCancelButton: true,
    });

    if (confirm.isConfirmed) {
      await axios.delete(`/api/subcategories/${id}`);
      fetchData();
    }
  };

  // ✏️ Edit
  const handleEdit = (sub: any) => {
    setEditId(sub.id);

    reset({
      name: sub.name,
      description: sub.description,
      categoryId: String(sub.categoryId),
    });

    setOpen(true);
  };

  // 🔍 Filter
  const filtered = subcategories;

  // ✅ Table columns
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "description", header: "Description" },
      {
        header: "Category",
        cell: ({ row }) => row.original.category?.name || "-",
      },
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
      <Stack direction="row" spacing={1} sx={{ mb: 3, alignItems: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Subcategory Dashboard
        </Typography>
      </Stack>

      <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Stack spacing={2}>
            {/* SEARCH + ADD BUTTON */}
            <Stack direction="row" sx={{ alignItems: "center", width: "100%" }}>
              {/* Search */}
              <TextField
                label="Search Subcategory"
                size="small"
                sx={{ width: "300px" }}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // 🔥 reset page on search
                }}
              />

              {/* Spacer pushes button to right */}
              <Box sx={{ flexGrow: 1 }} />

              {/* Button */}
              <Button
                variant="contained"
                sx={{ px: 3, py: 1 }}
                onClick={() => {
                  setEditId(null);
                  reset({
                    name: "",
                    description: "",
                    categoryId: "",
                  });
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

      {/* POPUP FORM */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editId ? "Edit Subcategory" : "Add Subcategory"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Category"
                  fullWidth
                  error={!!errors.categoryId}
                  helperText={errors.categoryId?.message}
                >
                  <MenuItem value="">Select Category</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
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
