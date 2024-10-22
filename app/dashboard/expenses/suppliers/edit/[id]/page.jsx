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
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import useSupplier from "@/app/hooks/useSupplier";
import api from "@/app/axios";

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = params.id;

  const { supplier, loading: supplierLoading, error: supplierError } = useSupplier(supplierId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (supplier) {
      setName(supplier.name || "");
      setPhoneNumber(supplier.phone_number || "");
      setEmail(supplier.email || "");
      setAddress(supplier.address || "");
    }
  }, [supplier]);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhoneNumber = (phone) => {
    return /^\+?\d{10,15}$/.test(phone);
  };

  const handleUpdateSupplier = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!name || !phoneNumber || !email || !address) {
      setError("Por favor, completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      setLoading(false);
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setError("Por favor, ingresa un número de teléfono válido (10-15 dígitos).");
      setLoading(false);
      return;
    }

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

      router.push("/dashboard/expenses/suppliers");
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
      if (error.response && error.response.data) {
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al actualizar el proveedor.");
      }
    } finally {
      setLoading(false);
    }
  }, [name, phoneNumber, email, address, supplierId, router]);

  if (supplierLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg">Cargando...</Spinner>
      </div>
    );
  }

  if (supplierError) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-[92vw]">
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
        <Code color="danger" className="text-wrap">
          {supplierError}
        </Code>
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
