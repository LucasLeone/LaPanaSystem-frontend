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
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import {
  IconDownload,
  IconPlus,
  IconSearch,
  IconFilter,
  IconTrash,
  IconChevronUp,
  IconChevronDown,
  IconEdit,
} from "@tabler/icons-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import useExpenses from "@/app/hooks/useExpenses";
import useExpenseCategories from "@/app/hooks/useExpenseCategories";
import useSuppliers from "@/app/hooks/useSuppliers";
import toast from "react-hot-toast";

export default function ExpensesPage() {
  const router = useRouter();

  // Estados para filtros temporales
  const [tempFilterCategory, setTempFilterCategory] = useState(null);
  const [tempFilterSupplier, setTempFilterSupplier] = useState(null);
  const [tempFilterSearch, setTempFilterSearch] = useState("");

  // Estado para filtros aplicados
  const [filters, setFilters] = useState({});

  // Estado para búsqueda y ordenamiento
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: null,
    direction: null,
  });

  // Paginación
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);

  // Estados para eliminación de gastos
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : {};

  // Control de modales
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isFilterModalOpen,
    onOpen: onFilterModalOpen,
    onClose: onFilterModalClose,
  } = useDisclosure();

  const {
    expenseCategories: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useExpenseCategories();

  const {
    suppliers,
    loading: suppliersLoading,
    error: suppliersError,
  } = useSuppliers();

  // Implementación del debouncing para la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms de retraso

    // Limpiar el timeout si el componente se desmonta o si searchQuery cambia antes de 500ms
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Memoización de filtros aplicados usando debouncedSearchQuery y sortDescriptor
  const appliedFilters = useMemo(() => {
    const newFilters = { ...filters };

    if (debouncedSearchQuery) {
      newFilters.search = debouncedSearchQuery;
    }

    if (sortDescriptor.column) {
      const columnKeyToField = {
        id: "id",
        date: "date",
        amount: "amount",
        description: "description",
        category: "category__name",
        supplier: "supplier__name",
      };
      const backendField = columnKeyToField[sortDescriptor.column] || sortDescriptor.column;
      newFilters.ordering =
        sortDescriptor.direction === "ascending"
          ? backendField
          : `-${backendField}`;
    }

    return newFilters;
  }, [filters, debouncedSearchQuery, sortDescriptor]);

  const {
    expenses,
    totalCount,
    loading: expensesLoading,
    error: expensesError,
    refetch: fetchExpenses
  } = useExpenses(appliedFilters, (page - 1) * rowsPerPage);

  // Función para aplicar los filtros
  const applyFilters = useCallback(() => {
    const newFilters = {};

    if (tempFilterCategory) {
      newFilters.category = tempFilterCategory;
    }
    if (tempFilterSupplier) {
      newFilters.supplier = tempFilterSupplier;
    }
    if (tempFilterSearch !== "") {
      newFilters.search = tempFilterSearch;
    }

    setFilters(newFilters);
    setPage(1);
    onFilterModalClose();
  }, [tempFilterCategory, tempFilterSupplier, tempFilterSearch, onFilterModalClose]);

  const clearFilters = useCallback(() => {
    setTempFilterCategory(null);
    setTempFilterSupplier(null);
    setTempFilterSearch("");
    setSearchQuery("");
    setSortDescriptor({
      column: null,
      direction: null,
    });
    setFilters({});
  }, []);

  // Manejo de búsqueda
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  // Manejo de eliminación de gastos
  const handleDeleteClick = useCallback(
    (expense) => {
      setExpenseToDelete(expense);
      onOpen();
    },
    [onOpen]
  );

  const handleDeleteExpense = useCallback(async () => {
    if (!expenseToDelete) return;

    const token = Cookies.get("access_token");
    try {
      await api.delete(`/expenses/${expenseToDelete.id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      fetchExpenses(appliedFilters, (page - 1) * rowsPerPage, rowsPerPage);
      onClose();
      toast.success("Gasto eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
      toast.error("Ocurrió un error al eliminar el gasto.");
    }
  }, [expenseToDelete, fetchExpenses, appliedFilters, page, onClose]);

  // Definición de columnas de la tabla
  const columns = [
    { key: "id", label: "#", sortable: true },
    { key: "date", label: "Fecha", sortable: true },
    { key: "amount", label: "Monto", sortable: true },
    { key: "description", label: "Descripción", sortable: false },
    { key: "category", label: "Categoría", sortable: true },
    { key: "supplier", label: "Proveedor", sortable: true },
    { key: "actions", label: "Acciones", sortable: false },
  ];

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  const formatAmount = useCallback((amount) => {
    if (amount == null || isNaN(amount)) return "";
    return parseFloat(amount).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  // Generación de filas para la tabla
  const rows = useMemo(
    () =>
      expenses.map((expense) => ({
        id: expense.id,
        date: formatDate(expense.date),
        amount: formatAmount(expense.amount),
        description: expense.description,
        category: expense.category_details?.name || "",
        supplier: expense.supplier_details?.name || "",
        actions: (
          <div className="flex gap-1">
            <Tooltip content="Editar">
              <Button
                variant="light"
                className="rounded-md"
                isIconOnly
                color="warning"
                onPress={() =>
                  router.push(`/dashboard/expenses/edit/${expense.id}`)
                }
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
                isDisabled={user.user_type !== "ADMIN"}
              >
                <IconTrash className="h-5" />
              </Button>
            </Tooltip>
          </div>
        ),
      })),
    [expenses, formatAmount, formatDate, handleDeleteClick, router, user.user_type]
  );

  const totalPages = Math.ceil(totalCount / rowsPerPage);

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

  const renderHeader = useCallback(
    (column) => {
      const isSortable = column.sortable;
      const isSorted = sortDescriptor.column === column.key;
      const direction = isSorted ? sortDescriptor.direction : null;

      return (
        <div
          className={`flex items-center ${isSortable ? "cursor-pointer" : ""
            }`}
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
    },
    [sortDescriptor, handleSortChange]
  );

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

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        <Input
          placeholder="Buscar gastos"
          startContent={<IconSearch className="h-4" />}
          radius="none"
          variant="underlined"
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={() => {
            setSearchQuery("");
            setPage(1);
          }}
          className="w-full md:w-1/3"
          aria-label="Buscar gastos"
          isClearable={true}
        />
        <Button
          variant="bordered"
          className="rounded-md border-1.5"
          onPress={onFilterModalOpen}
        >
          <IconFilter className="h-4 mr-1" />
          Filtros
        </Button>
      </div>

      {/* Tabla de Gastos */}
      <div className="overflow-x-auto border rounded-md">
        {expensesLoading || categoriesLoading || suppliersLoading ? (
          <div className="flex justify-center items-center p-6">
            <Spinner size="lg">Cargando...</Spinner>
          </div>
        ) : expensesError || categoriesError || suppliersError ? (
          <div className="text-red-500 text-center p-6">
            {expensesError || categoriesError || suppliersError}
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center p-6">No hay gastos para mostrar.</div>
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
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => {
                    if (column.key === "id") {
                      return <TableCell key={column.key}>{item.id}</TableCell>;
                    }
                    if (column.key === "actions") {
                      return <TableCell key={column.key}>{item.actions}</TableCell>;
                    }
                    return (
                      <TableCell
                        key={column.key}
                        className="min-w-[80px] sm:min-w-[100px]"
                      >
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
      {!expensesLoading &&
        !expensesError &&
        expenses.length !== 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
              Mostrando {expenses.length} de {totalCount} gastos
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

      {/* Modal de Filtros */}
      <Modal
        isOpen={isFilterModalOpen}
        onOpenChange={onFilterModalClose}
        aria-labelledby="modal-filters-title"
        placement="center"
        size="lg"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Filtros de Gastos
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col space-y-4">
                  {/* Filtro de Categoría con Autocomplete */}
                  <div>
                    <Autocomplete
                      label="Buscar y seleccionar categoría"
                      placeholder="Escribe para buscar"
                      className="w-full"
                      aria-label="Filtro de Categoría"
                      onClear={() => setTempFilterCategory(null)}
                      onSelectionChange={(value) => setTempFilterCategory(value)}
                      selectedKey={tempFilterCategory}
                      variant="underlined"
                      isClearable
                    >
                      {categories.map((category) => (
                        <AutocompleteItem
                          key={category.id.toString()}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  </div>

                  {/* Filtro de Proveedor con Autocomplete */}
                  <div>
                    <Autocomplete
                      label="Buscar y seleccionar proveedor"
                      placeholder="Escribe para buscar"
                      className="w-full"
                      aria-label="Filtro de Proveedor"
                      onClear={() => setTempFilterSupplier(null)}
                      onSelectionChange={(value) => setTempFilterSupplier(value)}
                      selectedKey={tempFilterSupplier}
                      variant="underlined"
                      isClearable
                    >
                      {suppliers.map((supplier) => (
                        <AutocompleteItem
                          key={supplier.id.toString()}
                          value={supplier.id.toString()}
                        >
                          {supplier.name}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={clearFilters} color="warning">
                  Limpiar Filtros
                </Button>
                <Button onPress={applyFilters} color="primary">
                  Aplicar Filtros
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        aria-labelledby="modal-title"
        placement="top-center"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirmar Eliminación
              </ModalHeader>
              <ModalBody>
                <p>
                  ¿Estás seguro de que deseas eliminar el gasto{" "}
                  <strong>{expenseToDelete?.description}</strong>? Esta acción
                  no se puede deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  disabled={false}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleDeleteExpense}
                  disabled={false}
                  aria-label="Confirmar eliminar gasto"
                >
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
