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
  DatePicker,
  DateRangePicker,
  Accordion,
  AccordionItem
} from "@nextui-org/react";
import {
  IconDownload,
  IconPlus,
  IconSearch,
  IconFilter,
  IconTrash,
  IconChevronUp,
  IconChevronDown,
  IconEdit
} from "@tabler/icons-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import useReturns from "@/app/hooks/useReturns";
import useCustomers from "@/app/hooks/useCustomers";
import useUsers from "@/app/hooks/useUsers";

export default function ReturnsPage() {
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const [filterUser, setFilterUser] = useState(null);
  const [filterCustomer, setFilterCustomer] = useState(null);
  const [filterMinTotal, setFilterMinTotal] = useState("");
  const [filterMaxTotal, setFilterMaxTotal] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState(null);

  const [tempFilterUser, setTempFilterUser] = useState(null);
  const [tempFilterCustomer, setTempFilterCustomer] = useState(null);
  const [tempFilterMinTotal, setTempFilterMinTotal] = useState("");
  const [tempFilterMaxTotal, setTempFilterMaxTotal] = useState("");
  const [tempFilterDate, setTempFilterDate] = useState(null);
  const [tempFilterDateRange, setTempFilterDateRange] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [returnToDelete, setReturnToDelete] = useState(null);
  const [returnToView, setReturnToView] = useState(null);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: null,
    direction: null,
  });

  const { returns, loading: returnsLoading, error: returnsError } = useReturns(
    filterUser,
    filterCustomer,
    filterMinTotal,
    filterMaxTotal,
    filterDate,
    filterDateRange,
  );
  const { customers, loading: customersLoading, error: customersError } = useCustomers();
  const { users, loading: usersLoading, error: usersError } = useUsers();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();
  const {
    isOpen: isFilterModalOpen,
    onOpen: onFilterModalOpen,
    onClose: onFilterModalClose,
  } = useDisclosure();

  const router = useRouter();

  useEffect(() => {
    if (isFilterModalOpen) {
      setTempFilterUser(filterUser);
      setTempFilterCustomer(filterCustomer);
      setTempFilterMinTotal(filterMinTotal);
      setTempFilterMaxTotal(filterMaxTotal);
      setTempFilterDate(filterDate);
      setTempFilterDateRange(filterDateRange);
    }
  }, [
    isFilterModalOpen,
    filterUser,
    filterCustomer,
    filterMinTotal,
    filterMaxTotal,
    filterDate,
    filterDateRange,
  ]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  const handleDeleteClick = useCallback(
    (returnItem) => {
      setReturnToDelete(returnItem);
      onOpen();
    },
    [onOpen]
  );

  const handleDeleteReturn = useCallback(async () => {
    if (!returnToDelete) return;

    setDeleting(true);
    const token = Cookies.get("access_token");
    try {
      await api.delete(`/returns/${returnToDelete.id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setReturns((prevReturns) =>
        prevReturns.filter((r) => r.id !== returnToDelete.id)
      );
      onClose();
    } catch (error) {
      console.error("Error al eliminar la devolución:", error);
      setError("Error al eliminar la devolución.");
    } finally {
      setDeleting(false);
    }
  }, [returnToDelete, onClose]);

  const handleViewClick = useCallback(
    (returnItem) => {
      setReturnToView(returnItem);
      onViewOpen();
    },
    [onViewOpen]
  );

  const columns = [
    { key: "id", label: "#", sortable: true },
    { key: "date", label: "Fecha", sortable: true },
    { key: "user", label: "Usuario", sortable: true },
    { key: "customer", label: "Cliente", sortable: true },
    { key: "total", label: "Total", sortable: true },
    { key: "actions", label: "Acciones", sortable: false },
  ];

  const sortedReturns = useMemo(() => {
    if (!sortDescriptor.column) return [...returns];
    try {
      const sorted = [...returns].sort((a, b) => {
        let aValue, bValue;

        switch (sortDescriptor.column) {
          case "customer":
            aValue = a.customer_details?.name || "";
            bValue = b.customer_details?.name || "";
            break;
          case "total":
            aValue = a.total != null ? parseFloat(a.total) : 0;
            bValue = b.total != null ? parseFloat(b.total) : 0;
            break;
          case "date":
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          default:
            aValue =
              a[sortDescriptor.column] != null ? a[sortDescriptor.column] : "";
            bValue =
              b[sortDescriptor.column] != null ? b[sortDescriptor.column] : "";
        }

        const aType = typeof aValue;
        const bType = typeof bValue;

        if (aType === "string" && bType === "string") {
          return sortDescriptor.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (aType === "number" && bType === "number") {
          return sortDescriptor.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortDescriptor.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }

        const aStr = String(aValue);
        const bStr = String(bValue);
        return sortDescriptor.direction === "ascending"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
      return sorted;
    } catch (error) {
      console.error("Error al ordenar las devoluciones:", error);
      return [...returns];
    }
  }, [returns, sortDescriptor]);

  // Filtrar los returns por searchQuery en el frontend
  const filteredReturns = useMemo(() => {
    if (!searchQuery) return sortedReturns;
    const lowerSearch = searchQuery.toLowerCase();
    return sortedReturns.filter(
      (r) =>
        r.customer_details?.name.toLowerCase().includes(lowerSearch) ||
        String(r.id).includes(lowerSearch)
    );
  }, [sortedReturns, searchQuery]);

  const rows = useMemo(
    () =>
      filteredReturns.map((returnItem) => ({
        id: returnItem.id,
        date: new Date(returnItem.date).toLocaleDateString("es-AR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        user: returnItem.user_details?.first_name + " " + returnItem.user_details?.last_name || "",
        customer: returnItem.customer_details?.name || "",
        total: `${parseFloat(returnItem.total).toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
        })}`,
        actions: (
          <div className="flex gap-1">
            <Tooltip content="Ver Detalles">
              <Button
                variant="light"
                className="rounded-md"
                isIconOnly
                color="primary"
                onPress={() => handleViewClick(returnItem)}
                aria-label={`Ver detalles de la devolución ${returnItem.id}`}
              >
                <IconChevronDown className="h-5" />
              </Button>
            </Tooltip>
            <Tooltip content="Editar">
              <Button
                variant="light"
                className="rounded-md"
                isIconOnly
                color="warning"
                onPress={() => router.push(`/dashboard/returns/edit/${returnItem.id}`)}
                aria-label={`Editar gasto ${returnItem.id}`}
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
                onPress={() => handleDeleteClick(returnItem)}
                aria-label={`Eliminar devolución ${returnItem.id}`}
              >
                <IconTrash className="h-5" />
              </Button>
            </Tooltip>
          </div>
        ),
      })),
    [filteredReturns, handleDeleteClick, handleViewClick, router]
  );

  const totalItems = rows.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [totalPages, page]);

  const currentItems = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return rows.slice(startIdx, endIdx);
  }, [rows, page, rowsPerPage]);

  const currentItemsCount = currentItems.length;

  const handlePageChangeFunc = useCallback((newPage) => {
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
    },
    [sortDescriptor, handleSortChange]
  );

  // Función para aplicar filtros desde el modal
  const applyFilters = () => {
    setFilterUser(tempFilterUser);
    setFilterCustomer(tempFilterCustomer);
    setFilterMinTotal(tempFilterMinTotal);
    setFilterMaxTotal(tempFilterMaxTotal);
    setFilterDate(tempFilterDate);
    setFilterDateRange(tempFilterDateRange);
    setPage(1);
    onFilterModalClose();
  };

  // Función para limpiar filtros temporales en el modal
  const clearFilters = () => {
    setTempFilterUser(null);
    setTempFilterCustomer(null);
    setTempFilterMinTotal("");
    setTempFilterMaxTotal("");
    setTempFilterDate(null);
    setTempFilterDateRange(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Devoluciones</p>
        <div className="flex flex-wrap gap-2">
          <Tooltip content="Exportar devoluciones">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconDownload className="h-4 mr-1" />
              Exportar
            </Button>
          </Tooltip>
          <Tooltip content="Agregar nueva devolución">
            <Link href="/dashboard/returns/create">
              <Button className="rounded-md bg-black text-white">
                <IconPlus className="h-4 mr-1" />
                Nueva Devolución
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        <Input
          placeholder="Buscar devoluciones"
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
          aria-label="Buscar devoluciones"
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

      {/* Tabla de Devoluciones */}
      <div className="overflow-x-auto border rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-6">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-6">{error}</div>
        ) : currentItemsCount === 0 ? (
          <div className="text-center p-6">No hay devoluciones para mostrar.</div>
        ) : (
          <Table
            aria-label="Devoluciones"
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
              {currentItems.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => {
                    if (column.key === "id") {
                      return <TableCell key={column.key}>{item.id}</TableCell>;
                    }
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
      {!loading && !error && currentItemsCount !== 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {currentItemsCount} de {totalItems} devoluciones
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
                Filtros de Devoluciones
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col space-y-4">
                  {/* Filtro de Usuario con Autocomplete */}
                  <div>
                    <Autocomplete
                      label="Buscar y seleccionar usuario"
                      placeholder="Escribe para buscar"
                      className="w-full"
                      aria-label="Filtro de Usuario"
                      onClear={() => setTempFilterUser(null)}
                      onSelectionChange={(value) => setTempFilterUser(value)}
                      selectedKey={tempFilterUser}
                      variant="underlined"
                      isClearable
                    >
                      {users.map((user) => (
                        <AutocompleteItem
                          key={user.id.toString()}
                          value={user.id.toString()}
                        >
                          {user.first_name + " " + user.last_name}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  </div>

                  {/* Filtro de Cliente con Autocomplete */}
                  <div>
                    <Autocomplete
                      label="Buscar y seleccionar cliente"
                      placeholder="Escribe para buscar"
                      className="w-full"
                      aria-label="Filtro de Cliente"
                      onClear={() => setTempFilterCustomer(null)}
                      onSelectionChange={(value) => setTempFilterCustomer(value)}
                      selectedKey={tempFilterCustomer}
                      variant="underlined"
                      isClearable
                    >
                      {customers.map((customer) => (
                        <AutocompleteItem
                          key={customer.id.toString()}
                          value={customer.id.toString()}
                        >
                          {customer.name}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  </div>

                  {/* Filtro de Total Mínimo y Máximo */}
                  <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                    <div className="w-full">
                      <Input
                        label="Total Mínimo"
                        placeholder="Total Mínimo"
                        type="number"
                        value={tempFilterMinTotal}
                        onChange={(e) => setTempFilterMinTotal(e.target.value)}
                        className="w-full"
                        aria-label="Filtro de Total Mínimo"
                        variant="underlined"
                        isClearable
                      />
                    </div>
                    <div className="w-full">
                      <Input
                        label="Total Máximo"
                        placeholder="Total Máximo"
                        type="number"
                        value={tempFilterMaxTotal}
                        onChange={(e) => setTempFilterMaxTotal(e.target.value)}
                        className="w-full"
                        aria-label="Filtro de Total Máximo"
                        variant="underlined"
                        isClearable
                      />
                    </div>
                  </div>

                  {/* Filtro de Fecha Específica */}
                  <div>
                    <DatePicker
                      label="Seleccionar Fecha"
                      value={tempFilterDate}
                      onChange={setTempFilterDate}
                      placeholder="Selecciona una fecha"
                      aria-label="Filtro de Fecha Específica"
                      variant="underlined"
                    />
                  </div>

                  {/* Filtro de Rango de Fechas */}
                  <div>
                    <DateRangePicker
                      label="Seleccionar Rango"
                      value={tempFilterDateRange}
                      onChange={setTempFilterDateRange}
                      placeholder="Selecciona un rango de fechas"
                      aria-label="Filtro de Rango de Fechas"
                      variant="underlined"
                    />
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
                  ¿Estás seguro de que deseas eliminar la devolución{" "}
                  <strong>#{returnToDelete?.id}</strong>? Esta acción no se puede
                  deshacer.
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
                  onPress={handleDeleteReturn}
                  disabled={deleting}
                >
                  {deleting ? <Spinner size="sm" /> : "Eliminar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para Ver Detalles */}
      <Modal
        size="2xl"
        isOpen={isViewOpen}
        onOpenChange={onViewClose}
        aria-labelledby="view-modal-title"
        placement="center"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Detalles de la Devolución #{returnToView?.id}
              </ModalHeader>
              <ModalBody>
                <Accordion>
                  <AccordionItem
                    key="1"
                    aria-label="Detalles Generales"
                    title="Detalles Generales"
                  >
                    <p>
                      <strong>Fecha:</strong>{" "}
                      {new Date(returnToView?.date).toLocaleDateString("es-AR")}
                    </p>
                    <p>
                      <strong>Cliente:</strong>{" "}
                      {returnToView?.customer_details?.name}
                    </p>
                    <p>
                      <strong>Total:</strong>{" "}
                      {`${parseFloat(returnToView?.total).toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      })}`}
                    </p>
                  </AccordionItem>
                  <AccordionItem
                    key="2"
                    aria-label="Items de la Devolución"
                    title="Items de la Devolución"
                  >
                    <div className="overflow-x-auto max-h-60 border rounded-md">
                      {returnToView?.return_details &&
                        returnToView.return_details.length > 0 ? (
                        <Table
                          aria-label="Items de la Devolución"
                          className="border-none min-w-full"
                          shadow="none"
                          isCompact
                          removeWrapper
                        >
                          <TableHeader>
                            <TableColumn className="bg-white text-bold border-b-1">
                              Producto
                            </TableColumn>
                            <TableColumn className="bg-white text-bold border-b-1">
                              Cantidad
                            </TableColumn>
                            <TableColumn className="bg-white text-bold border-b-1">
                              Precio
                            </TableColumn>
                            <TableColumn className="bg-white text-bold border-b-1">
                              Subtotal
                            </TableColumn>
                          </TableHeader>
                          <TableBody>
                            {returnToView.return_details.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.product_details.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>
                                  {`${parseFloat(item.price).toLocaleString(
                                    "es-AR",
                                    {
                                      style: "currency",
                                      currency: "ARS",
                                    }
                                  )}`}
                                </TableCell>
                                <TableCell>
                                  {`${parseFloat(item.subtotal).toLocaleString(
                                    "es-AR",
                                    {
                                      style: "currency",
                                      currency: "ARS",
                                    }
                                  )}`}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p>No hay items para mostrar.</p>
                      )}
                    </div>
                  </AccordionItem>
                </Accordion>
              </ModalBody>
              <ModalFooter>
                <Button onPress={onViewClose} color="primary">
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
