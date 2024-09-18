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
import { IconCheck, IconArrowLeft } from "@tabler/icons-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";

export default function EditCustomerPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [customerType, setCustomerType] = useState("minorista");

  const router = useRouter();
  const { id } = useParams(); // Obtener el ID del cliente desde la URL

  // Función para obtener los detalles del cliente
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      setLoading(true);
      setError(null);
      const token = Cookies.get("access_token");

      try {
        const response = await api.get(`/customers/${id}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        const { name, email, phone_number, address, customer_type } = response.data;

        setName(name);
        setEmail(email);
        setPhone(phone_number);
        setAddress(address);
        setCustomerType(customer_type);
      } catch (error) {
        console.error("Error al cargar los detalles del cliente:", error);
        setError("Error al cargar los detalles del cliente.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [id]);

  const handleEditCustomer = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!name || !email || !phone || !address) {
      setError("Todos los campos son requeridos.");
      setLoading(false);
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
      setError("Error al actualizar el cliente.");
    } finally {
      setLoading(false);
    }
  }, [name, email, phone, address, customerType, id, router]);

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
      {error && <Code color='danger' className='text-wrap'>{error}</Code>}

      <div className="space-y-4 mt-4">
        <Input
          label="Nombre"
          placeholder="Ingrese el nombre del cliente"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          variant="underlined"
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
          isDisabled={loading}
          fullWidth
        >
          {loading ? <Spinner size="sm" /> : <><IconCheck className="h-4" /> Actualizar Cliente</>}
        </Button>
      </div>
    </div>
  );
}
