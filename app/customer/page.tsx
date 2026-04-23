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
//   flexRender,
  ColumnDef,
} from "@tanstack/react-table";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DataTable from "@/components/DataTable";
// import { ColumnDef } from "@tanstack/react-table";
// import { ColumnDef } from "@tanstack/react-table";

// ✅ Validation
const schema = yup.object({
  name: yup.string().required("Name is required"),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Enter valid phone number"),
  aadharNo: yup
    .string()
    .matches(/^[0-9]{12}$/, "Enter valid Aadhar number"),
  email: yup.string().email("Invalid email").required("Email is required"),
});

type Customer = {
  id: number;
  name: string;
  phone: string;
  aadharNo: string;
  email: string;
};

export default function CustomerPage() {
  // const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
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
      phone: "",
      aadharNo: "",
      email: "",
    },
  });

  // 🔄 Fetch
  const fetchData = async () => {
  const res = await axios.get(
    `/api/customers?page=${page}&limit=${limit}&search=${search}`
  );

  setCustomers(res.data.data);
  setTotalPages(res.data.totalPages);
};

  useEffect(() => {
  fetchData();
}, [page, search]);

  // ✅ Submit
  const onSubmit = async (data: any) => {
    try {
      if (editId) {
        await axios.put(`/api/customers/${editId}`, data);
        Swal.fire("Updated!", "", "success");
      } else {
        await axios.post("/api/customers", data);
        Swal.fire("Added!", "", "success");
      }

      reset({ name: "", phone: "", aadharNo: "", email: "" });
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
      title: "Delete Customer?",
      icon: "warning",
      showCancelButton: true,
    });

    if (confirm.isConfirmed) {
      await axios.delete(`/api/customers/${id}`);
      fetchData();
    }
  };

  // ✏️ Edit
  const handleEdit = (c: Customer) => {
    setEditId(c.id);

    reset({
      name: c.name,
      phone: c.phone,
      aadharNo: c.aadharNo,
      email: c.email,
    });

    setOpen(true);
  };

  // 🔍 Filter
  const filtered = customers;

  // ✅ Columns
  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "aadharNo", header: "Aadhar" },
      { accessorKey: "email", header: "Email" },
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
    []
  );

//   const table = useReactTable({
//     data: filtered,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//   });

  return (
    <Container maxWidth="lg">
      {/* HEADER */}
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Customer Dashboard
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Stack spacing={2}>
            {/* SEARCH + BUTTON */}
            <Stack direction="row" sx={{ alignItems: "center" }}>
              <TextField
                label="Search Customer"
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
                onClick={() => {
                  setEditId(null);
                  reset({
                    name: "",
                    phone: "",
                    aadharNo: "",
                    email: "",
                  });
                  setOpen(true);
                }}
              >
                + ADD
              </Button>
            </Stack>

            <Divider />

            {/* TABLE */}
            {/* TABLE */}
<DataTable data={filtered} columns={columns} />

{/* ✅ PAGINATION HERE */}
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
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editId ? "Edit Customer" : "Add Customer"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              )}
            />

            <Controller
              name="aadharNo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Aadhar"
                  error={!!errors.aadharNo}
                  helperText={errors.aadharNo?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
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