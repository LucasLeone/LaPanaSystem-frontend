"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

const CancelModal = ({
  isOpen,
  onClose,
  onConfirm,
  saleToCancel,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
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
                onPress={onClose}
                disabled={false}
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={onConfirm}
                disabled={false}
              >
                Confirmar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CancelModal;
