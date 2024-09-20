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
  Accordion,
  AccordionItem,
} from "@nextui-org/react";
import {
  IconDownload,
  IconPlus,
  IconSearch,
  IconFilter,
  IconX,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { capitalize } from "@/app/utils";

// Definir los estados, tipos de venta y métodos de pago estáticamente
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
  const [sales, setSales] = useState([]);
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [filterState, setFilterState] = useState(null);
  const [filterSaleType, setFilterSaleType] = useState(null);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [saleToView, setSaleToView] = useState(null);
  const [sortDescriptor, setSortDescriptor] = useState({ column: null, direction: null });

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  // Fetch Sales
  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      setError(null);
      const token = Cookies.get("access_token");
      try {
        const response = await api.get("/sales/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setSales(response.data);
      } catch (error) {
        console.error(error);
        setError("Error al cargar las ventas.");
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const handleFilterState = useCallback((key) => {
    if (key === "none-state") {
      setFilterState(null);
    } else {
      setFilterState(key);
    }
    setPage(1);
  }, []);

  const handleFilterSaleType = useCallback((key) => {
    if (key === "none-saleType") {
      setFilterSaleType(null);
    } else {
      setFilterSaleType(key);
    }
    setPage(1);
  }, []);

  const handleFilterPaymentMethod = useCallback((key) => {
    if (key === "none-payment") {
      setFilterPaymentMethod(null);
    } else {
      setFilterPaymentMethod(key);
    }
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  const handleDeleteClick = useCallback((sale) => {
    setSaleToDelete(sale);
    onOpen();
  }, [onOpen]);

  const handleDeleteSale = useCallback(async () => {
    if (!saleToDelete) return;

    setDeleting(true);
    const token = Cookies.get("access_token");
    try {
      await api.delete(`/sales/${saleToDelete.id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setSales((prevSales) => prevSales.filter(s => s.id !== saleToDelete.id));
      onClose();
    } catch (error) {
      console.error("Error al eliminar la venta:", error);
      setError("Error al eliminar la venta.");
    } finally {
      setDeleting(false);
    }
  }, [saleToDelete, onClose]);

  const handleViewClick = useCallback((sale) => {
    setSaleToView(sale);
    onViewOpen();
  }, [onViewOpen]);

  const columns = [
    { key: 'id', label: '#', sortable: true },
    { key: 'date', label: 'Fecha', sortable: true },
    { key: 'customer', label: 'Cliente', sortable: true },
    { key: 'seller', label: 'Vendedor', sortable: true },
    { key: 'total', label: 'Total', sortable: true },
    { key: 'sale_type', label: 'Tipo de Venta', sortable: true },
    { key: 'payment_method', label: 'Método de Pago', sortable: true },
    { key: 'state', label: 'Estado', sortable: true },
    { key: 'actions', label: 'Acciones', sortable: false },
  ];

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

  const filteredSales = useMemo(() => {
    let filtered = [...sortedSales];

    if (filterState) {
      filtered = filtered.filter(sale => sale.state === filterState);
    }

    if (filterSaleType) {
      filtered = filtered.filter(sale => sale.sale_type === filterSaleType);
    }

    if (filterPaymentMethod) {
      filtered = filtered.filter(sale => sale.payment_method === filterPaymentMethod);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(sale =>
        sale.id.toString().includes(query) ||
        (sale.customer_details?.name && sale.customer_details.name.toLowerCase().includes(query)) ||
        (sale.user_details?.username && sale.user_details.username.toLowerCase().includes(query)) ||
        (sale.payment_method && sale.payment_method.toLowerCase().includes(query))
      );
    }


    return filtered;
  }, [sortedSales, filterState, filterSaleType, filterPaymentMethod, searchQuery]);

  const rows = useMemo(() => (
    filteredSales.map(sale => ({
      id: sale.id,
      date: new Date(sale.date).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      customer: sale.customer_details?.name || '',
      seller: sale.user_details?.username || '',
      total: `${parseFloat(sale.total).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`,
      sale_type: sale.sale_type.charAt(0).toUpperCase() + sale.sale_type.slice(1),
      payment_method: sale.payment_method.charAt(0).toUpperCase() + sale.payment_method.slice(1),
      state: STATE_CHOICES.find(item => item.id === sale.state)?.name || sale.state,
      actions: (
        <div className="flex space-x-2">
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
          <Tooltip content="Eliminar">
            <Button
              variant="light"
              className="rounded-md"
              isIconOnly
              color="danger"
              onPress={() => handleDeleteClick(sale)}
              aria-label={`Eliminar venta ${sale.id}`}
            >
              <IconX className="h-5" />
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
        <div className="flex flex-wrap gap-4">
          {/* Filtro de Estado */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                className={`rounded-md border-1.5 ${filterState ? 'bg-gray-200' : ''}`}
                aria-label="Filtros de Estado"
              >
                <IconFilter className="h-4 mr-1" />
                {filterState
                  ? `${STATE_CHOICES.find(item => item.id === filterState)?.name || "Estado"}`
                  : "Estado"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Filtros de Estado" onAction={handleFilterState}>
              <DropdownSection className="max-h-60 overflow-y-auto">
                {STATE_CHOICES.map(item => (
                  <DropdownItem key={item.id} value={item.id}>
                    {item.name}
                  </DropdownItem>
                ))}
              </DropdownSection>
              <DropdownItem key="none-state" value="none" className="border-t-1 rounded-t-none">
                Quitar Filtro de Estado
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* Filtro de Tipo de Venta */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                className={`rounded-md border-1.5 ${filterSaleType ? 'bg-gray-200' : ''}`}
                aria-label="Filtros de Tipo de Venta"
              >
                <IconFilter className="h-4 mr-1" />
                {filterSaleType
                  ? `${SALE_TYPE_CHOICES.find(item => item.id === filterSaleType)?.name || "Tipo"}`
                  : "Tipo de Venta"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Filtros de Tipo de Venta" onAction={handleFilterSaleType}>
              <DropdownSection className="max-h-60 overflow-y-auto">
                {SALE_TYPE_CHOICES.map(item => (
                  <DropdownItem key={item.id} value={item.id}>
                    {item.name}
                  </DropdownItem>
                ))}
              </DropdownSection>
              <DropdownItem key="none-saleType" value="none" className="border-t-1 rounded-t-none">
                Quitar Filtro de Tipo de Venta
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* Filtro de Método de Pago */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                className={`rounded-md border-1.5 ${filterPaymentMethod ? 'bg-gray-200' : ''}`}
                aria-label="Filtros de Método de Pago"
              >
                <IconFilter className="h-4 mr-1" />
                {filterPaymentMethod
                  ? `${PAYMENT_METHOD_CHOICES.find(item => item.id === filterPaymentMethod)?.name || "Método"}`
                  : "Método de Pago"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Filtros de Método de Pago" onAction={handleFilterPaymentMethod}>
              <DropdownSection className="max-h-60 overflow-y-auto">
                {PAYMENT_METHOD_CHOICES.map(item => (
                  <DropdownItem key={item.id} value={item.id}>
                    {item.name}
                  </DropdownItem>
                ))}
              </DropdownSection>
              <DropdownItem key="none-payment" value="none" className="border-t-1 rounded-t-none">
                Quitar Filtro de Método de Pago
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

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
            <TableBody items={currentItems}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => {
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

      {!loading && !error && currentItemsCount !== 0 && (
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
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleDeleteSale}
                  disabled={deleting}
                >
                  {deleting ? <Spinner size="sm" /> : "Eliminar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Nuevo Modal para Ver Detalles */}
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
                    <div className="overflow-x-auto max-h-60">
                      {saleToView?.sale_details && saleToView.sale_details.length > 0 ? (
                        <Table
                          aria-label="Items de la Venta"
                          className="border-none min-w-full"
                          shadow="none"
                          isCompact
                          removeWrapper
                        >
                          <TableHeader>
                            <TableColumn>Producto</TableColumn>
                            <TableColumn>Cantidad</TableColumn>
                            <TableColumn>Precio</TableColumn>
                            <TableColumn>Subtotal</TableColumn>
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
                  {/* Puedes agregar más AccordionItems si necesitas más secciones */}
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
