"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
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
  IconFilter,
  IconEdit,
  IconX,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [rowsPerPage] = useState(10); // Definido como constante
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false); // Estado para manejar la eliminación
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [brandToDelete, setBrandToDelete] = useState(null); // Marca a eliminar
  const [sortDescriptor, setSortDescriptor] = useState({ column: null, direction: null }); // Añadido

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Control del modal

  // Fetch de marcas
  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      setError(null);
      const token = Cookies.get("access_token");
      try {
        const response = await api.get("/product-brands/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setBrands(response.data);
      } catch (error) {
        console.error("Error al cargar las marcas:", error);
        setError("Error al cargar las marcas.");
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // Manejo de cambio en la búsqueda (sin debounce)
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  // Función para abrir el modal y setear la marca a eliminar
  const handleDeleteClick = useCallback((brand) => {
    setBrandToDelete(brand);
    onOpen();
  }, [onOpen]);

  // Función para eliminar la marca
  const handleDeleteBrand = useCallback(async () => {
    if (!brandToDelete) return;

    setDeleting(true);
    const token = Cookies.get("access_token");
    try {
      // Asegúrate de que el endpoint de eliminación utiliza el ID de la marca
      await api.delete(`/product-brands/${brandToDelete.id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setBrands((prevBrands) => prevBrands.filter(b => b.id !== brandToDelete.id));
      onClose();
    } catch (error) {
      console.error("Error al eliminar la marca:", error);
      setError("Error al eliminar la marca.");
    } finally {
      setDeleting(false);
    }
  }, [brandToDelete, onClose]);

  const columns = [
    { key: 'id', label: '#', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'description', label: 'Descripción', sortable: false },
    { key: 'actions', label: 'Acciones', sortable: false },
  ];

  // Ordenamiento de las marcas según la columna seleccionada
  const sortedBrands = useMemo(() => {
    if (!sortDescriptor.column) return [...brands];
    const sorted = [...brands].sort((a, b) => {
      let aValue, bValue;

      aValue = a[sortDescriptor.column];
      bValue = b[sortDescriptor.column];

      if (typeof aValue === "string") {
        return sortDescriptor.direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) {
        return sortDescriptor.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDescriptor.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [brands, sortDescriptor]);

  // Filtrado y búsqueda
  const filteredBrands = useMemo(() => {
    let filtered = [...sortedBrands];

    // Aplicar búsqueda sobre los datos filtrados
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(brand =>
        (brand.name && brand.name.toLowerCase().includes(query)) ||
        (brand.description && brand.description.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [sortedBrands, searchQuery]);

  // Mapeo de marcas a filas de la tabla
  const rows = useMemo(() => (
    filteredBrands.map(brand => ({
      id: brand.id,
      name: brand.name,
      description: brand.description,
      actions: (
        <div className="flex space-x-2">
          <Tooltip content="Editar">
            <Button
              variant="light"
              className="rounded-md"
              isIconOnly
              color="warning"
              onPress={() => router.push(`/dashboard/products/brands/edit/${brand.id}`)}
              aria-label={`Editar marca ${brand.name}`} // Mejoras de accesibilidad
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
              onPress={() => handleDeleteClick(brand)}
              aria-label={`Eliminar marca ${brand.name}`} // Mejoras de accesibilidad
            >
              <IconX className="h-5" />
            </Button>
          </Tooltip>
        </div>
      )
    }))
  ), [filteredBrands, handleDeleteClick, router]);

  const totalItems = rows.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Reseteo de página si excede el total de páginas
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [totalPages, page]);

  // Paginación
  const currentItems = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return rows.slice(startIdx, endIdx);
  }, [rows, page, rowsPerPage]);

  const currentItemsCount = currentItems.length;

  const handlePageChangeFunc = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  // Función para manejar el cambio de ordenamiento
  const handleSortChange = useCallback((columnKey) => {
    setSortDescriptor(prev => {
      if (prev.column === columnKey) {
        // Toggle direction
        return {
          column: columnKey,
          direction: prev.direction === "ascending" ? "descending" : "ascending"
        };
      } else {
        // Nueva columna, por defecto ascendente
        return {
          column: columnKey,
          direction: "ascending"
        };
      }
    });
  }, []);

  // Función para renderizar los encabezados con ordenamiento
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
        <p className="text-2xl font-bold mb-4 md:mb-0">Marcas</p>
        <div className="flex space-x-2">
          <Tooltip content="Exportar marcas">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconDownload className="h-4 mr-1" />
              Exportar
            </Button>
          </Tooltip>
          <Tooltip content="Listar productos">
            <Link href="/dashboard/products">
              <Button className="rounded-md bg-black text-white">
                Productos
              </Button>
            </Link>
          </Tooltip>
          <Tooltip content="Listar categorías">
            <Link href="/dashboard/products/categories">
              <Button className="rounded-md bg-black text-white">
                Categorías
              </Button>
            </Link>
          </Tooltip>
          <Tooltip content="Agregar nueva marca">
            <Link href="/dashboard/products/brands/create">
              <Button className="rounded-md bg-black text-white">
                <IconPlus className="h-4 mr-1" />
                Nueva Marca
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        <Input
          placeholder="Buscar marcas"
          startContent={<IconSearch className="h-4" />}
          radius="none"
          variant="underlined"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full md:w-1/3"
          aria-label="Buscar marcas"
        />
      </div>

      {/* Tabla de Marcas */}
      <div className="overflow-x-auto border rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-6">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-6">
            {error}
          </div>
        ) : currentItemsCount === 0 ? (
          <div className="text-center p-6">
            No hay marcas para mostrar.
          </div>
        ) : (
          <Table
            aria-label="Marcas"
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
                        {item[columnKey]}
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
      {!loading && !error && currentItemsCount !== 0 && (
        <div className='flex flex-col sm:flex-row items-center justify-between mt-4'>
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {currentItemsCount} de {totalItems} marcas
          </p>
          <Pagination
            total={totalPages}
            initialPage={page}
            page={page}
            onChange={handlePageChangeFunc}
            size="sm"
            showShadow={true}
            color="primary"
            boundaryCount={1}
            siblingCount={1}
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
                  ¿Estás seguro de que deseas eliminar la marca <strong>{brandToDelete?.name}</strong>?
                  Esta acción no se puede deshacer.
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
                  onPress={handleDeleteBrand}
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
