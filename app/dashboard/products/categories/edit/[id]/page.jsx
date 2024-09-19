"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
  Textarea,
  Link,
  Tooltip
} from "@nextui-org/react";
import { IconEdit, IconArrowLeft } from "@tabler/icons-react";
import { useState, useCallback, useEffect } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";

export default function EditCategoryPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Para la carga inicial de datos
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const router = useRouter();
  const params = useParams(); // Obtener parámetros de la URL
  const { id } = params; // Asumiendo que la ruta es /dashboard/products/categories/edit/[id]

  // Función de Validación
  const isValidName = (name) => {
    return name.trim().length > 0;
  };

  // Fetch de datos de la categoría al montar el componente
  useEffect(() => {
    const fetchCategory = async () => {
      setInitialLoading(true);
      setError(null);
      const token = Cookies.get("access_token");
      try {
        const response = await api.get(`/product-categories/${id}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setName(response.data.name);
        setDescription(response.data.description || "");
      } catch (error) {
        console.error("Error al cargar la categoría:", error);
        setError("Error al cargar la categoría.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    } else {
      setError("ID de categoría no proporcionado.");
      setInitialLoading(false);
    }
  }, [id]);

  const handleUpdateCategory = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Validaciones
    if (!name) {
      setError("Por favor, completa el campo de nombre.");
      setLoading(false);
      return;
    }

    if (!isValidName(name)) {
      setError("El nombre de la categoría no puede estar vacío.");
      setLoading(false);
      return;
    }

    if (name.length > 30) {
      setError("El nombre de la marca no puede exceder los 30 caracteres.");
      setLoading(false);
      return;
    }

    if (description.length > 255) {
      setError("La descripción no puede exceder los 255 caracteres.");
      setLoading(false);
      return;
    }

    // Preparar Datos para Enviar
    const categoryData = {
      name: name.trim(),
      description: description.trim(),
    };

    const token = Cookies.get("access_token");
    try {
      await api.patch(`/product-categories/${id}/`, categoryData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      // Redireccionar tras la actualización exitosa
      router.push("/dashboard/products/categories");
    } catch (error) {
      console.error("Error al actualizar la categoría:", error);
      if (error.response && error.response.data) {
        // Mostrar errores específicos de la API
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al actualizar la categoría.");
      }
    } finally {
      setLoading(false);
    }
  }, [id, name, description, router]);

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
            <div className="flex items-center mb-4 gap-1">
        <Link href="/dashboard/products/categories">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Editar Categoría - #{id}</p>
      </div>
      {error && <Code color="danger" className="text-wrap">{error}</Code>}

      <div className="space-y-4 mt-4">
        <Input
          label="Nombre"
          placeholder="Ingrese el nombre de la categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          variant="underlined"
          type="text"
          aria-label="Nombre de la Categoría"
          isRequired
        />
        <Textarea
          label="Descripción"
          placeholder="Ingrese una descripción de la categoría (Opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          variant="underlined"
          aria-label="Descripción de la Categoría"
        />
      </div>

      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleUpdateCategory}
          isDisabled={loading}
          fullWidth
        >
          {loading ? <Spinner size="sm" /> : <><IconEdit className="h-4 mr-1" /> Actualizar Categoría</>}
        </Button>
      </div>
    </div>
  );
}
