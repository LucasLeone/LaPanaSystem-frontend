"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
  Select,
  SelectItem,
  Link,
  Tooltip,
  Textarea,
} from "@nextui-org/react";
import { IconPlus, IconArrowLeft } from "@tabler/icons-react";
import { useState, useCallback, useEffect } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function CreateExpensePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getTodayDate()); // Establecer fecha predeterminada
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [supplier, setSupplier] = useState(null);

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const router = useRouter();

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript van de 0 a 11
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Funciones de Validación
  const isValidAmount = (amt) => {
    return /^\d+(\.\d{1,2})?$/.test(amt) && parseFloat(amt) > 0;
  };

  const isValidDate = (dateString) => {
    return !isNaN(new Date(dateString).getTime());
  };

  // Fetch de Categorías y Proveedores
  useEffect(() => {
    const fetchCategories = async () => {
      const token = Cookies.get("access_token");
      try {
        const response = await api.get("/expense-categories/", {
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

    const fetchSuppliers = async () => {
      const token = Cookies.get("access_token");
      try {
        const response = await api.get("/suppliers/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setSuppliers(response.data);
      } catch (error) {
        console.error("Error al cargar los proveedores:", error);
        setError("Error al cargar los proveedores.");
      }
    };

    fetchCategories();
    fetchSuppliers();
  }, []);

  const handleCreateExpense = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Validaciones
    if (!amount || !date || !category || !supplier) {
      setError("Por favor, completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    if (!isValidAmount(amount)) {
      setError("El monto debe ser un número positivo con hasta dos decimales.");
      setLoading(false);
      return;
    }

    if (!isValidDate(date)) {
      setError("Por favor, ingresa una fecha válida.");
      setLoading(false);
      return;
    }

    // Preparar Datos para Enviar
    const expenseData = {
      amount: parseFloat(amount).toFixed(2),
      date: date, // Enviar como 'YYYY-MM-DD'
      category: category,
      supplier: supplier,
    };

    if (description) {
      expenseData.description = description;
    }

    const token = Cookies.get("access_token");
    try {
      await api.post("/expenses/", expenseData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      // Redireccionar tras la creación exitosa
      router.push("/dashboard/expenses");
    } catch (error) {
      console.error("Error al crear gasto:", error);
      if (error.response && error.response.data) {
        // Mostrar errores específicos de la API
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al crear el gasto.");
      }
    } finally {
      setLoading(false);
    }
  }, [amount, date, description, category, supplier, router]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      {/* Encabezado */}
      <div className="flex items-center mb-4 gap-1">
        <Link href="/dashboard/expenses">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Crear Nuevo Gasto</p>
      </div>

      {/* Mostrar Errores */}
      {error && (
        <Code color="danger" className="text-wrap">
          {error}
        </Code>
      )}

      {/* Formulario */}
      <div className="space-y-4 mt-4">
        {/* Monto */}
        <Input
          label="Monto"
          placeholder="Ingrese el monto (Ej: 220000.00)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
          variant="underlined"
          type="number"
          step="0.01"
          min="0"
          aria-label="Monto del Gasto"
          isRequired
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">$</span>
            </div>
          }
        />

        {/* Fecha */}
        <Input
          label="Fecha"
          placeholder="Seleccione la fecha"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          variant="underlined"
          type="date"
          aria-label="Fecha del Gasto"
          isRequired
        />

        {/* Descripción */}
        <Textarea
          label="Descripción"
          placeholder="Ingrese una descripción del gasto (Opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          variant="underlined"
          aria-label="Descripción del Gasto"
        />

        {/* Categoría y Proveedor */}
        <div className="flex flex-col md:flex-row md:gap-4">
          {/* Categoría */}
          <div className="flex-1 space-y-2">
            <Select
              aria-label="Categoría del Gasto"
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

          {/* Proveedor */}
          <div className="flex-1 space-y-2">
            <Select
              aria-label="Proveedor del Gasto"
              label="Proveedor"
              placeholder="Seleccione un proveedor"
              selectedKeys={supplier ? [supplier.toString()] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                setSupplier(selected ? parseInt(selected, 10) : null);
              }}
              variant="underlined"
              isRequired
            >
              {suppliers.map((sup) => (
                <SelectItem key={sup.id.toString()} value={sup.id.toString()}>
                  {sup.name}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Botón de Crear Gasto */}
      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleCreateExpense}
          isDisabled={loading}
          fullWidth
        >
          {loading ? <Spinner size="sm" /> : <><IconPlus className="h-4 mr-1" /> Crear Gasto</>}
        </Button>
      </div>
    </div>
  );
}
