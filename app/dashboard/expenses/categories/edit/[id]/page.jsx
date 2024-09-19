"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
  Textarea,
  Link,
  Tooltip,
} from "@nextui-org/react";
import { IconArrowLeft, IconEdit } from "@tabler/icons-react";
import { useState, useCallback, useEffect } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";

export default function EditExpenseCategoryPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Para carga inicial de datos
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const router = useRouter();
  const params = useParams();
  const categoryId = params.id; // Obtener el ID de la categoría desde la URL

  // Función de Validación
  const isValidName = (name) => {
    return name.trim().length > 0;
  };

  // Fetch de datos de la categoría a editar
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) {
        setError("ID de categoría no proporcionado en la URL.");
        setInitialLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const token = Cookies.get("access_token");
      try {
        const response = await api.get(`/expense-categories/${categoryId}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        const category = response.data;
        setName(category.name);
        setDescription(category.description || "");
      } catch (error) {
        console.error("Error al cargar la categoría:", error);
        setError("Error al cargar la categoría.");
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

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
      setError("El nombre de la categoría no puede exceder los 30 caracteres.");
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
      await api.put(`/expense-categories/${categoryId}/`, categoryData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      // Redireccionar tras la actualización exitosa
      router.push("/dashboard/expenses/categories");
    } catch (error) {
      console.error("Error al actualizar la categoría de gastos:", error);
      if (error.response && error.response.data) {
        // Mostrar errores específicos de la API
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al actualizar la categoría de gastos.");
      }
    } finally {
      setLoading(false);
    }
  }, [name, description, categoryId, router]);

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      {/* Encabezado */}
      <div className="flex items-center mb-4 gap-1">
        <Link href="/dashboard/expenses/categories">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Editar Categoría de Gastos</p>
      </div>

      {/* Mostrar Errores */}
      {error && <Code color="danger" className="text-wrap">{error}</Code>}

      {/* Formulario */}
      <div className="space-y-4 mt-4">
        <Input
          label="Nombre"
          placeholder="Ingrese el nombre de la categoría de gastos"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          variant="underlined"
          type="text"
          aria-label="Nombre de la Categoría de Gastos"
          isRequired
        />
        <Textarea
          label="Descripción"
          placeholder="Ingrese una descripción de la categoría de gastos (Opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          variant="underlined"
          aria-label="Descripción de la Categoría de Gastos"
        />
      </div>

      {/* Botón de Actualizar Categoría */}
      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleUpdateCategory}
          isDisabled={loading}
          fullWidth
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <IconEdit className="h-4 mr-1" /> Actualizar Categoría
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
