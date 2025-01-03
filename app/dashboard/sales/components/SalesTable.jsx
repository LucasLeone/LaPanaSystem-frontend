"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Spinner,
} from "@nextui-org/react";
import {
  IconChevronUp,
  IconChevronDown,
  IconDots,
} from "@tabler/icons-react";
import { useMemo, useCallback } from "react";

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

const SalesTable = ({
  sales,
  loading,
  error,
  columns,
  sortDescriptor,
  onSortChange,
  onViewClick,
  onEditClick,
  onCancelClick,
}) => {
  const renderHeader = useCallback(
    (column) => {
      const isSortable = column.sortable;
      const isSorted = sortDescriptor.column === column.key;
      const direction = isSorted ? sortDescriptor.direction : null;

      return (
        <div
          className={`flex items-center ${isSortable ? "cursor-pointer" : ""
            }`}
          onClick={() => isSortable && onSortChange(column.key)}
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
    },
    [sortDescriptor, onSortChange]
  );

  const rows = useMemo(() =>
    sales.map((sale) => {
      const isAnuladaOCancelada = sale.state === "anulada" || sale.state === "cancelada";
      const isCobrada = sale.state === "cobrada";

      const disabledKeys = isAnuladaOCancelada
        ? ["cancel", "edit"]
        : isCobrada
          ? ["edit"]
          : [];

      return {
        id: sale.id,
        date: new Date(sale.date).toLocaleString("es-AR", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        customer: sale.customer_details?.name || "",
        seller: sale.user_details?.username || "",
        total: `${parseFloat(sale.total).toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
        })}`,
        total_collected: `${parseFloat(sale.total_collected).toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
        })}`,
        sale_type:
          SALE_TYPE_CHOICES.find((item) => item.id === sale.sale_type)?.name ||
          sale.sale_type,
        payment_method:
          PAYMENT_METHOD_CHOICES.find((item) => item.id === sale.payment_method)?.name ||
          sale.payment_method,
        state:
          STATE_CHOICES.find((item) => item.id === sale.state)?.name || sale.state,
        needs_delivery: sale.needs_delivery ? "Sí" : "No",
        actions: (
          <div className="flex gap-1">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant="light">
                  <IconDots className="w-5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Opciones de Venta"
                disabledKeys={disabledKeys}
              >
                <DropdownItem
                  key="view"
                  onPress={() => onViewClick(sale)}
                >
                  Ver Detalles
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  onPress={() => onEditClick(sale)}
                  className={disabledKeys.includes("edit") ? "text-default-400" : ""}
                >
                  Editar
                </DropdownItem>
                <DropdownItem
                  key="cancel"
                  onPress={() => onCancelClick(sale)}
                  className={disabledKeys.includes("cancel") ? "text-default-400" : "text-danger"}
                >
                  {["creada", "pendiente_entrega", "entregada"].includes(sale.state)
                    ? "Cancelar"
                    : "Anular"}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        ),
      };
    }),
    [sales, onViewClick, onEditClick, onCancelClick]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Spinner size="lg">Cargando...</Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-6">{error}</div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-center p-6">No hay ventas para mostrar.</div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-md">
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
          {rows.map((item) => (
            <TableRow key={item.id}>
              {columns.map((column) => {
                if (column.key === "id") {
                  return (
                    <TableCell key={column.key}>{item.id}</TableCell>
                  );
                }
                if (column.key === "actions") {
                  return (
                    <TableCell key={column.key}>{item.actions}</TableCell>
                  );
                }
                return (
                  <TableCell
                    key={column.key}
                    className="min-w-[80px] sm:min-w-[100px]"
                  >
                    {item[column.key]}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SalesTable;
