"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
  Select,
  SelectItem,
  Tooltip,
  Textarea
} from "@nextui-org/react";
import { IconEdit, IconArrowLeft } from "@tabler/icons-react";
import { useState, useCallback, useEffect } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditProductPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Para el estado de carga inicial
  const [error, setError] = useState(null);

  const [id, setId] = useState("");
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [brand, setBrand] = useState(null);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const router = useRouter();
  const params = useParams(); // Obtener los parámetros de la URL
  const slug = params.slug; // Asumiendo que el parámetro se llama 'slug'

  // Funciones de Validación
  const isValidPrice = (price) => {
    return /^\d+(\.\d{1,2})?$/.test(price) && parseFloat(price) > 0;
  };

  const isValidBarcode = (barcode) => {
    // Validar que el código de barras tenga entre 8 y 15 dígitos
    return /^\d{8,15}$/.test(barcode);
  };

  // Fetch de Categorías, Marcas y Datos del Producto
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
        setError("Error al cargar las categorías.");
      }
    };

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
        setError("Error al cargar las marcas.");
      }
    };

    const fetchProduct = async () => {
      const token = Cookies.get("access_token");
      try {
        const response = await api.get(`/products/${slug}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        const product = response.data;
        setId(product.id);
        setBarcode(product.barcode);
        setName(product.name);
        setRetailPrice(product.retail_price.toString());
        setWholesalePrice(product.wholesale_price ? product.wholesale_price.toString() : "");
        setWeight(product.weight ? product.weight.toString() : "");
        setWeightUnit(product.weight_unit || null);
        setDescription(product.description || "");
        setCategory(product.category_details.id);
        setBrand(product.brand_details.id);
      } catch (error) {
        console.error("Error al cargar el producto:", error);
        setError("Error al cargar el producto.");
      } finally {
        setInitialLoading(false);
      }
    };

    // Llamar a todas las funciones de fetch
    if (slug) {
      fetchCategories();
      fetchBrands();
      fetchProduct();
    } else {
      setError("No se proporcionó un slug de producto.");
      setInitialLoading(false);
    }
  }, [slug]);

  const handleUpdateProduct = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Validaciones de Campos Requeridos
    if (!barcode || !name || !retailPrice || !category || !brand) {
      setError("Por favor, completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    if (!isValidPrice(retailPrice)) {
      setError("El precio minorista debe ser un número positivo con hasta dos decimales.");
      setLoading(false);
      return;
    }

    if (wholesalePrice && !isValidPrice(wholesalePrice)) {
      setError("El precio mayorista debe ser un número positivo con hasta dos decimales.");
      setLoading(false);
      return;
    }

    // Validación Adicional: Si se proporciona peso, la unidad de peso debe ser válida
    if (weight && !weightUnit) {
      setError("Por favor, seleccione una unidad de peso.");
      setLoading(false);
      return;
    }

    // Preparar Datos para Enviar
    const productData = {
      barcode,
      name,
      retail_price: parseFloat(retailPrice).toFixed(2),
      category: category,
      brand: brand,
    };

    if (wholesalePrice) {
      productData.wholesale_price = parseFloat(wholesalePrice).toFixed(2);
    } else {
      productData.wholesale_price = null;
    }

    if (weight) {
      productData.weight = parseFloat(weight).toFixed(3);
      productData.weight_unit = weightUnit;
    } else {
      productData.weight = null;
      productData.weight_unit = null;
    }

    if (description) {
      productData.description = description;
    } else {
      productData.description = "";
    }

    console.log("Datos Actualizados del Producto:", productData);

    const token = Cookies.get("access_token");
    try {
      await api.put(`/products/${slug}/`, productData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      // Redireccionar tras la actualización exitosa
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      if (error.response && error.response.data) {
        // Mostrar errores específicos de la API
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al actualizar el producto.");
      }
    } finally {
      setLoading(false);
    }
  }, [barcode, name, retailPrice, wholesalePrice, weight, weightUnit, description, category, brand, slug, router]);

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      <div className="flex items-center mb-4 gap-1">
        <Link href="/dashboard/products">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Editar Producto - #{id}</p>
      </div>
      {error && <Code color="danger" className="text-wrap mb-4">{error}</Code>}

      <div className="space-y-4 mt-4">
        <Input
          label="Código de Barras"
          placeholder="Ingrese el código de barras"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          fullWidth
          variant="underlined"
          type="text"
          aria-label="Código de Barras"
          isRequired
        />
        <Input
          label="Nombre"
          placeholder="Ingrese el nombre del producto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          variant="underlined"
          aria-label="Nombre del Producto"
          isRequired
        />
        <Input
          label="Precio Minorista"
          placeholder="Ingrese el precio minorista (Ej: 4500.00)"
          value={retailPrice}
          onChange={(e) => setRetailPrice(e.target.value)}
          fullWidth
          variant="underlined"
          type="number"
          step="0.01"
          min="0"
          aria-label="Precio Minorista"
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">$</span>
            </div>
          }
          isRequired
        />
        <Input
          label="Precio Mayorista"
          placeholder="Ingrese el precio mayorista (Ej: 3500.00)"
          value={wholesalePrice}
          onChange={(e) => setWholesalePrice(e.target.value)}
          fullWidth
          variant="underlined"
          type="number"
          step="0.01"
          min="0"
          aria-label="Precio Mayorista"
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">$</span>
            </div>
          }
        />
        {/* Campos de Peso y Unidad de Peso Alineados */}
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <Input
              label="Peso"
              placeholder="Ingrese el peso del producto (Opcional)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              variant="underlined"
              type="number"
              step="0.001"
              min="0"
              aria-label="Peso del Producto"
            />
          </div>
          <div className="flex-1">
            <Select
              aria-label="Unidad de Peso"
              label="Unidad de Peso"
              placeholder="Seleccione una unidad de peso (Opcional)"
              selectedKeys={weightUnit ? [weightUnit] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                setWeightUnit(selected || null);
              }}
              variant="underlined"
              className="w-full"
            >
              <SelectItem key="g" value="g">Gramos (g)</SelectItem>
              <SelectItem key="kg" value="kg">Kilogramos (kg)</SelectItem>
            </Select>
          </div>
        </div>
        <Textarea
          label="Descripción"
          placeholder="Ingrese una descripción del producto (Opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          variant="underlined"
          aria-label="Descripción del Producto"
        />
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Select
              aria-label="Categoría del Producto"
              label="Categoría"
              placeholder="Seleccione una categoría"
              selectedKeys={category ? [category.toString()] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                setCategory(selected ? parseInt(selected, 10) : null);
              }}
              variant="underlined"
              isRequired
            >
              {categories.map((cat) => (
                <SelectItem key={cat.id.toString()} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Select
              aria-label="Marca del Producto"
              label="Marca"
              placeholder="Seleccione una marca"
              selectedKeys={brand ? [brand.toString()] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                setBrand(selected ? parseInt(selected, 10) : null);
              }}
              variant="underlined"
              isRequired
            >
              {brands.map((br) => (
                <SelectItem key={br.id.toString()} value={br.id.toString()}>
                  {br.name}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleUpdateProduct}
          isDisabled={loading}
          fullWidth
        >
          {loading ? <Spinner size="sm" /> : <><IconEdit className="h-4" /> Actualizar Producto</>}
        </Button>
      </div>
    </div>
  );
}
