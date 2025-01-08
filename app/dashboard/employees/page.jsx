"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
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
import useUsers from "@/app/hooks/useUsers";
import toast from "react-hot-toast";

export default function EmployeesPage() {
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
  const [filterKey, setFilterKey] = useState(null);
  const [sortDescriptor, setSortDescriptor] = useState({ column: null, direction: null });
  const [page, setPage] = useState(1);

  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleting, setDeleting] = useState(false);

  const filterItems = [
    { key: "SELLER", label: "Vendedor" },
    { key: "DELIVERY", label: "Repartidor" },
    { key: "ADMIN", label: "Administrador" },
  ];

  const USER_TYPE_LABELS = useMemo(() => ({
    SELLER: "Vendedor",
    DELIVERY: "Repartidor",
    ADMIN: "Administrador",
  }), []);

  const orderingParam = useMemo(() => {
    if (!sortDescriptor.column) return "";
    const prefix = sortDescriptor.direction === "ascending" ? "" : "-";
    return prefix + sortDescriptor.column;
  }, [sortDescriptor]);

  const offset = useMemo(() => (page - 1) * 10, [page]);

  const { users: employees, totalCount, loading: usersLoading, error: usersError, fetchUsers } = useUsers({
    search: debouncedSearchQuery,
    user_type: filterKey,
    ordering: orderingParam,
    offset,
    limit: 10,
  });

  const handleFilterAction = useCallback((key) => {
    if (key === "none") {
      setFilterKey(null);
    } else {
      setFilterKey(key);
    }
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  const handleDeleteClick = useCallback((employee) => {
    setEmployeeToDelete(employee);
    onOpen();
  }, [onOpen]);

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
      fetchUsers();
      onClose();
      toast.success(`Empleado ${employeeToDelete.username} eliminado exitosamente.`);
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      toast.error("Ocurrió un error al eliminar el empleado. Por favor, intenta de nuevo.");
    } finally {
      setDeleting(false);
    }
  }, [employeeToDelete, fetchUsers, onClose]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const totalPages = useMemo(() => Math.ceil(totalCount / 10), [totalCount]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

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

  const columns = [
    { key: "id", label: "#", sortable: true },
    { key: "username", label: "Usuario", sortable: true },
    { key: "first_name", label: "Nombre", sortable: true },
    { key: "last_name", label: "Apellido", sortable: true },
    { key: "email", label: "Correo", sortable: true },
    { key: "phone_number", label: "Celular", sortable: false },
    { key: "user_type", label: "Tipo de Usuario", sortable: true },
    { key: "actions", label: "Acciones", sortable: false },
  ];

  const rows = useMemo(() => (
    employees.map(employee => ({
      id: employee.id,
      username: employee.username,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone_number: employee.phone_number,
      user_type: USER_TYPE_LABELS[employee.user_type] || 'N/A',
      actions: (
        <div className="flex gap-1">
          <Tooltip content="Editar">
            <Button
              variant="light"
              className="rounded-md"
              isIconOnly
              color="warning"
              onPress={() => router.push(`/dashboard/employees/edit/${employee.username}`)}
              aria-label={`Editar empleado ${employee.username}`}
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
              onPress={() => handleDeleteClick(employee)}
              aria-label={`Eliminar empleado ${employee.username}`}
              isDisabled={user?.user_type !== 'ADMIN'}
            >
              <IconTrash className="h-5" />
            </Button>
          </Tooltip>
        </div>
      ),
    }))
  ), [employees, USER_TYPE_LABELS, router, handleDeleteClick, user]);

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

  const filteredEmployees = useMemo(() => {
    let filtered = [...sortedEmployees];

    if (filterKey) {
      const normalizedFilterKey = filterKey.toUpperCase().trim();
      filtered = filtered.filter(employee =>
        employee.user_type &&
        employee.user_type.toUpperCase().trim() === normalizedFilterKey
      );
    }

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

  const finalRows = useMemo(() => (
    filteredEmployees.map(employee => ({
      id: employee.id,
      username: employee.username,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone_number: employee.phone_number,
      user_type: USER_TYPE_LABELS[employee.user_type] || 'N/A',
      actions: (
        <div className="flex gap-1">
          <Tooltip content="Editar">
            <Button
              variant="light"
              className="rounded-md"
              isIconOnly
              color="warning"
              onPress={() => router.push(`/dashboard/employees/edit/${employee.username}`)}
              aria-label={`Editar empleado ${employee.username}`}
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
              onPress={() => handleDeleteClick(employee)}
              aria-label={`Eliminar empleado ${employee.username}`}
              isDisabled={user?.user_type !== 'ADMIN'}
            >
              <IconTrash className="h-5" />
            </Button>
          </Tooltip>
        </div>
      ),
    }))
  ), [filteredEmployees, USER_TYPE_LABELS, router, handleDeleteClick, user]);

  const totalItems = filteredEmployees.length;
  const totalPagesCalc = useMemo(() => Math.ceil(totalItems / 10), [totalItems]);

  useEffect(() => {
    if (page > totalPagesCalc && totalPagesCalc > 0) {
      setPage(1);
    }
  }, [totalPagesCalc, page]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Empleados</p>
        <div className="flex gap-1">
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
        {usersLoading ? (
          <div className="flex justify-center items-center p-6">
            <Spinner size="lg">Cargando...</Spinner>
          </div>
        ) : usersError ? (
          <div className="text-red-500 text-center p-6">
            {usersError}
          </div>
        ) : totalItems === 0 ? (
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
            <TableBody>
              {finalRows.slice((page - 1) * 10, page * 10).map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.key === "actions" ? item.actions : item[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Paginación y Contador */}
      {!usersLoading && !usersError && totalItems > 0 && (
        <div className='flex flex-col sm:flex-row items-center justify-between mt-4'>
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {Math.min(page * 10, totalItems)} de {totalCount} empleados
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
