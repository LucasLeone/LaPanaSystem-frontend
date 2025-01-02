"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Accordion,
  AccordionItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { capitalize } from "@/app/utils";
import api from "@/app/axios";
import { useCallback, useEffect, useState } from "react";
import { formatDateForDisplay } from "@/app/utils";

const STATE_CHOICES = [
  { id: "creada", name: "Creada" },
  { id: "pendiente_entrega", name: "Pendiente de Entrega" },
  { id: "entregada", name: "Entregada" },
  { id: "cobrada", name: "Cobrada" },
  { id: "cobrada_parcial", name: "Cobrada Parcial" },
  { id: "cancelada", name: "Cancelada" },
  { id: "anulada", name: "Anulada" },
];

const ViewDetailsModal = ({ isOpen, onClose, saleToView, token }) => {
  const [returns, setReturns] = useState(null); // Renombrado a 'returns' para mayor claridad

  const fetchReturns = useCallback(async () => {
    try {
      const response = await api.get(`/returns/?sale=${saleToView?.id}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      if (response.data.results.length > 0) {
        setReturns(response.data.results);
      } else {
        setReturns([]); // Asegura que 'returns' sea un arreglo vacío si no hay devoluciones
      }
    } catch (error) {
      console.error("Error al obtener las devoluciones:", error);
      setReturns([]); // Maneja errores estableciendo 'returns' como un arreglo vacío
    }
  }, [saleToView?.id, token]);

  useEffect(() => {
    if (isOpen && saleToView) {
      fetchReturns();
    } else {
      setReturns(null); // Resetea las devoluciones al cerrar el modal
    }
  }, [fetchReturns, isOpen, saleToView]);

  return (
    <Modal
      size="2xl"
      isOpen={isOpen}
      onOpenChange={onClose}
      aria-labelledby="view-modal-title"
      placement="center"
      className="overflow-y-auto h-3/4"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Detalles de la Venta #{saleToView?.id}
            </ModalHeader>
            <ModalBody>
              <Accordion defaultExpandedKeys={["1", "2"]}>
                {/* Detalles Generales */}
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
                    {`${parseFloat(saleToView?.total).toLocaleString(
                      "es-AR",
                      {
                        style: "currency",
                        currency: "ARS",
                      }
                    )}`}
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

                {/* Items de la Venta */}
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

                {/* Devoluciones Asociadas */}
                {returns && returns.length > 0 && (
                  returns.map((ret, index) => (
                    <AccordionItem
                      key={`return-${ret.id}`}
                      aria-label={`Devolución #${ret.id}`}
                      title={`Devolución #${ret.id}`}
                    >
                      <div className="mb-2">
                        <p>
                          <strong>Usuario:</strong> {ret.user_details.first_name} {ret.user_details.last_name}
                        </p>
                        <p>
                          <strong>Fecha:</strong> {formatDateForDisplay(new Date(ret.date))}
                        </p>
                        <p>
                          <strong>Total de la Devolución:</strong>{" "}
                          {`${parseFloat(ret.total).toLocaleString(
                            "es-AR",
                            {
                              style: "currency",
                              currency: "ARS",
                            }
                          )}`}
                        </p>
                      </div>
                      <div className="overflow-x-auto max-h-60 border rounded-md">
                        {ret.return_details && ret.return_details.length > 0 ? (
                          <Table
                            aria-label={`Detalles de la Devolución #${ret.id}`}
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
                              {ret.return_details.map((item, idx) => (
                                <TableRow key={idx}>
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
                          <p>No hay detalles de devolución para mostrar.</p>
                        )}
                      </div>
                    </AccordionItem>
                  ))
                )}
              </Accordion>
            </ModalBody>
            <ModalFooter>
              <Button onPress={onClose} color="primary">
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ViewDetailsModal;
