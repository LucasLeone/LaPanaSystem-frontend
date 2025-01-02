"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

import Header from "./components/Header";
import SalesTable from "./components/SalesTable";
import FilterModal from "./components/FilterModal";
import CancelModal from "./components/CancelModal";
import ViewDetailsModal from "./components/ViewDetailsModal";
import PaginationComponent from "./components/PaginationComponent";

import api from "@/app/axios";

import useSales from "@/app/hooks/useSales";
import useCustomers from "@/app/hooks/useCustomers";
import useUsers from "@/app/hooks/useUsers";

import { useDisclosure } from "@nextui-org/react"; // Importar useDisclosure

const DEFAULT_STATE_FILTERS = [
  "creada",
  "pendiente_entrega",
  "entregada",
  "cobrada",
  "cobrada_parcial",
];

const columns = [
  { key: "id", label: "#", sortable: true },
  { key: "date", label: "Fecha", sortable: true },
  { key: "customer", label: "Cliente", sortable: true },
  { key: "seller", label: "Vendedor", sortable: true },
  { key: "total", label: "Total", sortable: true },
  { key: "total_collected", label: "Total cobrado", sortable: true },
  { key: "sale_type", label: "Tipo de Venta", sortable: false },
  { key: "payment_method", label: "Método de Pago", sortable: false },
  { key: "state", label: "Estado", sortable: false },
  { key: "needs_delivery", label: "Delivery", sortable: false },
  { key: "actions", label: "Acciones", sortable: false },
];

export default function SalesPage() {
  const router = useRouter();

  // Inicializar useDisclosure para FilterModal
  const {
    isOpen: isFilterModalOpen,
    onOpen: onFilterModalOpen,
    onClose: onFilterModalClose,
  } = useDisclosure();

  // Estados para los modales y acciones
  const [saleToCancel, setSaleToCancel] = useState(null);
  const [saleToView, setSaleToView] = useState(null);

  // Estados de filtros y paginación
  const [filters, setFilters] = useState({
    state: DEFAULT_STATE_FILTERS,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState({
    column: null,
    direction: null,
  });
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);

  const { customers, loading: customersLoading, error: customersError } = useCustomers();
  const { users, loading: usersLoading, error: usersError } = useUsers();

  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(Cookies.get("access_token"));
  }, []);

  const appliedFilters = useMemo(() => {
    const newFilters = { ...filters };

    if (searchQuery) {
      newFilters.search = searchQuery;
    }

    if (sortDescriptor.column) {
      const columnKeyToField = {
        id: "id",
        date: "date",
        customer: "customer__name",
        seller: "user__username",
        total: "total",
        sale_type: "sale_type",
        payment_method: "payment_method",
        state: "state",
        needs_delivery: "needs_delivery",
      };
      const backendField =
        columnKeyToField[sortDescriptor.column] || sortDescriptor.column;
      newFilters.ordering =
        sortDescriptor.direction === "ascending"
          ? backendField
          : `-${backendField}`;
    }

    return newFilters;
  }, [filters, searchQuery, sortDescriptor]);

  const {
    sales,
    totalCount,
    loading: salesLoading,
    error: salesError,
    fetchSales,
  } = useSales(appliedFilters, (page - 1) * rowsPerPage, rowsPerPage);

  useEffect(() => {
    fetchSales(appliedFilters, (page - 1) * rowsPerPage, rowsPerPage);
  }, [filters, searchQuery, sortDescriptor, page, fetchSales, appliedFilters]);

  const applyFilters = useCallback(
    (newFilters) => {
      const updatedFilters = {};

      if (newFilters.state && newFilters.state.length > 0) {
        updatedFilters.state = newFilters.state;
      }
      if (newFilters.sale_type) {
        updatedFilters.sale_type = newFilters.sale_type;
      }
      if (newFilters.payment_method) {
        updatedFilters.payment_method = newFilters.payment_method;
      }
      if (newFilters.customer) {
        updatedFilters.customer = newFilters.customer;
      }
      if (newFilters.user) {
        updatedFilters.user = newFilters.user;
      }
      if (newFilters.min_total !== "") {
        updatedFilters.min_total = newFilters.min_total;
      }
      if (newFilters.max_total !== "") {
        updatedFilters.max_total = newFilters.max_total;
      }
      if (newFilters.date) {
        updatedFilters.date = new Date(newFilters.date).toISOString().split("T")[0];
      }
      if (newFilters.date_range) {
        updatedFilters.start_date = new Date(newFilters.date_range.start)
          .toISOString()
          .split("T")[0];
        updatedFilters.end_date = new Date(newFilters.date_range.end)
          .toISOString()
          .split("T")[0];
      }

      setFilters(updatedFilters);
      setPage(1);
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({
      state: DEFAULT_STATE_FILTERS,
    });
    setSearchQuery("");
    setSortDescriptor({
      column: null,
      direction: null,
    });
    setPage(1);
  }, []);

  const handleCancelClick = useCallback((sale) => {
    setSaleToCancel(sale);
  }, []);

  const handleCancelSale = useCallback(async () => {
    if (!saleToCancel) return;

    try {
      await api.post(`/sales/${saleToCancel.id}/cancel/`, null, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      fetchSales(appliedFilters, (page - 1) * rowsPerPage, rowsPerPage);
      setSaleToCancel(null);
      toast.success("Venta cancelada exitosamente.");
    } catch (error) {
      console.error("Error al cancelar la venta:", error);
      toast.error("Error al cancelar la venta.");
    }
  }, [saleToCancel, token, fetchSales, appliedFilters, page]);

  const handleViewClick = useCallback((sale) => {
    setSaleToView(sale);
  }, []);

  const handleEditClick = useCallback(
    (sale) => {
      if (
        sale.sale_details &&
        Array.isArray(sale.sale_details) &&
        sale.sale_details.length > 0
      ) {
        router.push(`/dashboard/sales/edit-with-details/${sale.id}`);
      } else {
        router.push(`/dashboard/sales/edit-without-details/${sale.id}`);
      }
    },
    [router]
  );

  const handlePageChangeFunc = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleSortChange = useCallback((columnKey) => {
    setSortDescriptor((prev) => {
      if (prev.column === columnKey) {
        return {
          column: columnKey,
          direction:
            prev.direction === "ascending" ? "descending" : "ascending",
        };
      } else {
        return {
          column: columnKey,
          direction: "ascending",
        };
      }
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      {/* Header */}
      <Header onFilterModalOpen={onFilterModalOpen} />

      {/* Tabla de Ventas */}
      <SalesTable
        sales={sales}
        loading={salesLoading}
        error={salesError}
        columns={columns}
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
        onViewClick={handleViewClick}
        onEditClick={handleEditClick}
        onCancelClick={handleCancelClick}
      />

      {/* Paginación */}
      <PaginationComponent
        totalPages={Math.ceil(totalCount / rowsPerPage)}
        currentPage={page}
        onPageChange={handlePageChangeFunc}
      />

      {/* Modales */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={onFilterModalClose}
        applyFilters={applyFilters}
        clearFilters={clearFilters}
        customers={customers}
        users={users}
      />

      <CancelModal
        isOpen={saleToCancel !== null}
        onClose={() => setSaleToCancel(null)}
        onConfirm={handleCancelSale}
        saleToCancel={saleToCancel}
      />

      <ViewDetailsModal
        isOpen={saleToView !== null}
        onClose={() => setSaleToView(null)}
        saleToView={saleToView}
        token={token}
      />
    </div>
  );
}
