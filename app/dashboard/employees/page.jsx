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

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const rowsPerPage = 10; // Definido como constante
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false); // Estado para manejar la eliminación
  const [error, setError] = useState(null);
  const [filterKey, setFilterKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeToDelete, setEmployeeToDelete] = useState(null); // Empleado a eliminar
  const [sortDescriptor, setSortDescriptor] = useState({ column: null, direction: null }); // Añadido
  const [user, setUser] = useState(null);

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Control del modal

  // Mapeo de traducción para user_type
  const USER_TYPE_LABELS = useMemo(() => ({
    SELLER: "Vendedor",
    DELIVERY: "Repartidor",
    ADMIN: "Administrador",
  }), []);

  // Define los tipos de usuario para filtrado
  const filterItems = [
    { key: "seller", label: "Vendedor" },
    { key: "delivery", label: "Repartidor" },
    { key: "admin", label: "Administrador" },
    // Agrega más tipos según tus necesidades
  ];

  // Fetch de empleados
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      const token = Cookies.get("access_token");
      try {
        const response = await api.get("/users/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setEmployees(response.data);
      } catch (error) {
        console.error(error);
        setError("Error al cargar los empleados.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();

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

  // Función para abrir el modal y setear el empleado a eliminar
  const handleDeleteClick = useCallback((employee) => {
    setEmployeeToDelete(employee);
    onOpen();
  }, [onOpen]);

  // Función para eliminar el empleado
  const handleDeleteEmployee = useCallback(async () => {
    if (!employeeToDelete) return;

    setDeleting(true);
    const token = Cookies.get("access_token");
    try {
      await api.delete(`/users/${employeeToDelete.username}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setEmployees((prevEmployees) => prevEmployees.filter(e => e.id !== employeeToDelete.id));
      onClose();
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      setError("Error al eliminar el empleado.");
    } finally {
      setDeleting(false);
    }
  }, [employeeToDelete, onClose]);

  // Define las columnas de la tabla
  const columns = [
    { key: 'id', label: '#', sortable: true },
    { key: 'username', label: 'Usuario', sortable: true },
    { key: 'first_name', label: 'Nombre', sortable: true },
    { key: 'last_name', label: 'Apellido', sortable: true },
    { key: 'email', label: 'Correo', sortable: true },
    { key: 'phone_number', label: 'Celular', sortable: false },
    { key: 'user_type', label: 'Tipo de Usuario', sortable: true },
    { key: 'actions', label: 'Acciones', sortable: false },
  ];

  // Ordenamiento de los empleados según la columna seleccionada
  const sortedEmployees = useMemo(() => {
    if (!sortDescriptor.column) return [...employees];
    const sorted = [...employees].sort((a, b) => {
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
  }, [employees, sortDescriptor]);

  // Filtrado y búsqueda
  const filteredEmployees = useMemo(() => {
    let filtered = [...sortedEmployees];

    // Filtrar por tipo de usuario si se ha seleccionado un filtro
    if (filterKey) {
      const normalizedFilterKey = filterKey.toUpperCase().trim();
      filtered = filtered.filter(employee =>
        employee.user_type &&
        employee.user_type.toUpperCase().trim() === normalizedFilterKey
      );
    }

    // Aplicar búsqueda sobre los datos filtrados
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(employee =>
        (employee.username && employee.username.toLowerCase().includes(query)) ||
        (employee.first_name && employee.first_name.toLowerCase().includes(query)) ||
        (employee.last_name && employee.last_name.toLowerCase().includes(query)) ||
        (employee.email && employee.email.toLowerCase().includes(query)) ||
        (employee.phone_number && employee.phone_number.includes(searchQuery))
      );
    }

    return filtered;
  }, [sortedEmployees, filterKey, searchQuery]);

  // Mapeo de empleados a filas de la tabla
  const rows = useMemo(() => (
    filteredEmployees.map(employee => ({
      id: employee.id,
      username: employee.username,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone_number: employee.phone_number,
      user_type: USER_TYPE_LABELS[employee.user_type] || 'N/A', // Traducción aplicada aquí
      actions: (
        <div className="flex space-x-2">
          <Tooltip content="Editar">
            <Button
              variant="light"
              className="rounded-md"
              isIconOnly
              color="warning"
              onPress={() => router.push(`/dashboard/employees/edit/${employee.username}`)}
              aria-label={`Editar empleado ${employee.username}`} // Mejoras de accesibilidad
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
              onPress={() => handleDeleteClick(employee)}
              aria-label={`Eliminar empleado ${employee.username}`} // Mejoras de accesibilidad
              isDisabled={user.user_type != 'ADMIN'}
            >
              <IconTrash className="h-8" />
            </Button>
          </Tooltip>
        </div>
      )
    }))
  ), [filteredEmployees, USER_TYPE_LABELS, router, handleDeleteClick]);

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
        <p className="text-2xl font-bold mb-4 md:mb-0">Empleados</p>
        <div className="flex space-x-2">
          <Tooltip content="Exportar empleados">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconDownload className="h-4 mr-1" />
              Exportar
            </Button>
          </Tooltip>
          <Tooltip content="Agregar nuevo empleado">
            <Link href="/dashboard/employees/create">
              <Button className="rounded-md bg-black text-white">
                <IconPlus className="h-4 mr-1" />
                Nuevo Empleado
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        <Input
          placeholder="Buscar empleados"
          startContent={<IconSearch className="h-4" />}
          radius="none"
          variant="underlined"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full md:w-1/3"
          aria-label="Buscar empleados"
        />
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="bordered"
              className={`rounded-md border-1.5 ${filterKey ? 'bg-gray-200' : ''}`}
              aria-label="Filtros"
            >
              <IconFilter className="h-4 mr-1" />
              {filterKey ? `${filterItems.find(item => item.key === filterKey)?.label || "Filtros"}` : "Tipo de Usuario"}
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

      {/* Tabla de Empleados */}
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
            No hay empleados para mostrar.
          </div>
        ) : (
          <Table
            aria-label="Empleados"
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
                          {item.id}
                        </TableCell>
                      );
                    }
                    if (columnKey === 'actions') {
                      return (
                        <TableCell>
                          {item.actions}
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
            Mostrando {currentItemsCount} de {totalItems} empleados
          </p>
          <Pagination
            total={totalPages}
            initialPage={page}
            page={page}
            onChange={handlePageChangeFunc}
            size="sm"
            showShadow={true}
            color="primary"
            boundaryCount={1}
            siblingCount={1}
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
                  ¿Estás seguro de que deseas eliminar al empleado <strong>{employeeToDelete?.username}</strong>?
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
                  onPress={handleDeleteEmployee}
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
