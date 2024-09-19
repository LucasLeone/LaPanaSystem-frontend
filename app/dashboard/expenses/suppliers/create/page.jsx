"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
  Link,
  Tooltip,
} from "@nextui-org/react";
import { IconPlus, IconArrowLeft } from "@tabler/icons-react";
import { useState, useCallback } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function CreateSupplierPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const router = useRouter();

  // Funciones de Validación
  const isValidEmail = (email) => {
    // Expresión regular para validar email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhoneNumber = (phone) => {
    // Validar que el número de teléfono tenga entre 10 y 15 dígitos, puede incluir + al inicio
    return /^\+?\d{10,15}$/.test(phone);
  };

  const handleCreateSupplier = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Validaciones de campos requeridos
    if (!name || !phoneNumber || !email || !address) {
      setError("Por favor, completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    // Validación de formato de email
    if (!isValidEmail(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      setLoading(false);
      return;
    }

    // Validación de formato de número de teléfono
    if (!isValidPhoneNumber(phoneNumber)) {
      setError("Por favor, ingresa un número de teléfono válido (10-15 dígitos).");
      setLoading(false);
      return;
    }

    // Preparar Datos para Enviar
    const supplierData = {
      name,
      phone_number: phoneNumber,
      email,
      address,
    };

    const token = Cookies.get("access_token");
    try {
      await api.post("/suppliers/", supplierData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      // Redireccionar tras la creación exitosa
      router.push("/dashboard/expenses/suppliers");
    } catch (error) {
      console.error("Error al crear proveedor:", error);
      if (error.response && error.response.data) {
        // Mostrar errores específicos de la API
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al crear el proveedor.");
      }
    } finally {
      setLoading(false);
    }
  }, [name, phoneNumber, email, address, router]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      {/* Encabezado */}
      <div className="flex items-center mb-4 gap-1">
        <Link href="/dashboard/expenses/suppliers">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Crear nuevo Proveedor</p>
      </div>

      {/* Mostrar Errores */}
      {error && <Code color="danger" className="text-wrap">{error}</Code>}

      {/* Formulario de Creación */}
      <div className="space-y-4 mt-4">
        <Input
          label="Nombre"
          placeholder="Ingrese el nombre del proveedor"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          variant="underlined"
          type="text"
          aria-label="Nombre del Proveedor"
          isRequired
        />
        <Input
          label="Número de Teléfono"
          placeholder="Ingrese el número de teléfono (Ej: +54935348123231)"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          fullWidth
          variant="underlined"
          type="tel"
          aria-label="Número de Teléfono"
          isRequired
        />
        <Input
          label="Email"
          placeholder="Ingrese el correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          variant="underlined"
          type="email"
          aria-label="Correo Electrónico"
          isRequired
        />
        <Input
          label="Dirección"
          placeholder="Ingrese la dirección del proveedor"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          fullWidth
          variant="underlined"
          type="text"
          aria-label="Dirección"
          isRequired
        />
      </div>

      {/* Botón de Creación */}
      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleCreateSupplier}
          isDisabled={loading}
          fullWidth
        >
          {loading ? <Spinner size="sm" /> : <><IconPlus className="h-4" /> Crear Proveedor</>}
        </Button>
      </div>
    </div>
  );
}