"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Link,
  Tooltip,
  Textarea
} from "@nextui-org/react";
import { IconPlus, IconArrowLeft } from "@tabler/icons-react";
import { useState, useCallback } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import useProductCategories from "@/app/hooks/useProductCategories";
import useProductBrands from "@/app/hooks/useProductBrands";

export default function CreateProductPage() {
  const { categories, loading: categoriesLoading, error: categoriesError } = useProductCategories();
  const { productBrands: brands, loading: brandsLoading, error: brandsError } = useProductBrands();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [brand, setBrand] = useState(null);

  const router = useRouter();

  const isValidPrice = (price) => {
    return /^\d+(\.\d{1,2})?$/.test(price) && parseFloat(price) > 0;
  };

  const handleCreateProduct = useCallback(async () => {
    setLoading(true);
    setError(null);

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

    if (weight && !weightUnit) {
      setError("Por favor, seleccione una unidad de peso.");
      setLoading(false);
      return;
    }

    if (name.length > 50) {
      setError("El nombre del producto no puede tener más de 50 caracteres.");
      setLoading(false);
      return;
    }

    const productData = {
      barcode,
      name,
      retail_price: parseFloat(retailPrice).toFixed(2),
      category: category,
      brand: brand,
    };

    if (wholesalePrice) {
      productData.wholesale_price = parseFloat(wholesalePrice).toFixed(2);
    }

    if (weight) {
      productData.weight = parseFloat(weight).toFixed(3);
      productData.weight_unit = weightUnit;
    }

    if (description) {
      productData.description = description;
    }

    const token = Cookies.get("access_token");
    try {
      await api.post("/products/", productData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error al crear producto:", error);
      if (error.response && error.response.data) {
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al crear el producto.");
      }
    } finally {
      setLoading(false);
    }
  }, [barcode, name, retailPrice, wholesalePrice, weight, weightUnit, description, category, brand, router]);

  if (categoriesLoading || brandsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg">Cargando...</Spinner>
      </div>
    );
  }

  if (categoriesError || brandsError) {
    return (
      <div className="text-red-500 text-center p-6">
        {categoriesError || brandsError}
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
        <p className="text-2xl font-bold">Crear nuevo Producto</p>
      </div>
      {error && <Code color="danger" className="text-wrap">{error}</Code>}

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
              aria-label="unit_weight"
              label="Unidad de Peso"
              placeholder="Seleccione una unidad de peso (Opcional)"
              selectedKeys={weightUnit ? [weightUnit] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                setWeightUnit(selected || null);
              }}
              variant="underlined"
              className="w-full"
              data-testid="unit-weight-select"
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
        <div className="flex flex-col md:flex-row md:gap-4">
          <div className="flex-1 space-y-2">
            <Autocomplete
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
                <AutocompleteItem key={cat.id.toString()} value={cat.id.toString()}>
                  {cat.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>
          </div>
          <div className="flex-1 space-y-2">
            <Autocomplete
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
                <AutocompleteItem key={br.id.toString()} value={br.id.toString()}>
                  {br.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleCreateProduct}
          isDisabled={loading}
          fullWidth
        >
          {loading ? <Spinner size="sm" /> : <><IconPlus className="h-4" /> Crear Producto</>}
        </Button>
      </div>
    </div>
  );
}
