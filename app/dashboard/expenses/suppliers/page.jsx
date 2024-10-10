"use client";

import {
  Button,
  getKeyValue,
  Input,
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
  Link,
} from "@nextui-org/react";
import {
  IconDownload,
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import useSuppliers from "@/app/hooks/useSuppliers";

export default function SuppliersPage() {
  const { suppliers, loading, error: suppliersError, fetchSuppliers } = useSuppliers();

  const [rowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const [sortDescriptor, setSortDescriptor] = useState({ column: null, direction: null });

  const [user, setUser] = useState(null);

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        Cookies.remove("user");
      }
    }
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  const handleDeleteClick = useCallback((supplier) => {
    setSupplierToDelete(supplier);
    onOpen();
    setDeleteError(null);
  }, [onOpen]);

  const handleDeleteSupplier = useCallback(async () => {
    if (!supplierToDelete) return;

    setDeleting(true);
    setDeleteError(null);
    const token = Cookies.get("access_token");
    try {
      await api.delete(`/suppliers/${supplierToDelete.id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      await fetchSuppliers();
      onClose();
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      setDeleteError("Error al eliminar el proveedor.");
    } finally {
      setDeleting(false);
    }
  }, [supplierToDelete, onClose, fetchSuppliers]);

  const columns = [
    { key: 'id', label: '#', sortable: false },
    { key: 'name', label: 'Nombre', sortable: false },
    { key: 'phone_number', label: 'Teléfono', sortable: false },
    { key: 'email', label: 'Email', sortable: false },
    { key: 'address', label: 'Dirección', sortable: false },
    { key: 'actions', label: 'Acciones', sortable: false },
  ];

  const sortedSuppliers = useMemo(() => {
    if (!sortDescriptor.column) return [...suppliers];
    const sorted = [...suppliers].sort((a, b) => {
      let aValue, bValue;

      if (sortDescriptor.column === 'name' || sortDescriptor.column === 'email') {
        aValue = a[sortDescriptor.column]?.toLowerCase() || '';
        bValue = b[sortDescriptor.column]?.toLowerCase() || '';
      } else {
        aValue = a[sortDescriptor.column] || '';
        bValue = b[sortDescriptor.column] || '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDescriptor.direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
    return sorted;
  }, [suppliers, sortDescriptor]);

  const filteredSuppliers = useMemo(() => {
    let filtered = [...sortedSuppliers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(supplier =>
        (supplier.name && supplier.name.toLowerCase().includes(query)) ||
        (supplier.email && supplier.email.toLowerCase().includes(query)) ||
        (supplier.phone_number && supplier.phone_number.toLowerCase().includes(query)) ||
        (supplier.address && supplier.address.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [sortedSuppliers, searchQuery]);

  const rows = useMemo(() => (
    filteredSuppliers.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      phone_number: supplier.phone_number,
      email: supplier.email,
      address: supplier.address,
      actions: (
        <div className="flex gap-1">
          <Tooltip content="Editar">
            <Button
              variant="light"
              className="rounded-md"
              isIconOnly
              color="warning"
              onPress={() => router.push(`/dashboard/expenses/suppliers/edit/${supplier.id}`)}
              aria-label={`Editar proveedor ${supplier.name}`}
            >
              <IconEdit className="h-5" />
            </Button>
          </Tooltip>
          <Tooltip content="Eliminar">
            <Button
              variant="light"
              className="rounded-md"
              isIconOnly
              color="danger"
              onPress={() => handleDeleteClick(supplier)}
              aria-label={`Eliminar proveedor ${supplier.name}`}
              isDisabled={user?.user_type !== 'ADMIN'}
            >
              <IconTrash className="h-5" />
            </Button>
          </Tooltip>
        </div>
      )
    }))
  ), [filteredSuppliers, handleDeleteClick, router, user]);

  const totalItems = rows.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [totalPages, page]);

  const currentItems = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return rows.slice(startIdx, endIdx);
  }, [rows, page, rowsPerPage]);

  const currentItemsCount = currentItems.length;

  const handlePageChangeFunc = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleSortChange = useCallback((columnKey) => {
    setSortDescriptor(prev => {
      if (prev.column === columnKey) {
        return {
          column: columnKey,
          direction: prev.direction === "ascending" ? "descending" : "ascending"
        };
      } else {
        return {
          column: columnKey,
          direction: "ascending"
        };
      }
    });
  }, []);

  const renderHeader = useCallback((column) => {
    const isSortable = column.sortable;
    const isSorted = sortDescriptor.column === column.key;
    const direction = isSorted ? sortDescriptor.direction : null;

    return (
      <div
        className={`flex items-center ${isSortable ? "cursor-pointer" : ""}`}
        onClick={() => isSortable && handleSortChange(column.key)}
        aria-sort={isSorted ? direction : "none"}
      >
        <span>{column.label}</span>
        {isSortable && (
          direction === "ascending" ? <IconChevronUp className="ml-1 h-4 w-4" /> :
            direction === "descending" ? <IconChevronDown className="ml-1 h-4 w-4" /> :
              null
        )}
      </div>
    );
  }, [sortDescriptor, handleSortChange]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">

      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Proveedores</p>
        <div className="flex flex-wrap gap-2">
          <Tooltip content="Exportar proveedores">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconDownload className="h-4 mr-1" />
              Exportar
            </Button>
          </Tooltip>
          <Tooltip content="Listar proveedores">
            <Link href="/dashboard/expenses/">
              <Button className="rounded-md bg-black text-white">
                Gastos
              </Button>
            </Link>
          </Tooltip>
          <Tooltip content="Agregar nuevo proveedor">
            <Link href="/dashboard/expenses/suppliers/create">
              <Button className="rounded-md bg-black text-white">
                <IconPlus className="h-4 mr-1" />
                Nuevo Proveedor
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        <Input
          placeholder="Buscar proveedores"
          startContent={<IconSearch className="h-4" />}
          radius="none"
          variant="underlined"
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={() => {
            setSearchQuery('');
            setPage(1);
          }}
          className="w-full md:w-1/3"
          aria-label="Buscar proveedores"
          isClearable={true}
        />
      </div>

      {/* Tabla de Proveedores */}
      <div className="overflow-x-auto border rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-6">
            <Spinner size="lg" />
          </div>
        ) : suppliersError ? (
          <div className="text-red-500 text-center p-6">
            {suppliersError}
          </div>
        ) : currentItemsCount === 0 ? (
          <div className="text-center p-6">
            No hay proveedores para mostrar.
          </div>
        ) : (
          <Table
            aria-label="Proveedores"
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
            <TableBody items={currentItems}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => {
                    if (columnKey === 'id') {
                      return (
                        <TableCell>
                          {item.id}
                        </TableCell>
                      );
                    }
                    if (columnKey === 'actions') {
                      return (
                        <TableCell>
                          {item.actions}
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell className="min-w-[80px] sm:min-w-[100px]">
                        {getKeyValue(item, columnKey)}
                      </TableCell>
                    );
                  }}
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Paginación y Contador */}
      {!loading && !suppliersError && currentItemsCount !== 0 && (
        <div className='flex flex-col sm:flex-row items-center justify-between mt-4'>
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {currentItemsCount} de {totalItems} proveedores
          </p>
          <Pagination
            total={totalPages}
            initialPage={page}
            page={page}
            onChange={handlePageChangeFunc}
            size="sm"
            showShadow={true}
            color="primary"
          />
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      <Modal isOpen={isOpen} onOpenChange={onClose} aria-labelledby="modal-title" placement="top-center">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Confirmar Eliminación</ModalHeader>
              <ModalBody>
                <p>
                  ¿Estás seguro de que deseas eliminar al proveedor <strong>{supplierToDelete?.name}</strong>?
                  Esta acción no se puede deshacer.
                </p>
                {deleteError && (
                  <p className="text-red-500 mt-2">
                    {deleteError}
                  </p>
                )}
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
                  onPress={handleDeleteSupplier}
                  disabled={deleting}
                >
                  {deleting ? <Spinner size="sm" /> : "Eliminar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
