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
} from "@nextui-org/react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { DAY_NAMES } from "../page";
import api from "@/app/axios";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";

export default function EditStandingOrderModal({
  editingStandingOrder,
  setEditingStandingOrder,
  selectedCustomer,
  productsMap,
  setStandingOrders,
}) {
  const [localOrder, setLocalOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editingStandingOrder) {
      setLocalOrder(JSON.parse(JSON.stringify(editingStandingOrder)));
    } else {
      setLocalOrder(null);
    }
  }, [editingStandingOrder]);

  if (!localOrder) {
    return null;
  }

  const handleDetailProductChange = (keys, index) => {
    const productId = keys;
    setLocalOrder((prevOrder) => {
      const newDetails = [...prevOrder.details];
      newDetails[index] = { ...newDetails[index], product: productId };
      return { ...prevOrder, details: newDetails };
    });
  };

  const handleDetailQuantityChange = (e, index) => {
    const value = e.target.value;
    const parsedValue = parseFloat(value);

    if (isNaN(parsedValue) || parsedValue < 0) {
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
    setLocalOrder((prevOrder) => ({
      ...prevOrder,
      details: [
        ...prevOrder.details,
        { id: null, product: "", quantity: 0.0 },
      ],
    }));
  };

  const handleSaveStandingOrder = async () => {
    setSaving(true);
    setError(null);

    try {
      const hasInvalidDetails = localOrder.details.some(
        (detail) => !detail.product
      );
      if (hasInvalidDetails) {
        alert("Todos los detalles deben tener un producto seleccionado.");
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
    } catch (err) {
      console.error("Error al guardar el pedido diario:", err);
      setError("Hubo un error al guardar el pedido diario.");
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
    } catch (err) {
      console.error("Error al eliminar el pedido diario:", err);
      setError("Hubo un error al eliminar el pedido diario.");
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
              {error && (
                <p className="text-red-500 text-sm mb-2">{error}</p>
              )}
              {localOrder && (
                <div className="space-y-4">
                  {localOrder.details.map((detail, index) => (
                    <div
                      key={detail.id || index}
                      className="flex items-center space-x-4"
                    >
                      <Autocomplete
                        placeholder="Seleccionar Producto"
                        value={detail.product.toString()}
                        selectedKey={
                          detail.product ? detail.product.toString() : []
                        }
                        onSelectionChange={(keys) =>
                          handleDetailProductChange(keys, index)
                        }
                        aria-label={`Seleccionar producto para detalle ${index + 1}`}
                      >
                        {Object.values(productsMap).map((prod) => (
                          <AutocompleteItem key={prod.id} value={prod.id}>
                            {prod.name}
                          </AutocompleteItem>
                        ))}
                      </Autocomplete>

                      {/* Campo de Cantidad */}
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
                  {/* Botón para agregar un nuevo producto */}
                  <Button
                    color="primary"
                    variant="light"
                    onPress={handleAddDetail}
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
                  disabled={saving}
                >
                  {saving ? <Spinner size="sm" /> : "Eliminar Pedido Diario"}
                </Button>
              )}
              <Button
                color="primary"
                variant="light"
                onPress={() => setEditingStandingOrder(null)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button color="primary" onPress={handleSaveStandingOrder} disabled={saving}>
                {saving ? <Spinner size="sm" /> : "Guardar"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
