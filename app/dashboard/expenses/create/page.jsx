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
import { useState, useCallback, useEffect, useMemo } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import useExpenseCategories from "@/app/hooks/useExpenseCategories";
import useSuppliers from "@/app/hooks/useSuppliers";

export default function CreateExpensePage() {
  const router = useRouter();

  const {
    expenseCategories: categories,
    loadingCategories,
    errorCategories,
  } = useExpenseCategories();

  const {
    suppliers,
    loadingSuppliers,
    errorSuppliers,
  } = useSuppliers();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getTodayDate());
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [supplier, setSupplier] = useState(null);

  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const isValidAmount = (amt) => {
    return /^\d+(\.\d{1,2})?$/.test(amt) && parseFloat(amt) > 0;
  };

  const isValidDate = (dateString) => {
    return !isNaN(new Date(dateString).getTime());
  };

  const handleCreateExpense = useCallback(async () => {
    setLoading(true);
    setError(null);

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

    const expenseData = {
      amount: parseFloat(amount).toFixed(2),
      date: date,
      category: category,
      supplier: supplier,
    };

    if (description) {
      expenseData.description = description.trim();
    }

    const token = Cookies.get("access_token");
    try {
      await api.post("/expenses/", expenseData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      router.push("/dashboard/expenses");
    } catch (error) {
      console.error("Error al crear gasto:", error);
      if (error.response && error.response.data) {
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al crear el gasto.");
      }
    } finally {
      setLoading(false);
    }
  }, [amount, date, description, category, supplier, router]);

  const isLoading = loadingCategories || loadingSuppliers || loading;
  const hasError = errorCategories || errorSuppliers || error;

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      
      <div className="flex items-center mb-4 gap-1">
        <Link href="/dashboard/expenses">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Crear nuevo Gasto</p>
      </div>

      {hasError && (
        <Code color="danger" className="text-wrap">
          {error || errorCategories || errorSuppliers}
        </Code>
      )}

      {isLoading && (
        <div className="flex justify-center items-center my-6">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && (
        <div className="space-y-4 mt-4">
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

          <Textarea
            label="Descripción"
            placeholder="Ingrese una descripción del gasto"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            variant="underlined"
            aria-label="Descripción del Gasto"
            isRequired
          />

          <div className="flex flex-col md:flex-row md:gap-4">
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
      )}

      {!isLoading && (
        <div className="mt-6">
          <Button
            className="rounded-md bg-black text-white"
            onPress={handleCreateExpense}
            isDisabled={loading}
            fullWidth
          >
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <IconPlus className="h-4 mr-1" /> Crear Gasto
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
