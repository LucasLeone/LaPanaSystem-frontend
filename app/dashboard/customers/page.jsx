"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Button,
  Input,
  Spinner,
  Link,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Pagination,
  useDisclosure,
} from "@nextui-org/react";
import {
  IconDownload,
  IconPlus,
  IconSearch,
  IconFilter,
} from "@tabler/icons-react";

import { capitalize } from "@/app/utils";
import api from "@/app/axios";
import useCustomers from "@/app/hooks/useCustomers";

import CustomersTable from "./components/CustomersTable";
import ConfirmationModal from "./components/ConfirmationModal";
import StandingOrdersModal from "./components/StandingOrdersModal";
import EditStandingOrderModal from "./components/EditStandingOrderModal";
import toast from "react-hot-toast";

export const DAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function CustomersPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        Cookies.remove("user");
      }
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [filterCustomerType, setFilterCustomerType] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState({
    column: null,
    direction: null,
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const offset = useMemo(() => (page - 1) * 10, [page]);

  const orderingParam = useMemo(() => {
    if (!sortDescriptor.column) return "";
    const prefix = sortDescriptor.direction === "ascending" ? "" : "-";
    return prefix + sortDescriptor.column;
  }, [sortDescriptor]);

  const {
    customers,
    totalCount,
    loading,
    error: fetchError,
    fetchCustomers,
  } = useCustomers(
    {
      search: debouncedSearchQuery,
      customer_type: filterCustomerType,
      ordering: orderingParam,
    },
    offset,
    10
  );

  const filterItems = [
    { key: "minorista", label: "Minorista" },
    { key: "mayorista", label: "Mayorista" },
  ];

  const handleFilterCustomerType = useCallback((key) => {
    if (key === "none") {
      setFilterCustomerType("");
    } else {
      setFilterCustomerType(key);
    }
    setPage(1);
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = useCallback(
    (customer) => {
      setCustomerToDelete(customer);
      onOpen();
    },
    [onOpen]
  );

  const handleDeleteCustomer = useCallback(async () => {
    if (!customerToDelete) return;
    setDeleting(true);

    try {
      const token = Cookies.get("access_token");
      await api.delete(`/customers/${customerToDelete.id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      fetchCustomers({
        search: debouncedSearchQuery,
        customer_type: filterCustomerType,
        ordering: orderingParam,
        page: offset,
        limit: 10,
      });
      onClose();
      toast.success("¡Cliente eliminado exitosamente!");
    } catch (err) {
      console.error("Error al eliminar cliente:", err);
      toast.error("Error al eliminar cliente.");
    } finally {
      setDeleting(false);
    }
  }, [
    customerToDelete,
    debouncedSearchQuery,
    fetchCustomers,
    filterCustomerType,
    orderingParam,
    offset,
    onClose,
  ]);

  const totalPages = Math.ceil(totalCount / 10);
  const handlePageChange = useCallback((newPage) => {
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
        return { column: columnKey, direction: "ascending" };
      }
    });
  }, []);

  const [standingOrdersModalOpen, setStandingOrdersModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [standingOrders, setStandingOrders] = useState([]);
  const [loadingStandingOrders, setLoadingStandingOrders] = useState(false);
  const [errorStandingOrders, setErrorStandingOrders] = useState(null);

  const handleStandingOrdersClick = useCallback(async (customer) => {
    setSelectedCustomer(customer);
    setStandingOrdersModalOpen(true);
    setLoadingStandingOrders(true);
    setErrorStandingOrders(null);

    const token = Cookies.get("access_token");
    try {
      const response = await api.get(`/standing-orders/?customer=${customer.id}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const sortedOrders = response.data.results.sort(
        (a, b) => a.day_of_week - b.day_of_week
      );
      setStandingOrders(sortedOrders);
    } catch (err) {
      console.error("Error al obtener pedidos diarios:", err);
      setErrorStandingOrders("Error al obtener los pedidos diarios.");
    } finally {
      setLoadingStandingOrders(false);
    }
  }, []);

  const [editingStandingOrder, setEditingStandingOrder] = useState(null);

  const [productsMap, setProductsMap] = useState({});
  useEffect(() => {
    const fetchProducts = async () => {
      const token = Cookies.get("access_token");
      try {
        const response = await api.get(`/products/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        const productsArray = response.data.results;
        const productsObject = {};
        productsArray.forEach((product) => {
          productsObject[product.id] = product;
        });
        setProductsMap(productsObject);
      } catch (err) {
        console.error("Error al obtener productos:", err);
      }
    };

    fetchProducts();
  }, []);

  const handleEditStandingOrder = (order) => {
    setEditingStandingOrder({ ...order });
  };

  const handleCreateStandingOrder = (dayOfWeek) => {
    setEditingStandingOrder({
      id: null,
      customer: selectedCustomer.id,
      day_of_week: dayOfWeek,
      details: [],
    });
  };

  const handleCopyStandingOrder = useCallback(
    async (order) => {
      if (!selectedCustomer) return;

      const token = Cookies.get("access_token");

      try {
        for (const day of [...Array(7).keys()]) {
          const existingOrder = standingOrders.find(
            (so) => so.day_of_week === day
          );

          if (existingOrder) {
            await api.delete(`/standing-orders/${existingOrder.id}/`, {
              headers: {
                Authorization: `Token ${token}`,
              },
            });
          }

          const dataToSend = {
            customer: selectedCustomer.id,
            day_of_week: day,
            details: order.details.map((detail) => ({
              product: detail.product,
              quantity: detail.quantity,
            })),
          };

          await api.post(`/standing-orders/`, dataToSend, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });
        }

        const response = await api.get(
          `/standing-orders/?customer=${selectedCustomer.id}`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
        const sortedOrders = response.data.results.sort(
          (a, b) => a.day_of_week - b.day_of_week
        );
        setStandingOrders(sortedOrders);

        toast.success("¡Pedido copiado a todos los días!");
      } catch (err) {
        console.error("Error al copiar el pedido diario:", err);
        toast.error("Error al copiar el pedido diario.");
      }
    },
    [selectedCustomer, standingOrders, setStandingOrders]
  );


  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Clientes</p>
        <div className="flex gap-1">
          <Tooltip content="Exportar clientes">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconDownload className="h-4 mr-1" />
              Exportar
            </Button>
          </Tooltip>
          <Tooltip content="Agregar nuevo cliente">
            <Link href="/dashboard/customers/create">
              <Button className="rounded-md bg-black text-white">
                <IconPlus className="h-4 mr-1" />
                Nuevo Cliente
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        <Input
          placeholder="Buscar clientes"
          startContent={<IconSearch className="h-4" />}
          radius="none"
          variant="underlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3"
          aria-label="Buscar clientes"
          isClearable
          onClear={() => {
            setSearchQuery("");
            setPage(1);
          }}
        />
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="bordered"
              className={`rounded-md border-1.5 ${filterCustomerType ? "bg-gray-200" : ""
                }`}
              aria-label="Filtros"
            >
              <IconFilter className="h-4 mr-1" />
              {filterCustomerType
                ? filterItems.find((item) => item.key === filterCustomerType)
                  ?.label || "Filtros"
                : "Tipo de Cliente"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Filters"
            onAction={(value) => handleFilterCustomerType(value)}
          >
            <DropdownSection className="max-h-60 overflow-y-auto">
              {filterItems.map((item) => (
                <DropdownItem key={item.key} value={item.key}>
                  {item.label}
                </DropdownItem>
              ))}
            </DropdownSection>
            <DropdownItem key="none" value="none" className="border-t-1">
              Quitar Filtro
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Tabla de Clientes */}
      <CustomersTable
        customers={customers}
        loading={loading}
        fetchError={fetchError}
        onDeleteClick={handleDeleteClick}
        onStandingOrdersClick={handleStandingOrdersClick}
        user={user}
        onSortChange={handleSortChange}
        sortDescriptor={sortDescriptor}
        capitalize={capitalize}
        router={router}
      />

      {/* Paginación */}
      {!loading && !fetchError && customers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {customers.length} de {totalCount} clientes
          </p>
          <Pagination
            total={totalPages}
            initialPage={page}
            page={page}
            onChange={handlePageChange}
            size="sm"
            showShadow={true}
            color="primary"
          />
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        customerToDelete={customerToDelete}
        deleting={deleting}
        handleDeleteCustomer={handleDeleteCustomer}
      />

      {/* Modal de Pedidos Diarios */}
      <StandingOrdersModal
        isOpen={standingOrdersModalOpen}
        onClose={setStandingOrdersModalOpen}
        selectedCustomer={selectedCustomer}
        standingOrders={standingOrders}
        loadingStandingOrders={loadingStandingOrders}
        errorStandingOrders={errorStandingOrders}
        handleEditStandingOrder={handleEditStandingOrder}
        handleCreateStandingOrder={handleCreateStandingOrder}
        handleCopyStandingOrder={handleCopyStandingOrder}
        productsMap={productsMap}
      />

      {/* Modal para Editar o Crear Pedido Diario */}
      <EditStandingOrderModal
        editingStandingOrder={editingStandingOrder}
        setEditingStandingOrder={setEditingStandingOrder}
        selectedCustomer={selectedCustomer}
        productsMap={productsMap}
        setStandingOrders={setStandingOrders}
      />
    </div>
  );
}
