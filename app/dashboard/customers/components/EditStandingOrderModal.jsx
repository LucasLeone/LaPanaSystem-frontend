"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
  Select,
  SelectItem,
  Alert,
} from "@nextui-org/react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { DAY_NAMES } from "../page";
import api from "@/app/axios";
import toast from "react-hot-toast";

export default function EditStandingOrderModal({
  editingStandingOrder,
  setEditingStandingOrder,
  selectedCustomer,
  productsMap,
  setStandingOrders,
}) {
  const [localOrder, setLocalOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorTitle, setErrorTitle] = useState(null);
  const [errorDescription, setErrorDescription] = useState(null);

  useEffect(() => {
    if (editingStandingOrder) {
      setLocalOrder(JSON.parse(JSON.stringify(editingStandingOrder)));
    } else {
      setLocalOrder(null);
    };
    setErrorTitle(null);
    setErrorDescription(null);
  }, [editingStandingOrder]);

  if (!localOrder) {
    return null;
  }

  const handleDetailProductChange = (productId, index) => {
    setLocalOrder((prevOrder) => {
      const newDetails = [...prevOrder.details];
      newDetails[index] = { ...newDetails[index], product: productId };
      return { ...prevOrder, details: newDetails };
    });
  };

  const handleDetailQuantityChange = (e, index) => {
    const value = e.target.value;
    const parsedValue = parseFloat(value);

    if (parsedValue > 99) {
      return;
    }

    setLocalOrder((prevOrder) => {
      const newDetails = [...prevOrder.details];
      newDetails[index] = { ...newDetails[index], quantity: parsedValue };
      return { ...prevOrder, details: newDetails };
    });
  };

  const handleRemoveDetail = (index) => {
    setLocalOrder((prevOrder) => {
      const newDetails = prevOrder.details.filter((_, i) => i !== index);
      return { ...prevOrder, details: newDetails };
    });
  };

  const handleAddDetail = () => {
    setLocalOrder((prevOrder) => {
      if (prevOrder.details.length >= 3) {
        return prevOrder;
      }
      return {
        ...prevOrder,
        details: [
          ...prevOrder.details,
          { id: null, product: "", quantity: "" },
        ],
      };
    });
  };

  const handleSaveStandingOrder = async () => {
    setSaving(true);
    setErrorTitle(null);
    setErrorDescription(null);

    try {
      const hasInvalidDetails = localOrder.details.some(
        (detail) => !detail.product
      );
      if (hasInvalidDetails) {
        setErrorTitle("Detalles inválidos");
        setErrorDescription("Debe seleccionar un producto para cada detalle.");
        setSaving(false);
        return;
      }

      const productIds = localOrder.details.map((detail) => detail.product);
      if (new Set(productIds).size !== productIds.length) {
        setErrorTitle("Detalle duplicado");
        setErrorDescription("No puede haber dos detalles con el mismo producto.");
        setSaving(false);
        return;
      }

      const hasInvalidQuantities = localOrder.details.some(
        (detail) => isNaN(detail.quantity) || detail.quantity <= 0
      );
      if (hasInvalidQuantities) {
        setErrorTitle("Cantidad inválida");
        setErrorDescription("Todas las cantidades deben ser mayores a 0.");
        setSaving(false);
        return;
      }

      if (localOrder.details.length === 0) {
        setErrorTitle("Detalles inválidos");
        setErrorDescription("Debe agregar al menos un detalle al pedido.");
        setSaving(false);
        return;
      }

      const token = Cookies.get("access_token");
      const dataToSend = {
        customer: selectedCustomer.id,
        day_of_week: localOrder.day_of_week,
        details: localOrder.details.map((detail) => ({
          product: detail.product,
          quantity: detail.quantity,
        })),
      };

      if (localOrder.id) {
        await api.put(`/standing-orders/${localOrder.id}/`, dataToSend, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
      } else {
        await api.post(`/standing-orders/`, dataToSend, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
      }

      const response = await api.get(
        `/standing-orders/?customer=${selectedCustomer.id}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      const sortedOrders = response.data.results.sort(
        (a, b) => a.day_of_week - b.day_of_week
      );
      setStandingOrders(sortedOrders);

      setEditingStandingOrder(null);
      setErrorTitle(null);
      setErrorDescription(null);
      toast.success("Pedido diario guardado correctamente.");
    } catch (err) {
      console.error("Error al guardar el pedido diario:", err);
      setErrorTitle("Error al guardar");
      setErrorDescription("Hubo un error al guardar el pedido diario.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStandingOrder = async () => {
    if (!localOrder.id) {
      setEditingStandingOrder(null);
      return;
    }

    const token = Cookies.get("access_token");
    try {
      setSaving(true);
      await api.delete(`/standing-orders/${localOrder.id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const response = await api.get(
        `/standing-orders/?customer=${selectedCustomer.id}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      const sortedOrders = response.data.results.sort(
        (a, b) => a.day_of_week - b.day_of_week
      );
      setStandingOrders(sortedOrders);

      setEditingStandingOrder(null);
      setErrorTitle(null);
      setErrorDescription(null);
      toast.success("Pedido diario eliminado correctamente.");
    } catch (err) {
      console.error("Error al eliminar el pedido diario:", err);
      setErrorTitle("Error al eliminar");
      setErrorDescription("Hubo un error al eliminar el pedido diario.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={!!editingStandingOrder}
      onOpenChange={() => setEditingStandingOrder(null)}
      aria-labelledby="modal-title"
      scrollBehavior="inside"
      size="xl"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {localOrder.id ? "Editar" : "Crear"} Pedido Diario -{" "}
              {DAY_NAMES[localOrder.day_of_week]}
            </ModalHeader>
            <ModalBody>
              {errorTitle && (
                <Alert
                  description={errorDescription}
                  title={errorTitle}
                  color="danger"
                />
              )}
              {localOrder && (
                <div className="space-y-4">
                  {localOrder.details.map((detail, index) => (
                    <div
                      key={detail.id || index}
                      className="flex items-center space-x-4"
                    >
                      <Select
                        placeholder="Seleccionar Producto"
                        selectedKeys={
                          detail.product
                            ? new Set([detail.product.toString()])
                            : new Set()
                        }
                        onSelectionChange={(keys) => {
                          if (keys.size) {
                            const [productId] = Array.from(keys);
                            handleDetailProductChange(productId, index);
                          }
                        }}
                        aria-label={`Seleccionar producto para detalle ${index + 1
                          }`}
                      >
                        {Object.values(productsMap)
                          .filter((prod) =>
                            ["0001", "0002", "0003"].includes(prod.barcode)
                          )
                          .map((prod) => (
                            <SelectItem key={prod.id} value={prod.id.toString()}>
                              {prod.name}
                            </SelectItem>
                          ))}
                      </Select>

                      <Input
                        type="number"
                        value={detail.quantity}
                        onChange={(e) => handleDetailQuantityChange(e, index)}
                        aria-label={`Cantidad para producto ${detail.product}`}
                        className="w-fit"
                      />

                      <Button
                        color="danger"
                        variant="light"
                        onPress={() => handleRemoveDetail(index)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                  <Button
                    color="primary"
                    variant="light"
                    onPress={handleAddDetail}
                    isDisabled={localOrder.details.length >= 3}
                  >
                    Agregar Producto
                  </Button>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              {localOrder.id && (
                <Button
                  color="danger"
                  variant="light"
                  onPress={handleDeleteStandingOrder}
                  isDisabled={saving}
                >
                  {saving ? <Spinner size="sm" /> : "Eliminar Pedido Diario"}
                </Button>
              )}
              <Button
                color="primary"
                variant="light"
                onPress={() => {
                  setEditingStandingOrder(null);
                  setErrorTitle(null);
                  setErrorDescription(null);
                }}
                isDisabled={saving}
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleSaveStandingOrder}
                isDisabled={saving}
              >
                {saving ? <Spinner size="sm" /> : "Guardar"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
