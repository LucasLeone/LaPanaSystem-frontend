"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Tooltip,
  Button
} from "@nextui-org/react";
import { IconEdit, IconTrash, IconCalendarEvent, IconChevronUp, IconChevronDown } from "@tabler/icons-react";

export default function CustomersTable({
  customers,
  loading,
  fetchError,
  onDeleteClick,
  onStandingOrdersClick,
  user,
  onSortChange,
  sortDescriptor,
  capitalize,
  router,
}) {
  const columns = [
    { key: "id", label: "#", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "phone_number", label: "Celular", sortable: false },
    { key: "email", label: "Correo", sortable: false },
    { key: "address", label: "Dirección", sortable: false },
    { key: "customer_type", label: "Tipo de Cliente", sortable: true },
    { key: "actions", label: "Acciones", sortable: false },
  ];

  const renderHeader = (column) => {
    const isSortable = column.sortable;
    const isSorted = sortDescriptor.column === column.key;
    const direction = isSorted ? sortDescriptor.direction : null;

    return (
      <div
        className={`flex items-center ${isSortable ? "cursor-pointer" : ""}`}
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
  };

  const rows = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    phone_number: customer.phone_number,
    email: customer.email,
    address: customer.address,
    customer_type: capitalize(customer.customer_type) || "N/A",
    actions: (
      <div className="flex gap-1">
        <Tooltip content="Editar">
          <Button
            variant="light"
            className="rounded-md"
            isIconOnly
            color="warning"
            onPress={() =>
              router.push(`/dashboard/customers/edit/${customer.id}`)
            }
            aria-label={`Editar cliente ${customer.name}`}
          >
            <IconEdit className="h-5" />
          </Button>
        </Tooltip>
        <Tooltip content="Pedidos Diarios">
          <Button
            variant="light"
            className="rounded-md"
            isIconOnly
            color="primary"
            onPress={() => onStandingOrdersClick(customer)}
            aria-label={`Pedidos diarios de ${customer.name}`}
            isDisabled={customer.customer_type === "minorista"}
          >
            <IconCalendarEvent className="h-5" />
          </Button>
        </Tooltip>
        <Tooltip content="Eliminar">
          <Button
            variant="light"
            className="rounded-md"
            isIconOnly
            color="danger"
            onPress={() => onDeleteClick(customer)}
            aria-label={`Eliminar cliente ${customer.name}`}
            isDisabled={user?.user_type !== "ADMIN"}
          >
            <IconTrash className="h-5" />
          </Button>
        </Tooltip>
      </div>
    ),
  }));

  return (
    <div className="overflow-x-auto border rounded-md">
      {loading ? (
        <div className="flex justify-center items-center p-6">
          <Spinner size="lg">Cargando...</Spinner>
        </div>
      ) : fetchError ? (
        <div className="text-red-500 text-center p-6">{fetchError}</div>
      ) : customers.length === 0 ? (
        <div className="text-center p-6">No hay clientes para mostrar.</div>
      ) : (
        <Table
          aria-label="Clientes"
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
                {columns.map((col) => {
                  if (col.key === "actions") {
                    return (
                      <TableCell key={col.key}>{item.actions}</TableCell>
                    );
                  }
                  return (
                    <TableCell
                      key={col.key}
                      className="min-w-[80px] sm:min-w-[100px]"
                    >
                      {item[col.key]}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
