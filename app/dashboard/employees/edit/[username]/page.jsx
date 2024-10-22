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
} from "@nextui-org/react";
import { IconEdit, IconArrowLeft } from "@tabler/icons-react";
import { useState, useCallback, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";
import useUser from "@/app/hooks/useUser";
import api from "@/app/axios";

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const employeeUsername = params.username;

  const { user, loading: userLoading, error: userError } = useUser(employeeUsername);

  const [id, setId] = useState(null);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userType, setUserType] = useState(null);
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userTypeOptions = [
    { key: "seller", label: "Vendedor" },
    { key: "delivery", label: "Repartidor" },
    { key: "admin", label: "Administrador" },
  ];

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhoneNumber = (phone) => {
    return /^\+?\d{10,15}$/.test(phone);
  };

  useEffect(() => {
    if (user) {
      setId(user.id);
      setUsername(user.username || "");
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phone_number || "");
      setUserType(user.user_type ? user.user_type.toLowerCase() : null);
    }
  }, [user]);

  const handleUpdateEmployee = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!username || !firstName || !lastName || !email || !userType || !phoneNumber) {
      setError("Por favor, completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      setLoading(false);
      return;
    }

    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      setError("Por favor, ingresa un número de teléfono válido.");
      setLoading(false);
      return;
    }

    if (password && password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }

    const employeeData = {
      username: username.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      user_type: userType.toUpperCase(),
      phone_number: phoneNumber.trim(),
    };

    if (password) {
      employeeData.password = password.trim();
    }

    const token = Cookies.get("access_token");
    try {
      await api.put(`/users/${employeeUsername}/`, employeeData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      router.push("/dashboard/employees");
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      if (error.response && error.response.data) {
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al actualizar el empleado.");
      }
    } finally {
      setLoading(false);
    }
  }, [username, firstName, lastName, email, phoneNumber, userType, password, employeeUsername, router]);

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg">Cargando...</Spinner>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      {/* Encabezado */}
      <div className="flex items-center mb-4 gap-1">
        <Link href="/dashboard/employees">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Modificar Empleado - #{id}</p>
      </div>

      {/* Mostrar errores de carga del usuario */}
      {userError && (
        <Code color="danger" className="text-wrap">
          {userError}
        </Code>
      )}

      {/* Mostrar errores de actualización */}
      {error && (
        <Code color="danger" className="text-wrap">
          {error}
        </Code>
      )}

      {/* Formulario */}
      <div className="space-y-4 mt-4">
        <Input
          label="Usuario"
          placeholder="Ingrese el nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          variant="underlined"
          type="text"
          aria-label="Usuario"
          isRequired
        />
        <Input
          label="Nombre"
          placeholder="Ingrese el nombre del empleado"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
          variant="underlined"
          type="text"
          aria-label="Nombre del Empleado"
          isRequired
        />
        <Input
          label="Apellido"
          placeholder="Ingrese el apellido del empleado"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
          variant="underlined"
          type="text"
          aria-label="Apellido del Empleado"
          isRequired
        />
        <Input
          label="Correo Electrónico"
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
          label="Número de Teléfono"
          placeholder="Ingrese el número de teléfono"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          fullWidth
          variant="underlined"
          type="tel"
          aria-label="Número de Teléfono"
          isRequired
        />
        <Select
          aria-label="Tipo de Usuario"
          label="Tipo de Usuario"
          placeholder="Seleccione un tipo de usuario"
          selectedKeys={userType ? [userType] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            setUserType(selected || null);
          }}
          variant="underlined"
          isRequired
        >
          {userTypeOptions.map((type) => (
            <SelectItem key={type.key} value={type.key}>
              {type.label}
            </SelectItem>
          ))}
        </Select>
        <Input
          label="Contraseña"
          placeholder="Ingrese la nueva contraseña (Opcional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          variant="underlined"
          type="password"
          aria-label="Contraseña"
        />
      </div>

      {/* Botón de Actualizar Empleado */}
      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleUpdateEmployee}
          isDisabled={loading}
          fullWidth
        >
          {loading ? (
            <Spinner size="sm">Cargando...</Spinner>
          ) : (
            <>
              <IconEdit className="h-4 mr-1" /> Actualizar Empleado
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
