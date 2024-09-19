"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
  Tooltip,
} from "@nextui-org/react";
import { IconEdit, IconArrowLeft } from "@tabler/icons-react";
import { useState, useCallback, useEffect } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link"; // Importa Link desde 'next/link'

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = params.id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // Funciones de Validación
  const isValidEmail = (email) => {
    // Expresión regular para validar email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhoneNumber = (phone) => {
    // Validar que el número de teléfono tenga entre 10 y 15 dígitos, puede incluir + al inicio
    return /^\+?\d{10,15}$/.test(phone);
  };

  // Fetch de Datos del Proveedor
  useEffect(() => {
    const fetchSupplier = async () => {
      setInitialLoading(true);
      setError(null);
      const token = Cookies.get("access_token");
      try {
        const response = await api.get(`/suppliers/${supplierId}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        const supplier = response.data;
        setName(supplier.name);
        setPhoneNumber(supplier.phone_number);
        setEmail(supplier.email);
        setAddress(supplier.address);
      } catch (error) {
        console.error("Error al cargar el proveedor:", error);
        setError("Error al cargar los datos del proveedor.");
      } finally {
        setInitialLoading(false);
      }
    };
    if (supplierId) {
      fetchSupplier();
    }
  }, [supplierId]);

  const handleUpdateSupplier = useCallback(async () => {
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
      await api.put(`/suppliers/${supplierId}/`, supplierData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      // Redireccionar tras la actualización exitosa
      router.push("/dashboard/expenses/suppliers");
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
      if (error.response && error.response.data) {
        // Mostrar errores específicos de la API
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al actualizar el proveedor.");
      }
    } finally {
      setLoading(false);
    }
  }, [name, phoneNumber, email, address, supplierId, router]);

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
        <Link href="/dashboard/expenses/suppliers">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Modificar Proveedor</p>
      </div>

      {/* Mostrar Errores */}
      {error && <Code color="danger" className="text-wrap">{error}</Code>}

      {/* Formulario de Edición */}
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

      {/* Botón de Actualización */}
      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleUpdateSupplier}
          isDisabled={loading}
          fullWidth
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <IconEdit className="h-4 mr-1" /> Actualizar Proveedor
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
