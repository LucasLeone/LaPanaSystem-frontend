"use client";

import {
  Button,
  Input,
  Spinner,
  Link,
  Tooltip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@nextui-org/react";
import {
  IconDownload,
  IconPlus,
  IconSearch,
  IconFilter,
  IconEdit,
  IconTrash,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { capitalize } from "@/app/utils";
import useCustomers from "@/app/hooks/useCustomers";

export default function CustomersPage() {
  const router = useRouter();

  // Estado para el usuario
  const [user, setUser] = useState(null);

  // useEffect para obtener el usuario
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

  // Estados para filtros y ordenamiento
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [filterCustomerType, setFilterCustomerType] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState({ column: null, direction: null });
  const [page, setPage] = useState(1);

  // Estados para eliminación de clientes
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Filtros para tipo de cliente
  const filterItems = [
    { key: "minorista", label: "Minorista" },
    { key: "mayorista", label: "Mayorista" },
  ];

  const offset = useMemo(() => (page - 1) * 10, [page]);

  const orderingParam = useMemo(() => {
    if (!sortDescriptor.column) return "";
    const prefix = sortDescriptor.direction === "ascending" ? "" : "-";
    return prefix + sortDescriptor.column;
  }, [sortDescriptor]);

  const { customers, totalCount, loading, error: fetchError, fetchCustomers } = useCustomers({
    search: debouncedSearchQuery,
    customer_type: filterCustomerType,
    ordering: orderingParam,
    page: offset,
    limit: 10,
  });

  const totalPages = Math.ceil(totalCount / 10);

  const handleFilterCustomerType = useCallback((key) => {
    if (key === "none") {
      setFilterCustomerType("");
    } else {
      setFilterCustomerType(key);
    }
    setPage(1);
  }, []);

  // Función para manejar la eliminación del cliente
  const handleDeleteCustomer = useCallback(async () => {
    if (!customerToDelete) return;

    setDeleting(true);
    const token = Cookies.get("access_token");
    try {
      await api.delete(`/customers/${customerToDelete.id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      fetchCustomers(); // Actualiza la lista de clientes después de eliminar
      onClose();
    } catch (err) {
      console.error("Error al eliminar cliente:", err);
      setError("Error al eliminar el cliente.");
    } finally {
      setDeleting(false);
    }
  }, [customerToDelete, fetchCustomers, onClose]);

  // Función para manejar la apertura del modal de eliminación
  const handleDeleteClick = useCallback((customer) => {
    setCustomerToDelete(customer);
    onOpen();
  }, [onOpen]);

  // Manejo de búsqueda con debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500); // 500ms de retraso

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Función para manejar el cambio de página
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  // Función para manejar el cambio de ordenamiento
  const handleSortChange = useCallback((columnKey) => {
    setSortDescriptor((prev) => {
      if (prev.column === columnKey) {
        return {
          column: columnKey,
          direction: prev.direction === "ascending" ? "descending" : "ascending",
        };
      } else {
        return { column: columnKey, direction: "ascending" };
      }
    });
  }, []);

  // Función para renderizar el header con íconos de ordenamiento
  const renderHeader = useCallback((column) => {
    const isSortable = column.sortable;
    const isSorted = sortDescriptor.column === column.key;
    const direction = isSorted ? sortDescriptor.direction : null;

    return (
      <div
        className={`flex items-center ${isSortable ? "cursor-pointer" : ""}`}
        onClick={() => isSortable && handleSortChange(column.key)}
        aria-sort={isSorted ? direction : "none"}
      >
        <span>{column.label}</span>
        {isSortable &&
          (direction === "ascending" ? (
            <IconChevronUp className="ml-1 h-4 w-4" />
          ) : direction === "descending" ? (
            <IconChevronDown className="ml-1 h-4 w-4" />
          ) : null)}
      </div>
    );
  }, [sortDescriptor, handleSortChange]);

  // Definición de columnas de la tabla
  const columns = [
    { key: "id", label: "#", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "phone_number", label: "Celular", sortable: false },
    { key: "email", label: "Correo", sortable: false },
    { key: "address", label: "Dirección", sortable: false },
    { key: "customer_type", label: "Tipo de Cliente", sortable: true },
    { key: "actions", label: "Acciones", sortable: false },
  ];

  // Generación de filas para la tabla
  const rows = useMemo(
    () =>
      customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        phone_number: customer.phone_number,
        email: customer.email,
        address: customer.address,
        customer_type: capitalize(customer.customer_type) || "N/A",
        actions: (
          <div className="flex gap-1">
            <Tooltip content="Editar">
              <Button
                variant="light"
                className="rounded-md"
                isIconOnly
                color="warning"
                onPress={() => router.push(`/dashboard/customers/edit/${customer.id}`)}
                aria-label={`Editar cliente ${customer.name}`}
              >
                <IconEdit className="h-5" />
              </Button>
            </Tooltip>
            <Tooltip content="Eliminar">
              <Button
                variant="light"
                className="rounded-md"
                isIconOnly
                color="danger"
                onPress={() => handleDeleteClick(customer)}
                aria-label={`Eliminar cliente ${customer.name}`}
                isDisabled={user?.user_type !== 'ADMIN'}
              >
                <IconTrash className="h-5" />
              </Button>
            </Tooltip>
          </div>
        ),
      })),
    [customers, handleDeleteClick, router, user]
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
              className={`rounded-md border-1.5 ${filterCustomerType ? "bg-gray-200" : ""}`}
              aria-label="Filtros"
            >
              <IconFilter className="h-4 mr-1" />
              {filterCustomerType
                ? `${filterItems.find((item) => item.key === filterCustomerType)?.label || "Filtros"}`
                : "Tipo de Cliente"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Filters" onAction={handleFilterCustomerType}>
            <DropdownSection className="max-h-60 overflow-y-auto">
              {filterItems.map((item) => (
                <DropdownItem key={item.key} value={item.key}>
                  {item.label}
                </DropdownItem>
              ))}
            </DropdownSection>
            <DropdownItem key="none" value="none" className="border-t-1 rounded-t-none">
              Quitar Filtro
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Tabla de Clientes */}
      <div className="overflow-x-auto border rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-6">
            <Spinner size="lg" />
          </div>
        ) : fetchError ? (
          <div className="text-red-500 text-center p-6">{fetchError}</div>
        ) : customers.length === 0 ? (
          <div className="text-center p-6">No hay clientes para mostrar.</div>
        ) : (
          <Table
            aria-label="Clientes"
            className="border-none min-w-full"
            shadow="none"
            isCompact
            removeWrapper
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.key}
                  className="bg-white text-bold border-b-1"
                  isSortable={column.sortable}
                >
                  {renderHeader(column)}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => {
                    if (column.key === "actions") {
                      return <TableCell key={column.key}>{item.actions}</TableCell>;
                    }
                    return (
                      <TableCell key={column.key} className="min-w-[80px] sm:min-w-[100px]">
                        {item[column.key]}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

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
      <Modal isOpen={isOpen} onOpenChange={onClose} aria-labelledby="modal-title" placement="top-center">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Confirmar Eliminación</ModalHeader>
              <ModalBody>
                <p>
                  ¿Estás seguro de que deseas eliminar al cliente <strong>{customerToDelete?.name}</strong>? Esta
                  acción no se puede deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose} disabled={deleting}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleDeleteCustomer} disabled={deleting}>
                  {deleting ? <Spinner size="sm" /> : "Eliminar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
