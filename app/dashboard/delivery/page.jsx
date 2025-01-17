"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Pagination,
  Spinner,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Accordion,
  AccordionItem,
  Autocomplete,
  AutocompleteItem,
  DatePicker,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import {
  IconDownload,
  IconFilter,
} from "@tabler/icons-react";
import useCustomers from "@/app/hooks/useCustomers";
import useSales from "@/app/hooks/useSales";
import api from '@/app/axios';
import Cookies from "js-cookie";
import { capitalize } from "@/app/utils";
import { parseDate } from '@internationalized/date';
import { IconDots } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { formatDateForDisplay } from '@/app/utils';

const STATE_CHOICES = {
  creada: "Creada",
  pendiente_entrega: "Pendiente de Entrega",
  entregada: "Entregada",
  cobrada: "Cobrada",
  cancelada: "Cancelada",
};

export default function PendingDeliveriesPage() {
  const router = useRouter();
  const [filterCustomer, setFilterCustomer] = useState(null);
  const [filterDate, setFilterDate] = useState(() => {
    const date = new Date();
    date.setHours(date.getHours() - 3);
    return date.toISOString().split('T')[0];
  });
  const [page, setPage] = useState(1);

  const [saleToView, setSaleToView] = useState(null);
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const { customers, loading: customersLoading, error: customersError } = useCustomers();

  const [tempFilterCustomer, setTempFilterCustomer] = useState(null);
  const [tempFilterDate, setTempFilterDate] = useState(null);

  const { isOpen: isFilterModalOpen, onOpen: onFilterModalOpen, onClose: onFilterModalClose } = useDisclosure();

  const salesFilters = useMemo(() => {
    const filters = {
      needs_delivery: true,
      state: 'pendiente_entrega'
    };

    if (filterDate) {
      filters.date = filterDate;
    }

    if (filterCustomer) {
      filters.customer = filterCustomer;
    }

    return filters;
  }, [filterCustomer, filterDate]);

  const { sales, loading: salesLoading, error: salesError, fetchSales } = useSales(salesFilters);

  const filteredAndSearchedSales = useMemo(() => {
    return sales;
  }, [sales]);

  const rowsPerPage = 10;
  const totalItems = filteredAndSearchedSales.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [totalPages, page]);

  const currentItems = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return filteredAndSearchedSales.slice(startIdx, endIdx);
  }, [filteredAndSearchedSales, page, rowsPerPage]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleViewClick = useCallback((sale) => {
    setSaleToView(sale);
    onViewOpen();
  }, [onViewOpen]);

  const handleAddReturn = useCallback((saleId, customerId) => {
    router.push(`/dashboard/returns/create?sale=${saleId}&customer=${customerId}`);
  }, [router]);

  const handleMarkAsDelivered = useCallback(async (sale) => {
    const token = Cookies.get('access_token');
    try {
      await api.post(
        `/sales/${sale.id}/mark-as-delivered/`,
        null,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      fetchSales(salesFilters);
    } catch (err) {
      console.error(`Error al marcar como entregado la venta ${sale.id}:`, err);
    }
  }, [salesFilters, fetchSales]);

  const handleMarkAsDeliveredAndCollected = useCallback(async (sale) => {
    const token = Cookies.get('access_token');
    try {
      await api.post(
        `/sales/${sale.id}/mark-as-delivered/`,
        null,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      await api.post(
        `/sales/${sale.id}/mark-as-charged/`,
        null,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      fetchSales(salesFilters);
    } catch (err) {
      console.error(`Error al marcar como entregado y cobrado la venta ${sale.id}:`, err);
    }
  }, [salesFilters, fetchSales]);

  const columns = [
    { key: 'id', label: '#', sortable: false },
    { key: 'date', label: 'Fecha', sortable: false },
    { key: 'customer', label: 'Cliente', sortable: false },
    { key: 'total', label: 'Total', sortable: false },
    { key: 'state', label: 'Estado', sortable: false },
    { key: 'actions', label: 'Acciones', sortable: false },
  ];

  const rows = useMemo(() => (
    currentItems.map(sale => ({
      id: sale.id,
      date: formatDateForDisplay(new Date(sale.date), false),
      customer: sale.customer_details?.name || '',
      total: `${parseFloat(sale.total).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`,
      state: STATE_CHOICES[sale.state] || capitalize(sale.state),
      actions: (
        <div className="flex gap-1">
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant='light'>
                <IconDots className='w-5' />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label='Opciones de Venta'>
              <DropdownItem key="view" onPress={() => handleViewClick(sale)}>
                Ver Detalles
              </DropdownItem>
              <DropdownItem key="add-return" onPress={() => handleAddReturn(sale.id, sale.customer_details.id)}>
                Agregar Devolución
              </DropdownItem>
              <DropdownItem key="mark-as-delivered" onPress={() => handleMarkAsDelivered(sale)}>
                Marcar como Entregado
              </DropdownItem>
              <DropdownItem key="mark-as-delivered-and-collected" onPress={() => handleMarkAsDeliveredAndCollected(sale)}>
                Marcar como Entregado y Cobrado
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      )
    }))
  ), [currentItems, handleViewClick, handleAddReturn, handleMarkAsDelivered, handleMarkAsDeliveredAndCollected]);

  const applyFilters = () => {
    setFilterCustomer(tempFilterCustomer);
    setFilterDate(tempFilterDate);
    setPage(1);
    onFilterModalClose();
  };

  const clearFilters = () => {
    setTempFilterCustomer(null);
    setTempFilterDate(null);
  };

  useEffect(() => {
    if (isFilterModalOpen) {
      setTempFilterCustomer(filterCustomer);
      setTempFilterDate(filterDate);
    }
  }, [isFilterModalOpen, filterCustomer, filterDate]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Repartir</p>
        <div className="flex flex-wrap gap-2">
          {/* <Tooltip content="Exportar ventas">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconDownload className="h-4 mr-1" />
              Exportar
            </Button>
          </Tooltip> */}
          {/* Botón para abrir el modal de filtros */}
          <Tooltip content="Filtrar ventas">
            <Button variant="bordered" className="rounded-md border-1.5" onPress={onFilterModalOpen}>
              <IconFilter className="h-4 mr-1" />
              Filtrar
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Tabla de Ventas Pendientes */}
      <div className="overflow-x-auto border rounded-md">
        {(salesLoading || customersLoading) ? (
          <div className="flex justify-center items-center p-6">
            <Spinner size="lg">Cargando...</Spinner>
          </div>
        ) : (salesError || customersError) ? (
          <div className="text-red-500 text-center p-6">
            {salesError || customersError}
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center p-6">
            No hay ventas pendientes de entrega para mostrar.
          </div>
        ) : (
          <Table
            aria-label="Ventas Pendientes de Entrega"
            className="border-none min-w-full"
            shadow="none"
            // isCompact
            removeWrapper
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.key}
                  className="bg-white text-bold border-b-1"
                  isSortable={column.sortable}
                >
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={rows}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>
                      {item[columnKey]}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Paginación */}
      {!salesLoading && !customersLoading && !salesError && !customersError && currentItems.length !== 0 && (
        <div className='flex flex-col sm:flex-row items-center justify-between mt-4'>
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {currentItems.length} de {totalItems} ventas pendientes
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

                  {/* Filtro de Fecha con DatePicker */}
                  <div>
                    <DatePicker
                      label="Seleccionar Fecha"
                      value={tempFilterDate ? parseDate(tempFilterDate) : undefined}
                      onChange={(date) => setTempFilterDate(new Date(date).toISOString().split('T')[0])}
                      placeholder="Selecciona una fecha"
                      aria-label="Filtro de Fecha Específica"
                      variant="underlined"
                      className="w-full"
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

      {/* Modal para Ver Detalles */}
      <Modal size="2xl" isOpen={isViewOpen} onOpenChange={onViewClose} aria-labelledby="view-modal-title" placement="center">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Detalles de la Venta #{saleToView?.id}</ModalHeader>
              <ModalBody>
                <Accordion defaultExpandedKeys={["2"]}>
                  <AccordionItem key="1" aria-label="Detalles Generales" title="Detalles Generales">
                    <p><strong>Fecha:</strong> {new Date(saleToView?.date).toLocaleDateString('es-AR')}</p>
                    <p><strong>Cliente:</strong> {saleToView?.customer_details?.name}</p>
                    <p><strong>Total:</strong> {`${parseFloat(saleToView?.total).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`}</p>
                    <p><strong>Estado:</strong> {STATE_CHOICES[saleToView?.state] || capitalize(saleToView?.state)}</p>
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
