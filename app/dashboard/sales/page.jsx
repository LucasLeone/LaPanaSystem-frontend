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
  SelectItem
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
import { capitalize } from "@/app/utils";
import useSales from "@/app/hooks/useSales";

// Definir las opciones estáticas para filtros
const STATE_CHOICES = [
  { id: "creada", name: "Creada" },
  { id: "pendiente_entrega", name: "Pendiente de Entrega" },
  { id: "entregada", name: "Entregada" },
  { id: "cobrada", name: "Cobrada" },
  { id: "cancelada", name: "Cancelada" },
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

  // Estados para los filtros temporales en el modal
  const [tempFilterState, setTempFilterState] = useState(null);
  const [tempFilterSaleType, setTempFilterSaleType] = useState(null);
  const [tempFilterPaymentMethod, setTempFilterPaymentMethod] = useState(null);
  const [tempFilterCustomer, setTempFilterCustomer] = useState(null);
  const [tempFilterMinTotal, setTempFilterMinTotal] = useState("");
  const [tempFilterMaxTotal, setTempFilterMaxTotal] = useState("");
  const [tempFilterDate, setTempFilterDate] = useState(null);
  const [tempFilterDateRange, setTempFilterDateRange] = useState(null);

  // Estados para los filtros aplicados
  const [filters, setFilters] = useState({});

  const { sales, loading: salesLoading, error: salesError } = useSales(filters);

  const rowsPerPage = 10;
  const [page, setPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");

  const [saleToDelete, setSaleToDelete] = useState(null);
  const [saleToView, setSaleToView] = useState(null);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: null,
    direction: null,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isFilterModalOpen, onOpen: onFilterModalOpen, onClose: onFilterModalClose } = useDisclosure();

  // Fetch Customers for the Autocomplete in Filters Modal
  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    const fetchCustomers = async () => {
      const token = Cookies.get("access_token");
      try {
        const response = await api.get("/customers/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setCustomers(response.data);
      } catch (error) {
        console.error("Error al cargar los clientes:", error);
      }
    };
    fetchCustomers();
  }, []);

  // Fetch Users for the Autocomplete in Filters Modal (si es necesario)
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      const token = Cookies.get("access_token");
      try {
        const response = await api.get("/users/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error al cargar los usuarios:", error);
      }
    };
    fetchUsers();
  }, []);

  // Aplicar filtros desde el modal
  const applyFilters = () => {
    const newFilters = {};

    if (tempFilterState) {
      newFilters.state = tempFilterState;
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
    if (tempFilterMinTotal !== "") {
      newFilters.min_total = tempFilterMinTotal;
    }
    if (tempFilterMaxTotal !== "") {
      newFilters.max_total = tempFilterMaxTotal;
    }
    if (tempFilterDate) {
      newFilters.date = tempFilterDate;
    }
    if (tempFilterDateRange) {
      newFilters.start_date = tempFilterDateRange.start;
      newFilters.end_date = tempFilterDateRange.end;
    }

    setFilters(newFilters);
    setPage(1);
    onFilterModalClose();
  };

  // Limpiar filtros temporales en el modal
  const clearFilters = () => {
    setTempFilterState(null);
    setTempFilterSaleType(null);
    setTempFilterPaymentMethod(null);
    setTempFilterCustomer(null);
    setTempFilterMinTotal("");
    setTempFilterMaxTotal("");
    setTempFilterDate(null);
    setTempFilterDateRange(null);
  };

  // Manejar cambios en la búsqueda
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  // Manejar eliminación de una venta
  const handleDeleteClick = useCallback((sale) => {
    setSaleToDelete(sale);
    onOpen();
  }, [onOpen]);

  const handleDeleteSale = useCallback(async () => {
    if (!saleToDelete) return;

    const token = Cookies.get("access_token");
    try {
      await api.delete(`/sales/${saleToDelete.id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      // Refrescar los datos llamando a fetchSales si está disponible
      // Si usas el hook, normalmente se re-fetch automáticamente al cambiar los filtros
      onClose();
    } catch (error) {
      console.error("Error al eliminar la venta:", error);
      // Puedes manejar el error aquí
    }
  }, [saleToDelete, onClose]);

  // Manejar ver detalles de una venta
  const handleViewClick = useCallback((sale) => {
    setSaleToView(sale);
    onViewOpen();
  }, [onViewOpen]);

  // Definir las columnas de la tabla
  const columns = [
    { key: 'id', label: '#', sortable: true },
    { key: 'date', label: 'Fecha', sortable: true },
    { key: 'customer', label: 'Cliente', sortable: true },
    { key: 'seller', label: 'Vendedor', sortable: true },
    { key: 'total', label: 'Total', sortable: true },
    { key: 'sale_type', label: 'Tipo de Venta', sortable: true },
    { key: 'payment_method', label: 'Método de Pago', sortable: true },
    { key: 'state', label: 'Estado', sortable: true },
    { key: 'needs_delivery', label: 'Delivery', sortable: false },
    { key: 'actions', label: 'Acciones', sortable: false },
  ];

  // Ordenar las ventas
  const sortedSales = useMemo(() => {
    if (!sortDescriptor.column) return [...sales];
    try {
      const sorted = [...sales].sort((a, b) => {
        let aValue, bValue;

        switch (sortDescriptor.column) {
          case 'customer':
            aValue = a.customer_details?.name || '';
            bValue = b.customer_details?.name || '';
            break;
          case 'seller':
            aValue = a.user_details?.username || '';
            bValue = b.user_details?.username || '';
            break;
          case 'total':
            aValue = a.total != null ? parseFloat(a.total) : 0;
            bValue = b.total != null ? parseFloat(b.total) : 0;
            break;
          case 'date':
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          default:
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
    } catch (error) {
      console.error("Error al ordenar las ventas:", error);
      return [...sales];
    }
  }, [sales, sortDescriptor]);

  // Filtrar las ventas por la búsqueda
  const filteredSales = useMemo(() => {
    if (!searchQuery) return sortedSales;
    const lowerSearch = searchQuery.toLowerCase();
    return sortedSales.filter(
      (s) =>
        s.customer_details?.name.toLowerCase().includes(lowerSearch) ||
        String(s.id).includes(lowerSearch) ||
        s.user_details?.username.toLowerCase().includes(lowerSearch) ||
        s.payment_method.toLowerCase().includes(lowerSearch)
    );
  }, [sortedSales, searchQuery]);

  // Crear las filas para la tabla
  const rows = useMemo(() => (
    filteredSales.map(sale => ({
      id: sale.id,
      date: new Date(sale.date).toLocaleString('es-AR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      customer: sale.customer_details?.name || '',
      seller: sale.user_details?.username || '',
      total: `${parseFloat(sale.total).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`,
      sale_type: capitalize(sale.sale_type),
      payment_method: capitalize(sale.payment_method),
      state: STATE_CHOICES.find(item => item.id === sale.state)?.name || sale.state,
      needs_delivery: sale.needs_delivery ? 'Sí' : 'No',
      actions: (
        <div className="flex gap-1">
          <Tooltip content="Ver Detalles">
            <Button
              variant="light"
              className="rounded-md"
              isIconOnly
              color="primary"
              onPress={() => handleViewClick(sale)}
              aria-label={`Ver detalles de la venta ${sale.id}`}
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
              onPress={() => handleEditClick(sale)}
              aria-label={`Editar venta ${sale.id}`}
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
              onPress={() => handleDeleteClick(sale)}
              aria-label={`Eliminar venta ${sale.id}`}
            >
              <IconTrash className="h-5" />
            </Button>
          </Tooltip>
        </div>
      )
    }))
  ), [filteredSales, handleDeleteClick, handleViewClick]);

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

  // Manejar edición de una venta
  const handleEditClick = useCallback((sale) => {
    if (sale.sale_details && Array.isArray(sale.sale_details) && sale.sale_details.length > 0) {
      router.push(`/dashboard/sales/edit-with-details/${sale.id}`);
    } else {
      router.push(`/dashboard/sales/edit-without-details/${sale.id}`);
    }
  }, [router]);

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
          <Tooltip content="Agregar nueva venta unicamente con total">
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

      {/* Búsqueda */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        <Input
          placeholder="Buscar ventas"
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
          aria-label="Buscar ventas"
          isClearable={true}
        />
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
          <div className="text-red-500 text-center p-6">
            {salesError}
          </div>
        ) : currentItemsCount === 0 ? (
          <div className="text-center p-6">
            No hay ventas para mostrar.
          </div>
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
      {!salesLoading && !salesError && currentItemsCount !== 0 && (
        <div className='flex flex-col sm:flex-row items-center justify-between mt-4'>
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {currentItemsCount} de {totalItems} ventas
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
                  {/* Filtro de Estado */}
                  <div>
                    <Select
                      label="Buscar y seleccionar estado"
                      placeholder="Selecciona un estado"
                      className="w-full"
                      aria-label="Filtro de Estado"
                      onClear={() => setTempFilterState(null)}
                      onSelectionChange={(value) => setTempFilterState(value)}
                      selectedKey={tempFilterState}
                      variant="underlined"
                      isClearable
                    >
                      {STATE_CHOICES.map((state) => (
                        <SelectItem
                          key={state.id.toString()}
                          value={state.id.toString()}
                        >
                          {state.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Filtro de Tipo de Venta */}
                  <div>
                    <Select
                      label="Buscar y seleccionar tipo de venta"
                      placeholder="Selecciona un tipo de venta"
                      className="w-full"
                      aria-label="Filtro de Tipo de Venta"
                      onClear={() => setTempFilterSaleType(null)}
                      onSelectionChange={(value) => setTempFilterSaleType(value)}
                      selectedKey={tempFilterSaleType}
                      variant="underlined"
                      isClearable
                    >
                      {SALE_TYPE_CHOICES.map((type) => (
                        <SelectItem
                          key={type.id.toString()}
                          value={type.id.toString()}
                        >
                          {type.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Filtro de Método de Pago */}
                  <div>
                    <Select
                      label="Buscar y seleccionar método de pago"
                      placeholder="Selecciona un método de pago"
                      className="w-full"
                      aria-label="Filtro de Método de Pago"
                      onClear={() => setTempFilterPaymentMethod(null)}
                      onSelectionChange={(value) => setTempFilterPaymentMethod(value)}
                      selectedKey={tempFilterPaymentMethod}
                      variant="underlined"
                      isClearable
                    >
                      {PAYMENT_METHOD_CHOICES.map((method) => (
                        <SelectItem
                          key={method.id.toString()}
                          value={method.id.toString()}
                        >
                          {method.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Filtro de Cliente */}
                  <div>
                    <Autocomplete
                      label="Buscar y seleccionar cliente"
                      placeholder="Selecciona un cliente"
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
                            <span className="text-default-400 text-small">$</span>
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
                            <span className="text-default-400 text-small">$</span>
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
      <Modal isOpen={isOpen} onOpenChange={onClose} aria-labelledby="modal-title" placement="top-center">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Confirmar Eliminación</ModalHeader>
              <ModalBody>
                <p>
                  ¿Estás seguro de que deseas eliminar la venta <strong>#{saleToDelete?.id}</strong>?
                  Esta acción no se puede deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  disabled={false} // Puedes manejar el estado de deshabilitado si es necesario
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleDeleteSale}
                  disabled={false} // Puedes manejar el estado de deshabilitado si es necesario
                >
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para Ver Detalles */}
      <Modal size="2xl" isOpen={isViewOpen} onOpenChange={onViewClose} aria-labelledby="view-modal-title" placement="center">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Detalles de la Venta #{saleToView?.id}</ModalHeader>
              <ModalBody>
                <Accordion>
                  <AccordionItem key="1" aria-label="Detalles Generales" title="Detalles Generales">
                    <p><strong>Fecha:</strong> {new Date(saleToView?.date).toLocaleDateString('es-AR')}</p>
                    <p><strong>Cliente:</strong> {saleToView?.customer_details?.name}</p>
                    <p><strong>Vendedor:</strong> {saleToView?.user_details?.first_name} {saleToView?.user_details?.last_name}</p>
                    <p><strong>Total:</strong> {`${parseFloat(saleToView?.total).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`}</p>
                    <p><strong>Tipo de Venta:</strong> {capitalize(saleToView?.sale_type)}</p>
                    <p><strong>Método de Pago:</strong> {capitalize(saleToView?.payment_method)}</p>
                    <p><strong>Estado:</strong> {STATE_CHOICES.find(item => item.id === saleToView?.state)?.name || saleToView?.state}</p>
                  </AccordionItem>
                  <AccordionItem key="2" aria-label="Items de la Venta" title="Items de la Venta">
                    <div className="overflow-x-auto max-h-60 border rounded-md">
                      {saleToView?.sale_details && saleToView.sale_details.length > 0 ? (
                        <Table
                          aria-label="Items de la Venta"
                          className="border-none min-w-full"
                          shadow="none"
                          isCompact
                          removeWrapper
                        >
                          <TableHeader>
                            <TableColumn className="bg-white text-bold border-b-1">Producto</TableColumn>
                            <TableColumn className="bg-white text-bold border-b-1">Cantidad</TableColumn>
                            <TableColumn className="bg-white text-bold border-b-1">Precio</TableColumn>
                            <TableColumn className="bg-white text-bold border-b-1">Subtotal</TableColumn>
                          </TableHeader>
                          <TableBody>
                            {saleToView.sale_details.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.product_details.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{`${parseFloat(item.price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`}</TableCell>
                                <TableCell>{`${parseFloat(item.subtotal).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`}</TableCell>
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
