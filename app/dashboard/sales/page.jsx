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
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
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
  IconX,
  IconDots
} from "@tabler/icons-react";
import { useState, useMemo, useCallback } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { capitalize } from "@/app/utils";
import useSales from "@/app/hooks/useSales";
import useCustomers from "@/app/hooks/useCustomers";
import useUsers from "@/app/hooks/useUsers";

const STATE_CHOICES = [
  { id: "creada", name: "Creada" },
  { id: "pendiente_entrega", name: "Pendiente de Entrega" },
  { id: "entregada", name: "Entregada" },
  { id: "cobrada", name: "Cobrada" },
  { id: "cobrada_parcial", name: "Cobrada Parcial" },
  { id: "cancelada", name: "Cancelada" },
  { id: "anulada", name: "Anulada" },
];

const SALE_TYPE_CHOICES = [
  { id: "minorista", name: "Minorista" },
  { id: "mayorista", name: "Mayorista" },
];

const PAYMENT_METHOD_CHOICES = [
  { id: "efectivo", name: "Efectivo" },
  { id: "tarjeta", name: "Tarjeta" },
  { id: "transferencia", name: "Transferencia" },
  { id: "qr", name: "QR" },
  { id: "cuenta_corriente", name: "Cuenta Corriente" },
];

export default function SalesPage() {
  const router = useRouter();

  // Estados Temporales de Filtros
  const [tempFilterState, setTempFilterState] = useState(new Set());
  const [tempFilterSaleType, setTempFilterSaleType] = useState(null);
  const [tempFilterPaymentMethod, setTempFilterPaymentMethod] = useState(null);
  const [tempFilterCustomer, setTempFilterCustomer] = useState(null);
  const [tempFilterUser, setTempFilterUser] = useState(null);
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

  const [saleToCancel, setSaleToCancel] = useState(null);
  const [saleToView, setSaleToView] = useState(null);

  const {
    isOpen: isCancelOpen,
    onOpen: onCancelOpen,
    onClose: onCancelClose,
  } = useDisclosure();
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
  } = useSales(appliedFilters, (page - 1) * rowsPerPage);

  const applyFilters = () => {
    const newFilters = {};

    if (tempFilterState.size > 0) {
      newFilters.state = Array.from(tempFilterState);
    }
    if (tempFilterSaleType) {
      newFilters.sale_type = tempFilterSaleType;
    }
    if (tempFilterPaymentMethod) {
      newFilters.payment_method = tempFilterPaymentMethod;
    }
    if (tempFilterCustomer) {
      newFilters.customer = tempFilterCustomer;
    }
    if (tempFilterUser) {
      newFilters.user = tempFilterUser;
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
      newFilters.end_date = new Date(tempFilterDateRange.end)
        .toISOString()
        .split("T")[0];
    }

    setFilters(newFilters);
    setPage(1);
    onFilterModalClose();
  };

  // Función para limpiar los filtros
  const clearFilters = () => {
    setTempFilterState(new Set());
    setTempFilterSaleType(null);
    setTempFilterPaymentMethod(null);
    setTempFilterCustomer(null);
    setTempFilterUser(null);
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

  const handleCancelClick = useCallback(
    (sale) => {
      setSaleToCancel(sale);
      onCancelOpen();
    },
    [onCancelOpen]
  );

  const handleCancelSale = useCallback(async () => {
    if (!saleToCancel) return;

    const token = Cookies.get("access_token");
    try {
      await api.post(`/sales/${saleToCancel.id}/cancel/`, null, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      fetchSales(filters, (page - 1) * rowsPerPage, rowsPerPage);
      onCancelClose();
    } catch (error) {
      console.error("Error al cancelar la venta:", error);
    }
  }, [saleToCancel, fetchSales, filters, onCancelClose, page, rowsPerPage]);

  const handleViewClick = useCallback(
    (sale) => {
      setSaleToView(sale);
      onViewOpen();
    },
    [onViewOpen]
  );

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

  const rows = useMemo(
    () =>
      sales.map((sale) => {
        const isCancelDisabled = sale.state === "anulada" || sale.state === "cancelada";

        return {
          id: sale.id,
          date: new Date(sale.date).toLocaleString("es-AR", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          customer: sale.customer_details?.name || "",
          seller: sale.user_details?.username || "",
          total: `${parseFloat(sale.total).toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
          })}`,
          total_collected: `${parseFloat(sale.total_collected).toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
          })}`,
          sale_type: SALE_TYPE_CHOICES.find(item => item.id === sale.sale_type)?.name || sale.sale_type,
          payment_method: PAYMENT_METHOD_CHOICES.find(item => item.id === sale.payment_method)?.name || sale.payment_method,
          state:
            STATE_CHOICES.find((item) => item.id === sale.state)?.name ||
            sale.state,
          needs_delivery: sale.needs_delivery ? "Sí" : "No",
          actions: (
            <div className="flex gap-1">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly variant="light">
                    <IconDots className="w-5" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Opciones de Venta" disabledKeys={isCancelDisabled ? ["cancel"] : []}>
                  <DropdownItem key="view" onPress={() => handleViewClick(sale)}>
                    Ver Detalles
                  </DropdownItem>
                  <DropdownItem key="edit" onPress={() => handleEditClick(sale)}>
                    Editar
                  </DropdownItem>
                  <DropdownItem
                    key="cancel"
                    onPress={() => handleCancelClick(sale)}
                    className={isCancelDisabled ? "text-default-400" : "text-danger"}
                  >
                    {(sale.state === "creada" || sale.state === "pendiente_entrega" || sale.state === "entregada") ? "Cancelar" : "Anular"}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          ),
        };
      }),
    [sales, handleViewClick, handleEditClick, handleCancelClick]
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Ventas</p>
        <div className="flex flex-wrap gap-2">
          <Tooltip content="Exportar ventas">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconDownload className="h-4 mr-1" />
              Exportar
            </Button>
          </Tooltip>
          <Tooltip content="Agregar nueva venta únicamente con total">
            <Link href="/dashboard/sales/create-without-details">
              <Button className="rounded-md bg-black text-white">
                <IconPlus className="h-4 mr-1" />
                Nueva Venta sin Detalles
              </Button>
            </Link>
          </Tooltip>
          <Tooltip content="Agregar nueva venta con detalles de venta">
            <Link href="/dashboard/sales/create-with-details">
              <Button className="rounded-md bg-black text-white">
                <IconPlus className="h-4 mr-1" />
                Nueva Venta con Detalles
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row md:justify-end items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        <Tooltip content="Aplicar Filtros">
          <Button
            variant="bordered"
            className="rounded-md border-1.5"
            onPress={onFilterModalOpen}
            aria-label="Abrir Modal de Filtros"
          >
            <IconFilter className="h-4 mr-1" />
            Filtros
          </Button>
        </Tooltip>
      </div>

      {/* Tabla de Ventas */}
      <div className="overflow-x-auto border rounded-md">
        {salesLoading ? (
          <div className="flex justify-center items-center p-6">
            <Spinner size="lg" />
          </div>
        ) : salesError ? (
          <div className="text-red-500 text-center p-6">{salesError}</div>
        ) : rows.length === 0 ? (
          <div className="text-center p-6">No hay ventas para mostrar.</div>
        ) : (
          <Table
            aria-label="Ventas"
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
                      return (
                        <TableCell key={column.key}>{item.actions}</TableCell>
                      );
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
      {!salesLoading && !salesError && rows.length !== 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {sales.length} de {totalCount} ventas
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
                Filtros de Ventas
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col space-y-4">
                  {/* Filtro de Estado con Select Múltiple */}
                  <div>
                    <Select
                      label="Buscar y seleccionar estado"
                      placeholder="Selecciona uno o más estados"
                      className="w-full"
                      aria-label="Filtro de Estado"
                      onClear={() => setTempFilterState(new Set())}
                      onSelectionChange={(value) =>
                        setTempFilterState(value ? new Set(value) : new Set())
                      }
                      selectedKeys={tempFilterState}
                      variant="underlined"
                      selectionMode="multiple"
                    >
                      {STATE_CHOICES.map((state) => (
                        <SelectItem
                          key={state.id}
                          value={state.id}
                        >
                          {state.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Filtro de Tipo de Venta con Select */}
                  <div>
                    <Select
                      label="Buscar y seleccionar tipo de venta"
                      placeholder="Selecciona un tipo de venta"
                      className="w-full"
                      aria-label="Filtro de Tipo de Venta"
                      onClear={() => setTempFilterSaleType(null)}
                      onSelectionChange={(value) =>
                        setTempFilterSaleType(value ? Array.from(value)[0] : null)
                      }
                      selectedKeys={tempFilterSaleType ? new Set([tempFilterSaleType]) : new Set()}
                      variant="underlined"
                    >
                      {SALE_TYPE_CHOICES.map((type) => (
                        <SelectItem
                          key={type.id}
                          value={type.id}
                        >
                          {type.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Filtro de Método de Pago con Select */}
                  <div>
                    <Select
                      label="Buscar y seleccionar método de pago"
                      placeholder="Selecciona un método de pago"
                      className="w-full"
                      aria-label="Filtro de Método de Pago"
                      onClear={() => setTempFilterPaymentMethod(null)}
                      onSelectionChange={(value) =>
                        setTempFilterPaymentMethod(value ? Array.from(value)[0] : null)
                      }
                      selectedKeys={tempFilterPaymentMethod ? new Set([tempFilterPaymentMethod]) : new Set()}
                      variant="underlined"
                    >
                      {PAYMENT_METHOD_CHOICES.map((method) => (
                        <SelectItem
                          key={method.id}
                          value={method.id}
                        >
                          {method.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Filtro de Cliente con Autocomplete */}
                  <div>
                    <Autocomplete
                      label="Buscar y seleccionar cliente"
                      placeholder="Selecciona un cliente"
                      className="w-full"
                      aria-label="Filtro de Cliente"
                      onClear={() => setTempFilterCustomer(null)}
                      onSelectionChange={(value) =>
                        setTempFilterCustomer(value ? value : null)
                      }
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

                  {/* Filtro de Usuario con Autocomplete */}
                  <div>
                    <Autocomplete
                      label="Buscar y seleccionar usuario"
                      placeholder="Selecciona un usuario"
                      className="w-full"
                      aria-label="Filtro de Usuario"
                      onClear={() => setTempFilterUser(null)}
                      onSelectionChange={(value) =>
                        setTempFilterUser(value ? value : null)
                      }
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
                      type="date"
                      hideTimeZone
                      showMonthAndYearPickers
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
                      type="datetime" // Asegúrate de que permite seleccionar fecha y hora
                      hideTimeZone
                      showMonthAndYearPickers
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

      {/* Modal de Confirmación de Cancelación */}
      <Modal
        isOpen={isCancelOpen}
        onOpenChange={onCancelClose}
        aria-labelledby="modal-cancel-title"
        placement="top-center"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirmar Cancelación
              </ModalHeader>
              <ModalBody>
                <p>
                  ¿Estás seguro de que deseas cancelar la venta{" "}
                  <strong>#{saleToCancel?.id}</strong>? Esta acción no se puede
                  deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onCancelClose}
                  disabled={false}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleCancelSale}
                  disabled={false}
                >
                  Confirmar
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
                Detalles de la Venta #{saleToView?.id}
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
                      {new Date(saleToView?.date).toLocaleDateString("es-AR")}
                    </p>
                    <p>
                      <strong>Cliente:</strong>{" "}
                      {saleToView?.customer_details?.name}
                    </p>
                    <p>
                      <strong>Vendedor:</strong>{" "}
                      {saleToView?.user_details?.first_name}{" "}
                      {saleToView?.user_details?.last_name}
                    </p>
                    <p>
                      <strong>Total:</strong>{" "}
                      {`${parseFloat(saleToView?.total).toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      })}`}
                    </p>
                    <p>
                      <strong>Tipo de Venta:</strong>{" "}
                      {capitalize(saleToView?.sale_type)}
                    </p>
                    <p>
                      <strong>Método de Pago:</strong>{" "}
                      {capitalize(saleToView?.payment_method)}
                    </p>
                    <p>
                      <strong>Estado:</strong>{" "}
                      {STATE_CHOICES.find(
                        (item) => item.id === saleToView?.state
                      )?.name || saleToView?.state}
                    </p>
                  </AccordionItem>
                  <AccordionItem
                    key="2"
                    aria-label="Items de la Venta"
                    title="Items de la Venta"
                  >
                    <div className="overflow-x-auto max-h-60 border rounded-md">
                      {saleToView?.sale_details &&
                        saleToView.sale_details.length > 0 ? (
                        <Table
                          aria-label="Items de la Venta"
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
                            {saleToView.sale_details.map((item, index) => (
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
