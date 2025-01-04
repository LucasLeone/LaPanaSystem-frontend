"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Button,
} from "@nextui-org/react";
import { DAY_NAMES } from "../page";

export default function StandingOrdersModal({
  isOpen,
  onClose,
  selectedCustomer,
  standingOrders,
  loadingStandingOrders,
  errorStandingOrders,
  handleEditStandingOrder,
  handleCreateStandingOrder,
  handleCopyStandingOrder,
  productsMap,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      aria-labelledby="modal-title"
      scrollBehavior="inside"
      size="xl"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Pedidos Diarios de {selectedCustomer?.name}
            </ModalHeader>
            <ModalBody>
              {loadingStandingOrders ? (
                <div className="flex justify-center items-center p-6">
                  <Spinner size="lg">Cargando...</Spinner>
                </div>
              ) : errorStandingOrders ? (
                <div className="text-red-500 text-center p-6">
                  {errorStandingOrders}
                </div>
              ) : (
                <div className="space-y-4">
                  {standingOrders.map((order) => (
                    <div key={order.id} className="border p-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">
                          {DAY_NAMES[order.day_of_week]}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            onPress={() => handleEditStandingOrder(order)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            color="secondary"
                            onPress={() => handleCopyStandingOrder(order)}
                          >
                            Copiar a otros días
                          </Button>
                        </div>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {order.details.map((detail) => (
                          <li key={detail.product}>
                            {productsMap[detail.product]?.name || "Producto"} -{" "}
                            Cantidad: {detail.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {/* Opción para agregar pedido diario en días sin pedidos */}
                  {[...Array(7).keys()]
                    .filter(
                      (day) =>
                        !standingOrders.some(
                          (order) => order.day_of_week === day
                        )
                    )
                    .map((day) => (
                      <div key={day} className="border p-4 rounded-md">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold">{DAY_NAMES[day]}</p>
                          <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            onPress={() => handleCreateStandingOrder(day)}
                          >
                            Agregar Pedido
                          </Button>
                        </div>
                        <p className="mt-2 text-gray-500">
                          No hay pedidos diarios para este día.
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                variant="light"
                onPress={() => onClose(false)}
              >
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
