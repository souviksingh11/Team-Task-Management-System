"use client";

import { useEffect, useState, useMemo } from "react";
import { Container, Typography, Box, Chip } from "@mui/material";
import api from "@/lib/axios";
import DataTable from "@/components/DataTable"; // 👈 your table

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  // const [orders, setOrders] = useState<any[]>([]);
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const limit = 5;

  const fetchOrders = async () => {
  try {
    const res = await api.get(`/api/orders?page=${page}&limit=${limit}`);

    setOrders(res.data.data);
    setTotalPages(res.data.totalPages);
  } catch (err) {
    console.log(err);
  }
};

  useEffect(() => {
    fetchOrders();
  }, [page]);


  // 🔥 FORMAT DATA FOR TABLE
  const data = useMemo(() => {
    return orders.map((order) => {
      const totalAmount =
        order.items?.reduce(
          (sum: number, i: any) =>
            sum + i.price * i.quantity,
          0
        ) || 0;

      const totalQty =
        order.items?.reduce(
          (sum: number, i: any) => sum + i.quantity,
          0
        ) || 0;

      return {
        id: order.id,
        customer: order.customerName,
        total: totalAmount,
        qty: totalQty,
        date: new Date(order.createdAt).toLocaleString(),
        items: order.items,
      };
    });
  }, [orders]);

  // 🔥 COLUMNS
  const columns = [
    {
      accessorKey: "customer",
      header: "Customer",
    },
    {
      accessorKey: "qty",
      header: "Items",
    },
    {
      accessorKey: "total",
      header: "Total ₹",
      cell: ({ row }: any) => (
        <span style={{ fontWeight: "bold", color: "green" }}>
          ₹{row.original.total}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "items",
      header: "Items Detail",
      cell: ({ row }: any) => (
        <Box>
          {row.original.items?.map((i: any) => (
            <Chip
              key={i.id} // ✅ correct key
              label={`${i.item?.name} x${i.quantity}`}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>
      ),
    },
  ];

  return (
    <Container sx={{ mt: 1 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Order History
      </Typography>

      <Box
  sx={{
    border: "1px solid #ddd",
    borderRadius: 2,
    overflow: "hidden",
  }}
>
  <DataTable data={data} columns={columns} />
</Box>

{/* ✅ PAGINATION HERE */}
<Box
  sx={{
    display: "flex",
    justifyContent: "center",
    gap: 2,
    mt: 3,
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

      {orders.length === 0 && (
        <Typography variant="h6" sx={{ mt: 4, textAlign: "center", color: "gray" }}>
          No orders found 
        </Typography>
      )}
    </Container>
  );
}