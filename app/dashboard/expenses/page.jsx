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
  IconChevronUp,
  IconChevronDown,
  IconTrash
} from "@tabler/icons-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterSupplier, setFilterSupplier] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [sortDescriptor, setSortDescriptor] = useState({ column: null, direction: null });
  const [user, setUser] = useState(null);

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Función para formatear montos
  const formatAmount = useCallback((amount) => {
    if (amount == null || isNaN(amount)) return '';
    return parseFloat(amount).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);

  // Función para formatear fechas
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }, []);

  // Fetch de gastos
  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError(null);
      const token = Cookies.get("access_token");
      try {
        const response = await api.get("/expenses/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setExpenses(response.data);
      } catch (error) {
        console.error(error);
        setError("Error al cargar los gastos.");
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();

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

  // Fetch de categorías
  useEffect(() => {
    const fetchCategories = async () => {
      const token = Cookies.get("access_token");
      try {
        const response = await api.get("/expense-categories/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setCategories(response.data);
      } catch (error) {
        console.error("Error al cargar las categorías:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch de proveedores
  useEffect(() => {
    const fetchSuppliers = async () => {
      const token = Cookies.get("access_token");
      try {
        const response = await api.get("/suppliers/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setSuppliers(response.data);
      } catch (error) {
        console.error("Error al cargar los proveedores:", error);
      }
    };
    fetchSuppliers();
  }, []);

  // Manejo de filtros
  const handleFilterCategory = useCallback((key) => {
    if (key === "none") {
      setFilterCategory(null);
    } else {
      setFilterCategory(parseInt(key, 10));
    }
    setPage(1);
  }, []);

  const handleFilterSupplier = useCallback((key) => {
    if (key === "none") {
      setFilterSupplier(null);
    } else {
      setFilterSupplier(parseInt(key, 10));
    }
    setPage(1);
  }, []);

  // Manejo de búsqueda
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  // Manejo de eliminación
  const handleDeleteClick = useCallback((expense) => {
    setExpenseToDelete(expense);
    onOpen();
  }, [onOpen]);

  const handleDeleteExpense = useCallback(async () => {
    if (!expenseToDelete) return;

    setDeleting(true);
    const token = Cookies.get("access_token");
    try {
      await api.delete(`/expenses/${expenseToDelete.id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setExpenses((prevExpenses) => prevExpenses.filter(c => c.id !== expenseToDelete.id));
      onClose();
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
      setError("Error al eliminar el gasto.");
    } finally {
      setDeleting(false);
    }
  }, [expenseToDelete, onClose]);

  // Definición de columnas
  const columns = [
    { key: 'id', label: '#', sortable: true },
    { key: 'amount', label: 'Monto', sortable: true },
    { key: 'date', label: 'Fecha', sortable: true },
    { key: 'description', label: 'Descripción', sortable: false },
    { key: 'category', label: 'Categoría', sortable: true },
    { key: 'supplier', label: 'Proveedor', sortable: true },
    { key: 'actions', label: 'Acciones', sortable: false },
  ];

  // Ordenamiento de gastos
  const sortedExpenses = useMemo(() => {
    if (!sortDescriptor.column) return [...expenses];
    const sorted = [...expenses].sort((a, b) => {
      let aValue, bValue;

      if (sortDescriptor.column === 'category') {
        aValue = a.category_details?.name || '';
        bValue = b.category_details?.name || '';
      } else if (sortDescriptor.column === 'supplier') {
        aValue = a.supplier_details?.name || '';
        bValue = b.supplier_details?.name || '';
      } else if (sortDescriptor.column === 'amount') {
        aValue = a.amount != null ? parseFloat(a.amount) : 0;
        bValue = b.amount != null ? parseFloat(b.amount) : 0;
      } else if (sortDescriptor.column === 'date') {
        aValue = a.date != null ? new Date(a.date) : new Date(0);
        bValue = b.date != null ? new Date(b.date) : new Date(0);
      } else {
        aValue = a[sortDescriptor.column] != null ? a[sortDescriptor.column] : '';
        bValue = b[sortDescriptor.column] != null ? b[sortDescriptor.column] : '';
      }

      const aType = typeof aValue;
      const bType = typeof bValue;

      if (aType === 'string' && bType === 'string') {
        return sortDescriptor.direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aType === 'number' && bType === 'number') {
        return sortDescriptor.direction === 'ascending'
          ? aValue - bValue
          : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDescriptor.direction === 'ascending'
          ? aValue - bValue
          : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);
      return sortDescriptor.direction === 'ascending'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
    return sorted;
  }, [expenses, sortDescriptor]);

  // Filtrado y búsqueda
  const filteredExpenses = useMemo(() => {
    let filtered = [...sortedExpenses];

    if (filterCategory) {
      filtered = filtered.filter(expense =>
        expense.category_details &&
        expense.category_details.id === filterCategory
      );
    }

    if (filterSupplier) {
      filtered = filtered.filter(expense =>
        expense.supplier_details &&
        expense.supplier_details.id === filterSupplier
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(expense =>
        (expense.description && expense.description.toLowerCase().includes(query)) ||
        (expense.category_details?.name && expense.category_details.name.toLowerCase().includes(query)) ||
        (expense.supplier_details?.name && expense.supplier_details.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [sortedExpenses, filterCategory, filterSupplier, searchQuery]);

  // Mapeo de gastos a filas de la tabla
  const rows = useMemo(() => (
    filteredExpenses.map(expense => ({
      id: expense.id,
      amount: formatAmount(expense.amount),
      date: formatDate(expense.date),
      description: expense.description,
      category: expense.category_details?.name || '',
      supplier: expense.supplier_details?.name || '',
      actions: (
        <div className="flex space-x-2">
          <Tooltip content="Editar">
            <Button
              variant="light"
              className="rounded-md"
              isIconOnly
              color="warning"
              onPress={() => router.push(`/dashboard/expenses/edit/${expense.id}`)}
              aria-label={`Editar gasto ${expense.description}`}
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
              onPress={() => handleDeleteClick(expense)}
              aria-label={`Eliminar gasto ${expense.description}`}
              isDisabled={user.user_type != 'ADMIN'}
            >
              <IconTrash className="h-5" />
            </Button>
          </Tooltip>
        </div>
      )
    }))
  ), [filteredExpenses, handleDeleteClick, router, formatAmount, formatDate]);

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
        return {
          column: columnKey,
          direction: prev.direction === "ascending" ? "descending" : "ascending"
        };
      } else {
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
        <p className="text-2xl font-bold mb-4 md:mb-0">Gastos</p>
        <div className="flex flex-wrap gap-2">
          <Tooltip content="Exportar gastos">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconDownload className="h-4 mr-1" />
              Exportar
            </Button>
          </Tooltip>
          <Tooltip content="Listar categorías">
            <Link href="/dashboard/expenses/categories">
              <Button className="rounded-md bg-black text-white">
                Categorías
              </Button>
            </Link>
          </Tooltip>
          <Tooltip content="Listar proveedores">
            <Link href="/dashboard/expenses/suppliers">
              <Button className="rounded-md bg-black text-white">
                Proveedores
              </Button>
            </Link>
          </Tooltip>
          <Tooltip content="Agregar nuevo gasto">
            <Link href="/dashboard/expenses/create">
              <Button className="rounded-md bg-black text-white">
                <IconPlus className="h-4 mr-1" />
                Nuevo Gasto
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        <Input
          placeholder="Buscar gastos"
          startContent={<IconSearch className="h-4" />}
          radius="none"
          variant="underlined"
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={() => {
            setSearchQuery('');
            setPage(1);
          }}
          className="w-full md:w-1/3"
          aria-label="Buscar gastos"
          isClearable={true}
        />
        <div className="flex space-x-4">
          {/* Filtro por Categoría */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                className={`rounded-md border-1.5 ${filterCategory ? 'bg-gray-200' : ''}`}
                aria-label="Filtros de Categoría"
              >
                <IconFilter className="h-4 mr-1" />
                {filterCategory
                  ? `${categories.find(item => item.id === filterCategory)?.name || "Categoría"}`
                  : "Categoría"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filtros de Categoría"
              onAction={handleFilterCategory}
            >
              <DropdownSection className="max-h-60 overflow-y-auto">
                {categories.map(item => (
                  <DropdownItem key={item.id} value={item.id}>
                    {item.name}
                  </DropdownItem>
                ))}
              </DropdownSection>
              <DropdownItem key="none-category" value="none" className="border-t-1 rounded-t-none">
                Quitar Filtro de Categoría
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* Filtro por Proveedor */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                className={`rounded-md border-1.5 ${filterSupplier ? 'bg-gray-200' : ''}`}
                aria-label="Filtros de Proveedor"
              >
                <IconFilter className="h-4 mr-1" />
                {filterSupplier
                  ? `${suppliers.find(item => item.id === filterSupplier)?.name || "Proveedor"}`
                  : "Proveedor"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filtros de Proveedor"
              onAction={handleFilterSupplier}
            >
              <DropdownSection className="max-h-60 overflow-y-auto">
                {suppliers.map(item => (
                  <DropdownItem key={item.id} value={item.id}>
                    {item.name}
                  </DropdownItem>
                ))}
              </DropdownSection>
              <DropdownItem key="none-supplier" value="none" className="border-t-1 rounded-t-none">
                Quitar Filtro de Proveedor
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Tabla de Gastos */}
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
            No hay gastos para mostrar.
          </div>
        ) : (
          <Table
            aria-label="Gastos"
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
            Mostrando {currentItemsCount} de {totalItems} gastos
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
          // siblingCount={1} // Eliminado para evitar la advertencia
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
                  ¿Estás seguro de que deseas eliminar el gasto <strong>{expenseToDelete?.description}</strong>?
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
                  onPress={handleDeleteExpense}
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
