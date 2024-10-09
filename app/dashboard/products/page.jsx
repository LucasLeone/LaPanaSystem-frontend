"use client";

import {
  Button,
  Input,
  Spinner,
  Link,
  Tooltip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import {
  IconDownload,
  IconPlus,
  IconSearch,
  IconFilter,
  IconTrash,
  IconChevronUp,
  IconChevronDown,
  IconEdit,
} from "@tabler/icons-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import useProducts from "@/app/hooks/useProducts";
import useProductBrands from "@/app/hooks/useProductBrands";
import useProductCategories from "@/app/hooks/useProductCategories";

export default function ProductsPage() {
  const router = useRouter();

  // Estados para filtros temporales
  const [tempFilterCategory, setTempFilterCategory] = useState(null);
  const [tempFilterBrand, setTempFilterBrand] = useState(null);
  const [tempFilterSearch, setTempFilterSearch] = useState("");

  // Estado para filtros aplicados
  const [filters, setFilters] = useState({});

  // Estado para búsqueda y ordenamiento
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery); // Nuevo estado para debounced search
  const [sortDescriptor, setSortDescriptor] = useState({
    column: null,
    direction: null,
  });

  // Paginación
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);

  // Estados para eliminación de productos
  const [productToDelete, setProductToDelete] = useState(null);

  // Control de modales
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isFilterModalOpen,
    onOpen: onFilterModalOpen,
    onClose: onFilterModalClose,
  } = useDisclosure();

  // Hooks para obtener datos
  const {
    products,
    totalCount,
    loading: productsLoading,
    error: productsError,
    fetchProducts,
  } = useProducts(filters, (page - 1) * rowsPerPage);

  const {
    productBrands: brands,
    loading: brandsLoading,
    error: brandsError,
  } = useProductBrands();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useProductCategories();

  // Implementación del debouncing para la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms de retraso

    // Limpiar el timeout si el componente se desmonta o si searchQuery cambia antes de 500ms
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Memoización de filtros aplicados usando debouncedSearchQuery
  const appliedFilters = useMemo(() => {
    const newFilters = { ...filters };

    if (debouncedSearchQuery) {
      newFilters.search = debouncedSearchQuery;
    }

    if (sortDescriptor.column) {
      const columnKeyToField = {
        id: "id",
        barcode: "barcode",
        name: "name",
        retail_price: "retail_price",
        wholesale_price: "wholesale_price",
        category: "category__name",
        brand: "brand__name",
      };
      const backendField = columnKeyToField[sortDescriptor.column] || sortDescriptor.column;
      newFilters.ordering =
        sortDescriptor.direction === "ascending"
          ? backendField
          : `-${backendField}`;
    }

    return newFilters;
  }, [filters, debouncedSearchQuery, sortDescriptor]);

  // Uso del hook useEffect para manejar las peticiones a la API
  useEffect(() => {
    fetchProducts(appliedFilters, (page - 1) * rowsPerPage, rowsPerPage);
  }, [appliedFilters, fetchProducts, page, rowsPerPage]);

  // Función para aplicar los filtros
  const applyFilters = () => {
    const newFilters = {};

    if (tempFilterCategory) {
      newFilters.category = tempFilterCategory;
    }
    if (tempFilterBrand) {
      newFilters.brand = tempFilterBrand;
    }
    if (tempFilterSearch !== "") {
      newFilters.search = tempFilterSearch;
    }

    setFilters(newFilters);
    setPage(1);
    onFilterModalClose();
  };

  const clearFilters = () => {
    setTempFilterCategory(null);
    setTempFilterBrand(null);
    setTempFilterSearch("");
    setSearchQuery("");
    setSortDescriptor({
      column: null,
      direction: null,
    });
    setFilters({});
  };

  // Manejo de búsqueda
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  // Manejo de eliminación de productos
  const handleDeleteClick = useCallback(
    (product) => {
      setProductToDelete(product);
      onOpen();
    },
    [onOpen]
  );

  const handleDeleteProduct = useCallback(async () => {
    if (!productToDelete) return;

    const token = Cookies.get("access_token");
    try {
      await api.delete(`/products/${productToDelete.slug}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      fetchProducts(appliedFilters, (page - 1) * rowsPerPage, rowsPerPage);
      onClose();
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      // Puedes manejar el error de manera más específica aquí
    }
  }, [productToDelete, fetchProducts, appliedFilters, onClose, page, rowsPerPage]);

  // Definición de columnas de la tabla
  const columns = [
    { key: "id", label: "#", sortable: true },
    { key: "barcode", label: "Código de Barras", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "retail_price", label: "Precio Minorista", sortable: true },
    { key: "wholesale_price", label: "Precio Mayorista", sortable: true },
    { key: "weight", label: "Peso", sortable: false },
    { key: "category", label: "Categoría", sortable: true }, // Cambiado a sortable: true
    { key: "brand", label: "Marca", sortable: true }, // Cambiado a sortable: true
    { key: "actions", label: "Acciones", sortable: false },
  ];

  // Generación de filas para la tabla
  const rows = useMemo(
    () =>
      products.map((product) => ({
        id: product.id,
        barcode: product.barcode,
        name: product.name,
        retail_price: product.retail_price != null
          ? `${parseFloat(product.retail_price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`
          : '',
        wholesale_price: product.wholesale_price != null
          ? `${parseFloat(product.wholesale_price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`
          : '',
        weight: product.weight ? `${parseFloat(product.weight).toLocaleString('es-AR')} ${product.weight_unit}` : '',
        category: product.category_details?.name || '',
        brand: product.brand_details?.name || '',
        actions: (
          <div className="flex gap-1">
            <Tooltip content="Editar">
              <Button
                variant="light"
                className="rounded-md"
                isIconOnly
                color="warning"
                onPress={() => router.push(`/dashboard/products/edit/${product.slug}`)}
                aria-label={`Editar producto ${product.name}`}
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
                onPress={() => handleDeleteClick(product)}
                aria-label={`Eliminar producto ${product.name}`}
              >
                <IconTrash className="h-5" />
              </Button>
            </Tooltip>
          </div>
        ),
      })),
    [products, handleDeleteClick, router]
  );

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  const handlePageChangeFunc = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleSortChange = useCallback((columnKey) => {
    setSortDescriptor((prev) => {
      if (prev.column === columnKey) {
        return {
          column: columnKey,
          direction:
            prev.direction === "ascending" ? "descending" : "ascending",
        };
      } else {
        return {
          column: columnKey,
          direction: "ascending",
        };
      }
    });
  }, []);

  const renderHeader = useCallback(
    (column) => {
      const isSortable = column.sortable;
      const isSorted = sortDescriptor.column === column.key;
      const direction = isSorted ? sortDescriptor.direction : null;

      return (
        <div
          className={`flex items-center ${isSortable ? "cursor-pointer" : ""
            }`}
          onClick={() => isSortable && handleSortChange(column.key)}
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
    [sortDescriptor, handleSortChange]
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Productos</p>
        <div className="flex flex-wrap gap-2">
          <Tooltip content="Exportar productos">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconDownload className="h-4 mr-1" />
              Exportar
            </Button>
          </Tooltip>
          <Tooltip content="Agregar nuevo producto">
            <Link href="/dashboard/products/create">
              <Button className="rounded-md bg-black text-white">
                <IconPlus className="h-4 mr-1" />
                Nuevo Producto
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        <Input
          placeholder="Buscar productos"
          startContent={<IconSearch className="h-4" />}
          radius="none"
          variant="underlined"
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={() => {
            setSearchQuery("");
            setPage(1);
          }}
          className="w-full md:w-1/3"
          aria-label="Buscar productos"
          isClearable={true}
        />
        <Button
          variant="bordered"
          className="rounded-md border-1.5"
          onPress={onFilterModalOpen}
        >
          <IconFilter className="h-4 mr-1" />
          Filtros
        </Button>
      </div>

      {/* Tabla de Productos */}
      <div className="overflow-x-auto border rounded-md">
        {productsLoading || brandsLoading || categoriesLoading ? (
          <div className="flex justify-center items-center p-6">
            <Spinner size="lg" />
          </div>
        ) : productsError || brandsError || categoriesError ? (
          <div className="text-red-500 text-center p-6">
            {productsError || brandsError || categoriesError}
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center p-6">No hay productos para mostrar.</div>
        ) : (
          <Table
            aria-label="Productos"
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
                      return <TableCell key={column.key}>{item.id}</TableCell>;
                    }
                    if (column.key === "actions") {
                      return <TableCell key={column.key}>{item.actions}</TableCell>;
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
        )}
      </div>

      {/* Paginación */}
      {!productsLoading && !productsError && rows.length !== 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {products.length} de {totalCount} productos
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

      {/* Modal de Filtros */}
      <Modal
        isOpen={isFilterModalOpen}
        onOpenChange={onFilterModalClose}
        aria-labelledby="modal-filters-title"
        placement="center"
        size="lg"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Filtros de Productos
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col space-y-4">
                  {/* Filtro de Categoría con Autocomplete */}
                  <div>
                    <Autocomplete
                      label="Buscar y seleccionar categoría"
                      placeholder="Escribe para buscar"
                      className="w-full"
                      aria-label="Filtro de Categoría"
                      onClear={() => setTempFilterCategory(null)}
                      onSelectionChange={(value) => setTempFilterCategory(value)}
                      selectedKey={tempFilterCategory}
                      variant="underlined"
                      isClearable
                    >
                      {categories.map((category) => (
                        <AutocompleteItem
                          key={category.id.toString()}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  </div>

                  {/* Filtro de Marca con Autocomplete */}
                  <div>
                    <Autocomplete
                      label="Buscar y seleccionar marca"
                      placeholder="Escribe para buscar"
                      className="w-full"
                      aria-label="Filtro de Marca"
                      onClear={() => setTempFilterBrand(null)}
                      onSelectionChange={(value) => setTempFilterBrand(value)}
                      selectedKey={tempFilterBrand}
                      variant="underlined"
                      isClearable
                    >
                      {brands.map((brand) => (
                        <AutocompleteItem
                          key={brand.id.toString()}
                          value={brand.id.toString()}
                        >
                          {brand.name}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={clearFilters} color="warning">
                  Limpiar Filtros
                </Button>
                <Button onPress={applyFilters} color="primary">
                  Aplicar Filtros
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
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
                  ¿Estás seguro de que deseas eliminar el producto{" "}
                  <strong>{productToDelete?.name}</strong>? Esta acción no se puede
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
                  onPress={handleDeleteProduct}
                  disabled={false}
                >
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
