"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "@nextui-org/react";

export default function ConfirmationModal({
  isOpen,
  onClose,
  customerToDelete,
  deleting,
  handleDeleteCustomer,
}) {
  return (
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
                ¿Estás seguro de que deseas eliminar al cliente{" "}
                <strong>{customerToDelete?.name}</strong>? Esta acción no se
                puede deshacer.
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
                onPress={handleDeleteCustomer}
                disabled={deleting}
              >
                {deleting ? <Spinner size="sm" /> : "Eliminar"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
