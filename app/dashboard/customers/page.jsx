"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  getKeyValue,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Pagination,
  Spinner,
  Tooltip,
  DropdownSection,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Link,
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
import { useState, useEffect, useMemo, useCallback } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { capitalize } from "@/app/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const rowsPerPage = 10; // Definido como constante
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false); // Estado para manejar la eliminación
  const [error, setError] = useState(null);
  const [filterKey, setFilterKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerToDelete, setCustomerToDelete] = useState(null); // Cliente a eliminar
  const [sortDescriptor, setSortDescriptor] = useState({ column: null, direction: null }); // Añadido
  const [user, setUser] = useState(null);
  
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Control del modal

  const filterItems = [
    { key: "minorista", label: "Minorista" },
    { key: "mayorista", label: "Mayorista" },
  ];

  // Fetch de clientes
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      const token = Cookies.get("access_token");
      try {
        const response = await api.get("/customers/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setCustomers(response.data);
      } catch (error) {
        console.error(error);
        setError("Error al cargar los clientes.");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();

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

  // Manejo de acciones de filtro
  const handleFilterAction = useCallback((key) => {
    if (key === "none") {
      setFilterKey(null);
    } else {
      setFilterKey(key);
    }
    setPage(1);
  }, []);

  // Manejo de cambio en la búsqueda (sin debounce)
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  // Función para abrir el modal y setear el cliente a eliminar
  const handleDeleteClick = useCallback((customer) => {
    setCustomerToDelete(customer);
    onOpen();
  }, [onOpen]);

  // Función para eliminar el cliente
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
      setCustomers((prevCustomers) => prevCustomers.filter(c => c.id !== customerToDelete.id));
      onClose();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      setError("Error al eliminar el cliente.");
    } finally {
      setDeleting(false);
    }
  }, [customerToDelete, onClose]);

  const columns = [
    { key: 'id', label: '#', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'phone', label: 'Celular', sortable: false },
    { key: 'email', label: 'Correo', sortable: false },
    { key: 'address', label: 'Dirección', sortable: false },
    { key: 'customer_type', label: 'Tipo de cliente', sortable: true },
    { key: 'actions', label: 'Acciones', sortable: false },
  ];

  // Ordenamiento de los clientes según la columna seleccionada
  const sortedCustomers = useMemo(() => {
    if (!sortDescriptor.column) return [...customers];
    const sorted = [...customers].sort((a, b) => {
      const aValue = a[sortDescriptor.column];
      const bValue = b[sortDescriptor.column];

      if (typeof aValue === "string") {
        return sortDescriptor.direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) {
        return sortDescriptor.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDescriptor.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [customers, sortDescriptor]);

  // Filtrado y búsqueda
  const filteredCustomers = useMemo(() => {
    let filtered = [...sortedCustomers];

    // Filtrar por tipo de cliente si se ha seleccionado un filtro
    if (filterKey) {
      const normalizedFilterKey = filterKey.toLowerCase().trim();
      filtered = filtered.filter(customer =>
        customer.customer_type &&
        customer.customer_type.toLowerCase().trim() === normalizedFilterKey
      );
    }

    // Aplicar búsqueda sobre los datos filtrados
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(customer =>
        (customer.name && customer.name.toLowerCase().includes(query)) ||
        (customer.email && customer.email.toLowerCase().includes(query)) ||
        (customer.phone_number && customer.phone_number.includes(searchQuery))
      );
    }

    return filtered;
  }, [sortedCustomers, filterKey, searchQuery]);

  // Mapeo de clientes a filas de la tabla
  const rows = useMemo(() => (
    filteredCustomers.map(customer => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone_number,
      email: customer.email,
      address: customer.address,
      customer_type: capitalize(customer.customer_type) || 'N/A',
      actions: (
        <div className="flex space-x-2">
          <Tooltip content="Editar">
            <Button
              variant="light"
              className="rounded-md"
              isIconOnly
              color="warning"
              onPress={() => router.push(`/dashboard/customers/edit/${customer.id}`)}
              aria-label={`Editar cliente ${customer.name}`} // Mejoras de accesibilidad
            >
              <IconEdit className="h-8" />
            </Button>
          </Tooltip>
          <Tooltip content="Eliminar">
            <Button
              variant="light"
              className="rounded-md"
              isIconOnly
              color="danger"
              onPress={() => handleDeleteClick(customer)}
              aria-label={`Eliminar cliente ${customer.name}`} // Mejoras de accesibilidad
              isDisabled={user.user_type != 'ADMIN'}
            >
              <IconTrash className="h-8" />
            </Button>
          </Tooltip>
        </div>
      )
    }))
  ), [filteredCustomers, handleDeleteClick, router]);

  const totalItems = rows.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Reseteo de página si excede el total de páginas
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [totalPages, page]);

  // Paginación
  const currentItems = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return rows.slice(startIdx, endIdx);
  }, [rows, page, rowsPerPage]);

  const currentItemsCount = currentItems.length;

  const handlePageChangeFunc = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  // Función para manejar el cambio de ordenamiento
  const handleSortChange = useCallback((columnKey) => {
    setSortDescriptor(prev => {
      if (prev.column === columnKey) {
        // Toggle direction
        return {
          column: columnKey,
          direction: prev.direction === "ascending" ? "descending" : "ascending"
        };
      } else {
        // Nueva columna, por defecto ascendente
        return {
          column: columnKey,
          direction: "ascending"
        };
      }
    });
  }, []);

  // Función para renderizar los encabezados con ordenamiento
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
        {isSortable && (
          direction === "ascending" ? <IconChevronUp className="ml-1 h-4 w-4" /> :
            direction === "descending" ? <IconChevronDown className="ml-1 h-4 w-4" /> :
              null
        )}
      </div>
    );
  }, [sortDescriptor, handleSortChange]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Clientes</p>
        <div className="flex space-x-2">
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
          onChange={handleSearchChange}
          className="w-full md:w-1/3"
          aria-label="Buscar clientes"
        />
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="bordered"
              className={`rounded-md border-1.5 ${filterKey ? 'bg-gray-200' : ''}`}
              aria-label="Filtros"
            >
              <IconFilter className="h-4 mr-1" />
              {filterKey ? `${filterItems.find(item => item.key === filterKey)?.label || "Filtros"}` : "Tipo de Cliente"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Filters" onAction={handleFilterAction}>
            <DropdownSection className="max-h-60 overflow-y-auto">
              {filterItems.map(item => (
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
        ) : error ? (
          <div className="text-red-500 text-center p-6">
            {error}
          </div>
        ) : currentItemsCount === 0 ? (
          <div className="text-center p-6">
            No hay clientes para mostrar.
          </div>
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
            <TableBody items={currentItems}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => {
                    if (columnKey === 'id') {
                      return (
                        <TableCell>
                          {getKeyValue(item, columnKey)}
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell className="min-w-[80px] sm:min-w-[100px]">
                        {getKeyValue(item, columnKey)}
                      </TableCell>
                    );
                  }}
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Paginación y Contador */}
      {!loading && !error && currentItemsCount !== 0 && (
        <div className='flex flex-col sm:flex-row items-center justify-between mt-4'>
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {currentItemsCount} de {totalItems} clientes
          </p>
          <Pagination
            total={totalPages}
            initialPage={page}
            page={page}
            onChange={handlePageChangeFunc}
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
                  ¿Estás seguro de que deseas eliminar al cliente <strong>{customerToDelete?.name}</strong>?
                  Esta acción no se puede deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleDeleteCustomer}
                  disabled={deleting}
                >
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
