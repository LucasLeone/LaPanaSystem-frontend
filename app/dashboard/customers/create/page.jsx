"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
  Select,
  SelectItem,
  Link,
  Tooltip
} from "@nextui-org/react";
import { IconPlus, IconArrowLeft } from "@tabler/icons-react";
import { useState, useCallback } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function CreateCustomerPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [customerType, setCustomerType] = useState("");

  const router = useRouter();

  const isValidEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^\+?1?\d{9,15}$/;
    return phoneRegex.test(phone);
  };

  const handleCreateCustomer = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!name || !customerType) {
      setError("El nombre y el tipo de cliente son obligatorios.");
      setLoading(false);
      return;
    }

    if (customerType === "mayorista" && !address) {
      setError("Los clientes mayoristas deben tener una dirección.");
      setLoading(false);
      return;
    }

    if (email && !isValidEmail(email)) {
      setError("Correo electrónico inválido.");
      setLoading(false);
      return;
    }

    if (phone && !isValidPhoneNumber(phone)) {
      setError("El número de teléfono debe estar en el formato +999999999 y tener entre 9 y 15 dígitos.");
      setLoading(false);
      return;
    }

    const token = Cookies.get("access_token");
    try {
      await api.post("/customers/",
        {
          name,
          email: email || null,
          phone_number: phone || null,
          address: address || null,
          customer_type: customerType,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      router.push('/dashboard/customers');
    } catch (error) {
      console.error("Error al crear cliente:", error);
      setError("Error al crear el cliente.");
    } finally {
      setLoading(false);
    }
  }, [name, email, phone, address, customerType, router]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      <div className="flex items-center mb-4 gap-1">
        <Link href="/dashboard/customers">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Crear nuevo Cliente</p>
      </div>
      {error && <Code color='danger' className='text-wrap'>{error}</Code>}

      <div className="space-y-4 mt-4">
        <Input
          label="Nombre"
          placeholder="Ingrese el nombre del cliente"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          variant="underlined"
          isRequired
        />
        <Input
          label="Correo Electrónico"
          placeholder="Ingrese el correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          type="email"
          variant="underlined"
        />
        <Input
          label="Celular"
          placeholder="Ingrese el número de celular (Ej: +5491112345678)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          type="tel"
          variant="underlined"
        />
        <Input
          label="Dirección"
          placeholder="Ingrese la dirección del cliente"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          fullWidth
          variant="underlined"
        />
        <div className="space-y-2">
          <label className="block font-medium">Tipo de Cliente</label>
          <Select
            aria-label="Tipo de Cliente"
            label="Tipo de Cliente"
            value={customerType}
            onSelectionChange={(value) => setCustomerType(value ? Array.from(value)[0] : '')}
            variant="underlined"
            isRequired
          >
            <SelectItem key="minorista" value="minorista">Minorista</SelectItem>
            <SelectItem key="mayorista" value="mayorista">Mayorista</SelectItem>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleCreateCustomer}
          isDisabled={loading}
          fullWidth
        >
          {loading ? <Spinner size="sm">Cargando...</Spinner> : <><IconPlus className="h-4" /> Crear Cliente</>}
        </Button>
      </div>
    </div>
  );
}
