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
  AccordionItem,
} from "@nextui-org/react";
import {
  IconDownload,
  IconPlus,
  IconFilter,
  IconTrash,
  IconChevronUp,
  IconChevronDown,
  IconEdit,
} from "@tabler/icons-react";
import { useState, useMemo, useCallback } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import useReturns from "@/app/hooks/useReturns";
import useCustomers from "@/app/hooks/useCustomers";
import useUsers from "@/app/hooks/useUsers";
import { formatDateForDisplay } from "@/app/utils";
import { parseDateTime } from "@internationalized/date";

export default function ReturnsPage() {
  const router = useRouter();

  const [tempFilterUser, setTempFilterUser] = useState(null);
  const [tempFilterCustomer, setTempFilterCustomer] = useState(null);
  const [tempFilterMinTotal, setTempFilterMinTotal] = useState("");
  const [tempFilterMaxTotal, setTempFilterMaxTotal] = useState("");
  const [tempFilterDate, setTempFilterDate] = useState(null);
  const [tempFilterDateRange, setTempFilterDateRange] = useState(null);

  const [filters, setFilters] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState({
    column: null,
    direction: null,
  });

  const rowsPerPage = 10;
  const [page, setPage] = useState(1);

  const [returnToDelete, setReturnToDelete] = useState(null);
  const [returnToView, setReturnToView] = useState(null);

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

  const { customers, loading: customersLoading, error: customersError } = useCustomers();
  const { users, loading: usersLoading, error: usersError } = useUsers();

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
        user: "user__username",
        total: "total",
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

  // Uso del hook useReturns con los filtros aplicados y la paginación
  const {
    returns,
    totalCount,
    loading: returnsLoading,
    error: returnsError,
    fetchReturns,
  } = useReturns(appliedFilters, (page - 1) * rowsPerPage, rowsPerPage);

  // Función para aplicar los filtros
  const applyFilters = () => {
    const newFilters = {};

    if (tempFilterUser) {
      newFilters.user = tempFilterUser;
    }
    if (tempFilterCustomer) {
      newFilters.customer = tempFilterCustomer;
    }
    if (tempFilterMinTotal !== "") {
      newFilters.min_total = tempFilterMinTotal;
    }
    if (tempFilterMaxTotal !== "") {
      newFilters.max_total = tempFilterMaxTotal;
    }
    if (tempFilterDate) {
      newFilters.date = new Date(tempFilterDate).toISOString().split("T")[0];
    }
    if (tempFilterDateRange) {
      newFilters.start_date = new Date(tempFilterDateRange.start)
        .toISOString()
        .split("T")[0];
      newFilters.end_date = new Date(tempFilterDateRange.end).toISOString().split("T")[0];
    }

    setFilters(newFilters);
    setPage(1);
    onFilterModalClose();
  };

  const clearFilters = () => {
    setTempFilterUser(null);
    setTempFilterCustomer(null);
    setTempFilterMinTotal("");
    setTempFilterMaxTotal("");
    setTempFilterDate(null);
    setTempFilterDateRange(null);
    setSearchQuery("");
    setSortDescriptor({
      column: null,
      direction: null,
    });
    setFilters({});
  };

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

    const token = Cookies.get("access_token");
    try {
      await api.delete(`/returns/${returnToDelete.id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      fetchReturns(appliedFilters, (page - 1) * rowsPerPage, rowsPerPage);
      onClose();
    } catch (error) {
      console.error("Error al eliminar la devolución:", error);
      // Puedes manejar el error de manera más específica aquí
    }
  }, [returnToDelete, fetchReturns, appliedFilters, onClose, page, rowsPerPage]);

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
    { key: "sale", label: "Venta", sortable: false },
    { key: "total", label: "Total", sortable: true },
    { key: "actions", label: "Acciones", sortable: false },
  ];

  const rows = useMemo(
    () =>
      returns.map((returnItem) => ({
        id: returnItem.id,
        date: new Date(returnItem.date).toLocaleDateString("es-AR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        user:
          returnItem.user_details?.first_name +
          " " +
          returnItem.user_details?.last_name ||
          "",
        customer: returnItem.sale_details.customer_details?.name || "",
        sale: "#" + returnItem.sale_details.id + " - " + new Date(returnItem.sale_details.date).toLocaleDateString("es-AR", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
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
                onPress={() =>
                  router.push(`/dashboard/returns/edit/${returnItem.id}`)
                }
                aria-label={`Editar devolución ${returnItem.id}`}
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
    [returns, handleDeleteClick, handleViewClick, router]
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
          className={`flex items-center ${
            isSortable ? "cursor-pointer" : ""
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
      <div className="flex flex-col md:flex-row md:justify-end items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        {/* <Input
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
          isDisabled
        /> */}
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
        {returnsLoading ? (
          <div className="flex justify-center items-center p-6">
            <Spinner size="lg">Cargando...</Spinner>
          </div>
        ) : returnsError ? (
          <div className="text-red-500 text-center p-6">{returnsError}</div>
        ) : rows.length === 0 ? (
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
      {!returnsLoading && !returnsError && rows.length !== 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {returns.length} de {totalCount} devoluciones
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
                        startContent={
                          <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">
                              $
                            </span>
                          </div>
                        }
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
                        startContent={
                          <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">
                              $
                            </span>
                          </div>
                        }
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
                      label="Seleccionar Rango de Fechas"
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
                  disabled={false}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleDeleteReturn}
                  disabled={false}
                >
                  Eliminar
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
                <Accordion defaultExpandedKeys={["2"]}>
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
                      {`${parseFloat(returnToView?.total).toLocaleString(
                        "es-AR",
                        {
                          style: "currency",
                          currency: "ARS",
                        }
                      )}`}
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
                                <TableCell>
                                  {item.product_details.name}
                                </TableCell>
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
