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
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Drawer,
  Autocomplete,
} from "@mui/material";
import * as yup from "yup";
import DataTable from "@/components/DataTable";
import { useForm, Controller } from "react-hook-form";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { yupResolver } from "@hookform/resolvers/yup";

export interface IItemPayload {
  id?: number;
  name: string;
  categoryId: number;
  subCategoryId: number;
  price: number;
  stock: number;
}

export default function ItemsPage() {
  const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

const limit = 5;
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<any>({
    category: null,
    subcategory: null,
    price: "",
  });
  const schema = yup.object({
    name: yup.string().required("Name is required"),

    categoryId: yup.number().required("Category required"),

    subcategoryId: yup.number().required("Subcategory required"),

    price: yup
      .number()
      .typeError("Price must be a number")
      .min(0, "Price cannot be negative") // ✅ FIX
      .required("Price required"),

    stock: yup
      .number()
      .typeError("Stock must be a number")
      .min(0, "Stock cannot be negative") // ✅ FIX
      .required("Stock required"),
  });

  const getFormValues = (item?: any) => {
    if (item) {
      return {
        name: item.name,
        price: item.price,
        stock: item.stock,
        categoryId: item.categoryId,
        subcategoryId: item.subcategoryId,
      };
    }

    return {
      name: "",
      categoryId: null,
      subcategoryId: null,
    };
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    defaultValues: getFormValues(),
  });

  const handleEdit = (item: any) => {
    setEditId(item.id);
    reset(getFormValues(item));
    setOpen(true);
  };

  // ✅ FETCH ITEMS
  const fetchItems = async () => {
  const params = new URLSearchParams();

  params.append("page", String(page));
  params.append("limit", String(limit));

  if (search) params.append("search", search);
  if (filters.category?.id) params.append("categoryId", filters.category.id);
  if (filters.subcategory?.id)
    params.append("subcategoryId", filters.subcategory.id);
  if (filters.price) params.append("price", filters.price);

  const res = await axios.get(`/api/items?${params.toString()}`);

  setItems(res.data.data);          // ✅ FIX
  setTotalPages(res.data.totalPages);
};

  // ✅ FETCH CATEGORIES
  const fetchCategories = async () => {
    const res = await axios.get("/api/categories");
    setCategories(res.data.data);
  };

  useEffect(() => {
  fetchItems();
  fetchCategories();
}, [page, search, filters]);

  // ✅ SUBMIT
  const onSubmit = async (data: any) => {
    try {
      if (editId) {
        await axios.put(`/api/items/${editId}`, data);
        Swal.fire("Updated!", "", "success");
      } else {
        await axios.post("/api/items", data);
        Swal.fire("Added!", "", "success");
      }

      reset({
        name: "",
        categoryId: null,
        subcategoryId: null,
      });
      setEditId(null);
      setOpen(false);
      fetchItems();
    } catch (err: any) {
      Swal.fire("Error", err.response?.data?.error, "error");
    }
  };

  // ❌ DELETE
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This item will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await axios.delete(`/api/items/${id}`);
      Swal.fire("Deleted!", "", "success");
      fetchItems();
    }
  };

  // 🔍 SEARCH
  const filtered = items;

  // 📊 TABLE
  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "category.name", header: "Category" },
    { accessorKey: "subcategory.name", header: "Subcategory" },
    { accessorKey: "price", header: "Price" },
    { accessorKey: "stock", header: "Stock" },
    {
      header: "Actions",
      cell: ({ row }: any) => (
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
  ];

 const selectedCategory = Array.isArray(categories)
  ? categories.find((c) => c.id === watch("categoryId"))
  : null;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        Items
      </Typography>

      <Card>
  <CardContent>
    <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: "center" }}>
      
      <TextField
        label="Search"
        value={search}
        onChange={(e) => {
  setSearch(e.target.value);
  setPage(1); // 🔥 important
}}
        size="small"
        sx={{ width: "350px" }}
      />

      <Box sx={{ flexGrow: 1 }} />

      <Button
        variant="outlined"
        size="medium"
        onClick={() => {
  setPage(1);
  setFilterOpen(true);
}}
      >
        Filter
      </Button>

      <Button
        variant="contained"
        size="medium"
        onClick={() => {
          setEditId(null);
          reset(getFormValues());
          setOpen(true);
        }}
      >
        + Add
      </Button>

    </Stack>

    <Divider sx={{ my: 2 }} />

    <DataTable data={filtered} columns={columns} />
    <Box
  sx={{
    display: "flex",
    justifyContent: "center",
    gap: 2,
    mt: 2,
  }}
>
  <button disabled={page === 1} onClick={() => setPage(page - 1)}>
    Prev
  </button>

  <span>
    Page {page} of {totalPages}
  </span>

  <button
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
  >
    Next
  </button>
</Box>
  </CardContent>
</Card>

      {/* ADD / EDIT */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit" : "Add"} Item</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name"
                  error={!!errors.name}
                  helperText={errors.name?.message as string}
                />
              )}
            />

            {/* CATEGORY */}
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={categories}
                  getOptionLabel={(opt) => opt.name}
                  value={categories.find((c) => c.id === field.value) || null}
                  onChange={(e, val) => {
                    field.onChange(val?.id);
                    setValue("subcategoryId", "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Category"
                      error={!!errors.categoryId}
                      helperText={errors.categoryId?.message as string}
                    />
                  )}
                />
              )}
            />

            {/* SUBCATEGORY */}
            <Controller
              name="subcategoryId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={selectedCategory?.subcategories || []}
                  getOptionLabel={(opt) => opt.name}
                  value={
                    selectedCategory?.subcategories.find(
                      (s: any) => s.id === field.value,
                    ) || null
                  }
                  onChange={(e, val) => field.onChange(val?.id)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Subcategory"
                      error={!!errors.subcategoryId}
                      helperText={errors.subcategoryId?.message as string}
                    />
                  )}
                />
              )}
            />

            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Price"
                  type="number"
                  error={!!errors.price}
                  helperText={errors.price?.message as string}
                />
              )}
            />

            <Controller
              name="stock"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Stock"
                  type="number"
                  error={!!errors.stock}
                  helperText={errors.stock?.message as string}
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* FILTER DRAWER */}
      <Drawer
        anchor="right"
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <Box
          sx={{
            width: 320,
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Filter Items
          </Typography>

          <Autocomplete
            options={categories}
            getOptionLabel={(opt) => opt.name}
            value={filters.category}
            onChange={(e, val) =>
              setFilters({ ...filters, category: val, subcategory: null })
            }
            renderInput={(params) => (
              <TextField {...params} label="Category" size="small" />
            )}
          />

          <Autocomplete
            options={filters.category?.subcategories || []}
            getOptionLabel={(opt) => opt.name}
            value={filters.subcategory}
            onChange={(e, val) => setFilters({ ...filters, subcategory: val })}
            renderInput={(params) => (
              <TextField {...params} label="Subcategory" size="small" />
            )}
          />

          <TextField
            label="Max Price"
            type="number"
            size="small"
            value={filters.price}
            onChange={(e) => setFilters({ ...filters, price: e.target.value })}
          />

          <Stack direction="row" spacing={2} sx={{ mt: "auto" }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                fetchItems();
                setFilterOpen(false);
              }}
            >
              Apply
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setFilters({
                  category: null,
                  subcategory: null,
                  price: "",
                });
                fetchItems();
              }}
            >
              Clear
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Container>
  );
}
