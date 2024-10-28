"use client";

import React, { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Tooltip,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Accordion,
  AccordionItem,
  Input,
  ScrollShadow,
} from "@nextui-org/react";
import {
  IconDownload,
  IconFilter,
  IconDots,
} from "@tabler/icons-react";
import useSalesForCollect from '@/app/hooks/useSalesForCollect';
import { useRouter } from "next/navigation";
import api from "@/app/axios";
import Cookies from 'js-cookie';
import { capitalize } from '@/app/utils';

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

function getChoiceName(choices, id) {
  const choice = choices.find(item => item.id === id);
  return choice ? choice.name : capitalize(id);
}

export default function CollectPage() {
  const router = useRouter();

  const { salesForCollect, totalCount, loading, error, fetchSalesForCollect } = useSalesForCollect();

  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Estados para manejar los montos parciales y errores
  const [partialAmounts, setPartialAmounts] = useState({});
  const [partialErrors, setPartialErrors] = useState({});

  // Estado para manejar la carga al cobrar todas las ventas
  const [isCollectingAll, setIsCollectingAll] = useState(false);

  // Estados para el modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [customerToCollect, setCustomerToCollect] = useState(null);

  const handleViewDetails = useCallback((customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setSelectedCustomer(null);
    setIsDetailsModalOpen(false);
    // Limpiar los montos parciales y errores al cerrar el modal
    setPartialAmounts({});
    setPartialErrors({});
  }, []);

  const handlePartialCollect = useCallback(async (saleId, saleTotal) => {
    const amount = parseFloat(partialAmounts[saleId]);

    if (isNaN(amount) || amount <= 0) {
      setPartialErrors(prev => ({
        ...prev,
        [saleId]: 'Por favor, ingrese un monto válido.',
      }));
      return;
    }

    if (amount > parseFloat(saleTotal)) {
      setPartialErrors(prev => ({
        ...prev,
        [saleId]: 'El monto no puede exceder el total de la venta.',
      }));
      return;
    }

    const token = Cookies.get("access_token");
    try {
      await api.post(
        `/sales/${saleId}/mark-as-partial-charged/`,
        { total: amount },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      fetchSalesForCollect({}, (page - 1) * rowsPerPage);
      console.log(`Venta #${saleId} marcada como parcialmente cobrada.`);
      // Limpiar el monto y el error después de una recolección exitosa
      setPartialAmounts(prev => ({
        ...prev,
        [saleId]: '',
      }));
      setPartialErrors(prev => ({
        ...prev,
        [saleId]: '',
      }));
      // Aquí podrías agregar una actualización del estado o algún feedback visual
    } catch (error) {
      console.error(`Error al marcar la venta #${saleId} como parcialmente cobrada:`, error);
      setPartialErrors(prev => ({
        ...prev,
        [saleId]: 'Error al cobrar parcialmente la venta.',
      }));
      // Aquí podrías agregar una actualización del estado o algún feedback visual
    }
  }, [fetchSalesForCollect, page, rowsPerPage, partialAmounts]);

  const handleCollect = useCallback(async (saleId) => {
    const token = Cookies.get("access_token");

    try {
      await api.post(
        `/sales/${saleId}/mark-as-charged/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      fetchSalesForCollect({}, (page - 1) * rowsPerPage);
      console.log(`Venta #${saleId} marcada como totalmente cobrada.`);

      if (selectedCustomer) {
        const remainingSales = selectedCustomer.sales_to_collect.filter(sale => sale.id !== saleId);

        if (remainingSales.length === 0) {
          // Si no quedan ventas pendientes, cerrar el modal
          setIsDetailsModalOpen(false);
          setSelectedCustomer(null);
        } else {
          // Si quedan ventas, actualizar el estado de selectedCustomer
          setSelectedCustomer(prev => ({
            ...prev,
            sales_to_collect: remainingSales,
          }));
        }
      }
      // Aquí podrías agregar una actualización del estado o algún feedback visual
    } catch (error) {
      console.error(`Error al marcar la venta #${saleId} como cobrada:`, error);
      // Manejar errores aquí, por ejemplo, mostrar una notificación
    }
  }, [fetchSalesForCollect, page, rowsPerPage, selectedCustomer]);

  // Función para abrir el modal de confirmación
  const handleCollectAllSales = useCallback((customer) => {
    setCustomerToCollect(customer);
    setIsConfirmModalOpen(true);
  }, []);

  const handleAddReturn = useCallback((saleId, customerId) => {
    router.push(`/dashboard/returns/create?sale=${saleId}&customer=${customerId}`);
  }, [router]);

  // Función para manejar la confirmación y realizar la cobranza masiva
  const handleConfirmCollectAllSales = useCallback(async (customer) => {
    const token = Cookies.get("access_token");

    try {
      setIsCollectingAll(true);

      for (const sale of customer.sales_to_collect) {
        try {
          await api.post(
            `/sales/${sale.id}/mark-as-charged/`,
            {},
            {
              headers: {
                Authorization: `Token ${token}`,
              },
            }
          );
          console.log(`Venta #${sale.id} marcada como cobrada.`);
        } catch (error) {
          console.error(`Error al marcar la venta #${sale.id} como cobrada:`, error);
          // Opcional: Puedes decidir continuar o detener el proceso
        }
      }

      // Refrescar la lista de ventas para cobrar
      fetchSalesForCollect({}, (page - 1) * rowsPerPage);
      // Cerrar el modal de confirmación
      setIsConfirmModalOpen(false);
      // Limpiar el cliente seleccionado
      setCustomerToCollect(null);
    } catch (error) {
      console.error("Error al cobrar todas las ventas:", error);
      // Manejar errores generales aquí, por ejemplo, mostrar una notificación de error
    } finally {
      setIsCollectingAll(false);
    }
  }, [fetchSalesForCollect, page, rowsPerPage]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    fetchSalesForCollect({}, (newPage - 1) * rowsPerPage);
  }, [fetchSalesForCollect, rowsPerPage]);

  const columns = [
    { key: "customer", name: "Cliente" },
    { key: "total_sales", name: "Total de Ventas" },
    { key: "total_returns", name: "Total de Devoluciones" },
    { key: "total_collected", name: "Total Cobrado" },
    { key: "total_to_collect", name: "Total a Cobrar" },
    { key: "sales_quantity", name: "Cantidad de Ventas" },
    { key: "actions", name: "Acciones" },
  ];

  const rows = useMemo(() => {
    if (!salesForCollect || !Array.isArray(salesForCollect)) return [];

    return salesForCollect.map((customer, index) => {
      return {
        id: customer.id || index,
        customer: customer.name,
        total_sales: parseFloat(customer.total_sales).toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
        }),
        total_returns: parseFloat(customer.total_discounted).toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
        }),
        total_collected: parseFloat(customer.total_collected).toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
        }),
        total_to_collect: parseFloat(customer.total_to_collect).toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
        }),
        sales_quantity: customer.sales_to_collect.length,
        actions: (
          <div className="flex gap-1">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant="light" disabled={isCollectingAll}>
                  <IconDots className="w-5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Opciones de Cobranza">
                <DropdownItem key="view" onPress={() => handleViewDetails(customer)}>
                  Ver Detalles
                </DropdownItem>
                <DropdownItem
                  key="collect"
                  onPress={() => { handleCollectAllSales(customer) }}
                  disabled={isCollectingAll}
                >
                  Cobrar Totalmente
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        ),
      };
    });
  }, [salesForCollect, handleViewDetails, handleCollectAllSales, isCollectingAll]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">

      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Cobrar</p>
        {/* <div className="flex flex-wrap gap-2">
          <Tooltip content="Exportar ventas">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconDownload className="h-4 mr-1" />
              Exportar
            </Button>
          </Tooltip>
          <Tooltip content="Filtrar ventas">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconFilter className="h-4 mr-1" />
              Filtrar
            </Button>
          </Tooltip>
        </div> */}
      </div>

      <div className="overflow-x-auto border rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-6">
            <Spinner size="lg">Cargando...</Spinner>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-6">{error}</div>
        ) : rows.length === 0 ? (
          <div className="text-center p-6">No hay ventas para mostrar.</div>
        ) : (
          <Table
            aria-label="Cobranza"
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
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className="min-w-[80px] sm:min-w-[100px]"
                    >
                      {item[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {!loading && !error && rows.length !== 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {salesForCollect.length} de {totalCount} clientes
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

      {/* Modal de Confirmación */}
      <Modal
        isOpen={isConfirmModalOpen}
        onOpenChange={() => setIsConfirmModalOpen(false)}
        aria-labelledby="modal-confirm-title"
        placement="center"
        size="sm"
      >
        <ModalContent>
          <ModalHeader>Confirmar Cobranza</ModalHeader>
          <ModalBody>
            <p>
              ¿Está seguro de que desea cobrar todas las ventas de <strong>{customerToCollect?.name}</strong>?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button auto flat color="error" onPress={() => setIsConfirmModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              auto
              color="success"
              onPress={() => handleConfirmCollectAllSales(customerToCollect)}
              disabled={isCollectingAll}
            >
              {isCollectingAll ? <Spinner size="sm" /> : "Confirmar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Detalles */}
      <Modal
        isOpen={isDetailsModalOpen}
        onOpenChange={handleCloseDetailsModal}
        aria-labelledby="modal-details-title"
        placement="center"
        size="2xl"
        className="max-h-[72vh] overflow-y-auto"
      >
        <ModalContent>
          {selectedCustomer && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Detalles de Cobranza para {selectedCustomer.name}
              </ModalHeader>
              <ScrollShadow offset={25} size={50}>
                <ModalBody>
                  {selectedCustomer.sales_to_collect.length > 0 ? (
                    <Accordion>
                      {selectedCustomer.sales_to_collect.map((sale) => (
                        <AccordionItem
                          key={sale.id}
                          aria-label={`Detalles de la Venta #${sale.id}`}
                          title={`Venta #${sale.id} - ${new Date(sale.date).toLocaleDateString("es-AR")}`}
                        >
                          <div className="mb-4">
                            <p><strong>Fecha:</strong> {new Date(sale.date).toLocaleString("es-AR")}</p>
                            <p><strong>Total:</strong> {parseFloat(sale.total).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</p>
                            <p><strong>Total Devoluciones:</strong> {parseFloat(sale.total_returns).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</p>
                            <p><strong>Total a Cobrar:</strong> {parseFloat(sale.total_to_collect).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</p>
                            <p><strong>Total Cobrado:</strong> {parseFloat(sale.total_collected).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</p>
                            <p><strong>Tipo de Venta:</strong> {getChoiceName(SALE_TYPE_CHOICES, sale.sale_details.sale_type)}</p>
                            <p><strong>Método de Pago:</strong> {getChoiceName(PAYMENT_METHOD_CHOICES, sale.sale_details.payment_method)}</p>
                            <p><strong>Estado:</strong> {getChoiceName(STATE_CHOICES, sale.sale_details.state)}</p>
                          </div>

                          <div className="overflow-x-auto border rounded-md">
                            <Table
                              aria-label={`Detalles de la Venta #${sale.id}`}
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
                                {sale.sale_details.sale_details.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>
                                      {item.product_details.name}
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>
                                      {parseFloat(item.price).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                                    </TableCell>
                                    <TableCell>
                                      {parseFloat(item.subtotal).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="justify-between w-full flex gap-1 mt-4">
                            <div className="flex flex-wrap gap-1">
                              <Input
                                size='sm'
                                type='number'
                                placeholder='Monto'
                                min={1}
                                step={0.01}
                                className="max-w-[100px]"
                                aria-label={`Monto a Cobrar de la Venta #${sale.id}`}
                                startContent={<span className="text-default-400 text-small">$</span>}
                                value={partialAmounts[sale.id] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setPartialAmounts(prev => ({
                                    ...prev,
                                    [sale.id]: value,
                                  }));
                                  setPartialErrors(prev => ({
                                    ...prev,
                                    [sale.id]: '',
                                  }));
                                }}
                                status={partialErrors[sale.id] ? 'error' : 'default'}
                                isInvalid={!!partialErrors[sale.id]}
                                helperText={partialErrors[sale.id]}
                              />
                              <Button
                                size='sm'
                                color='secondary'
                                onPress={() => handlePartialCollect(sale.id, sale.total)}
                              >
                                Cobrar Parcialmente
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <Button
                                size='sm'
                                color='primary'
                                onPress={() => handleAddReturn(sale.id, sale.sale_details.customer_details.id)}
                              >
                                Agregar Devolución
                              </Button>
                              <Button
                                size='sm'
                                color='success'
                                onPress={() => handleCollect(sale.id)}
                              >
                                Cobrar Totalmente
                              </Button>
                            </div>
                          </div>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <p>No hay ventas para mostrar.</p>
                  )}
                </ModalBody>
              </ScrollShadow>

              <ModalFooter>
                <Button color="primary" onPress={handleCloseDetailsModal}>
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
