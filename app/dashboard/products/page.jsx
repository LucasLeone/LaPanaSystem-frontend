"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
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
  DropdownSection,
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

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterBrand, setFilterBrand] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);
  const [sortDescriptor, setSortDescriptor] = useState({ column: null, direction: null });

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      const token = Cookies.get("access_token");
      try {
        const response = await api.get("/products/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setProducts(response.data);
      } catch (error) {
        console.error(error);
        setError("Error al cargar los productos.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = Cookies.get("access_token");
      try {
        const response = await api.get("/product-categories/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setCategories(response.data);
      } catch (error) {
        console.error("Error al cargar las categorías:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
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
      }
    };
    fetchBrands();
  }, []);

  const handleFilterCategory = useCallback((key) => {
    if (key === "none") {
      setFilterCategory(null);
    } else {
      setFilterCategory(parseInt(key, 10));
    }
    setPage(1);
  }, []);

  const handleFilterBrand = useCallback((key) => {
    if (key === "none") {
      setFilterBrand(null);
    } else {
      setFilterBrand(parseInt(key, 10));
    }
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  const handleDeleteClick = useCallback((product) => {
    setProductToDelete(product);
    onOpen();
  }, [onOpen]);

  const handleDeleteProduct = useCallback(async () => {
    if (!productToDelete) return;

    setDeleting(true);
    const token = Cookies.get("access_token");
    try {
      await api.delete(`/products/${productToDelete.id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setProducts((prevProducts) => prevProducts.filter(c => c.id !== productToDelete.id));
      onClose();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      setError("Error al eliminar el producto.");
    } finally {
      setDeleting(false);
    }
  }, [productToDelete, onClose]);

  const columns = [
    { key: 'id', label: '#', sortable: true },
    { key: 'barcode', label: 'Código de Barras', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'retail_price', label: 'Precio Minorista', sortable: true },
    { key: 'wholesale_price', label: 'Precio Mayorista', sortable: true },
    { key: 'weight', label: 'Peso', sortable: false },
    { key: 'category', label: 'Categoría', sortable: true },
    { key: 'brand', label: 'Marca', sortable: true },
    { key: 'actions', label: 'Acciones', sortable: false },
  ];

  const sortedProducts = useMemo(() => {
    if (!sortDescriptor.column) return [...products];
    const sorted = [...products].sort((a, b) => {
      let aValue, bValue;

      if (sortDescriptor.column === 'category') {
        aValue = a.category_details?.name || '';
        bValue = b.category_details?.name || '';
      } else if (sortDescriptor.column === 'brand') {
        aValue = a.brand_details?.name || '';
        bValue = b.brand_details?.name || '';
      } else if (sortDescriptor.column === 'wholesale_price') {
        aValue = a.wholesale_price != null ? parseFloat(a.wholesale_price) : 0;
        bValue = b.wholesale_price != null ? parseFloat(b.wholesale_price) : 0;
      } else if (sortDescriptor.column === 'retail_price') {
        aValue = a.retail_price != null ? parseFloat(a.retail_price) : 0;
        bValue = b.retail_price != null ? parseFloat(b.retail_price) : 0;
      } else {
        aValue = a[sortDescriptor.column] != null ? a[sortDescriptor.column] : '';
        bValue = b[sortDescriptor.column] != null ? b[sortDescriptor.column] : '';
      }

      const aType = typeof aValue;
      const bType = typeof bValue;

      if (aType === 'string' && bType === 'string') {
        return sortDescriptor.direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aType === 'number' && bType === 'number') {
        return sortDescriptor.direction === 'ascending'
          ? aValue - bValue
          : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);
      return sortDescriptor.direction === 'ascending'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
    return sorted;
  }, [products, sortDescriptor]);

  const filteredProducts = useMemo(() => {
    let filtered = [...sortedProducts];

    if (filterCategory) {
      filtered = filtered.filter(product =>
        product.category_details &&
        product.category_details.id === filterCategory
      );
    }

    if (filterBrand) {
      filtered = filtered.filter(product =>
        product.brand_details &&
        product.brand_details.id === filterBrand
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        (product.name && product.name.toLowerCase().includes(query)) ||
        (product.barcode && product.barcode.includes(searchQuery)) ||
        (product.category_details?.name && product.category_details.name.toLowerCase().includes(query)) ||
        (product.brand_details?.name && product.brand_details.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [sortedProducts, filterCategory, filterBrand, searchQuery]);

  const rows = useMemo(() => (
    filteredProducts.map(product => ({
      id: product.id,
      barcode: product.barcode,
      name: product.name,
      retail_price: `${parseFloat(product.retail_price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`,
      wholesale_price: `${product.wholesale_price ? parseFloat(product.wholesale_price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) : ''}`,
      weight: product.weight ? `${parseFloat(product.weight).toLocaleString('es-AR')} ${product.weight_unit}` : '',
      category: product.category_details?.name || '',
      brand: product.brand_details?.name || '',
      actions: (
        <div className="flex space-x-2">
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
              <IconX className="h-5" />
            </Button>
          </Tooltip>
        </div>
      )
    }))
  ), [filteredProducts, handleDeleteClick, router]);

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

      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Productos</p>
        <div className="flex flex-wrap gap-2">
          <Tooltip content="Exportar productos">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconDownload className="h-4 mr-1" />
              Exportar
            </Button>
          </Tooltip>
          <Tooltip content="Listar marcas">
            <Link href="/dashboard/products/brands">
              <Button className="rounded-md bg-black text-white">
                Marcas
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

      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        <Input
          placeholder="Buscar productos"
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
          aria-label="Buscar productos"
          isClearable={true}
        />
        <div className="flex space-x-4">
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                className={`rounded-md border-1.5 ${filterCategory ? 'bg-gray-200' : ''}`}
                aria-label="Filtros de Categoría"
              >
                <IconFilter className="h-4 mr-1" />
                {filterCategory
                  ? `${categories.find(item => item.id === filterCategory)?.name || "Categoría"}`
                  : "Categoría"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Filtros de Categoría" onAction={handleFilterCategory}>
              <DropdownSection showDivider className="max-h-60 overflow-y-auto">
                {categories.map(item => (
                  <DropdownItem key={item.id} value={item.id}>
                    {item.name}
                  </DropdownItem>
                ))}
              </DropdownSection>
              <DropdownItem key="none-category" value="none">
                Quitar Filtro de Categoría
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                className={`rounded-md border-1.5 ${filterBrand ? 'bg-gray-200' : ''}`}
                aria-label="Filtros de Marca"
              >
                <IconFilter className="h-4 mr-1" />
                {filterBrand
                  ? `${brands.find(item => item.id === filterBrand)?.name || "Marca"}`
                  : "Marca"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Filtros de Marca" onAction={handleFilterBrand}>
              <DropdownSection showDivider className="max-h-60 overflow-y-auto">
                {brands.map(item => (
                  <DropdownItem key={item.id} value={item.id}>
                    {item.name}
                  </DropdownItem>
                ))}
              </DropdownSection>
              <DropdownItem key="none-brand" value="none">
                Quitar Filtro de Marca
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

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
            No hay productos para mostrar.
          </div>
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

      {!loading && !error && currentItemsCount !== 0 && (
        <div className='flex flex-col sm:flex-row items-center justify-between mt-4'>
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {currentItemsCount} de {totalItems} productos
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

      <Modal isOpen={isOpen} onOpenChange={onClose} aria-labelledby="modal-title" placement="top-center">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Confirmar Eliminación</ModalHeader>
              <ModalBody>
                <p>
                  ¿Estás seguro de que deseas eliminar el producto <strong>{productToDelete?.name}</strong>?
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
                  onPress={handleDeleteProduct}
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
