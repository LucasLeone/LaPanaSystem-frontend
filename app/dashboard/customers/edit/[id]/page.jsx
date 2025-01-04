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
import { IconEdit, IconArrowLeft } from "@tabler/icons-react";
import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";
import useCustomer from "@/app/hooks/useCustomer";
import api from "@/app/axios";

export default function EditCustomerPage() {
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [errorUpdate, setErrorUpdate] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [customerType, setCustomerType] = useState("minorista");

  const router = useRouter();
  const { id } = useParams();

  const { customer, loading, error } = useCustomer(id);

  useEffect(() => {
    if (customer) {
      setName(customer.name || "");
      setEmail(customer.email || "");
      setPhone(customer.phone_number || "");
      setAddress(customer.address || "");
      setCustomerType(customer.customer_type || "minorista");
    }
  }, [customer]);

  const handleEditCustomer = useCallback(async () => {
    setLoadingUpdate(true);
    setErrorUpdate(null);

    if (!name || !customerType) {
      setErrorUpdate("El nombre y el tipo de cliente son obligatorios.");
      setLoadingUpdate(false);
      return;
    }

    const token = Cookies.get("access_token");
    try {
      await api.put(`/customers/${id}/`, {
        name,
        email,
        phone_number: phone,
        address,
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
      console.error("Error al actualizar cliente:", error);
      setErrorUpdate("Error al actualizar el cliente.");
    } finally {
      setLoadingUpdate(false);
    }
  }, [name, email, phone, address, customerType, id, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg">Cargando...</Spinner>
      </div>
    );
  }

  if (error) {
    return <Code color='danger' className='text-wrap'>{error}</Code>;
  }

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
        <p className="text-2xl font-bold">Editar Cliente - #{id}</p>
      </div>

      {errorUpdate && <Code color='danger' className='text-wrap'>{errorUpdate}</Code>}

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
          placeholder="Ingrese el número de celular"
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
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value)}
            variant="underlined"
            selectedKeys={[customerType]}
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
          onPress={handleEditCustomer}
          isDisabled={loadingUpdate}
          fullWidth
        >
          {loadingUpdate ? <Spinner size="sm" /> : <><IconEdit className="h-4" /> Actualizar Cliente</>}
        </Button>
      </div>
    </div>
  );
}
