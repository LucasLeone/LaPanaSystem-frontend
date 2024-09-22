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
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";

export default function EditEmployeePage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Estado para carga inicial
  const [error, setError] = useState(null);

  // Estados para los campos del formulario
  const [id, setId] = useState(null);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userType, setUserType] = useState(null);
  const [password, setPassword] = useState("");

  const router = useRouter();
  const params = useParams();
  const employeeUsername = params.username;

  // Mapeo de traducción para user_type
  const USER_TYPE_LABELS = {
    seller: "Vendedor",
    delivery: "Repartidor",
    admin: "Administrador",
    // Agrega más tipos si existen
  };

  // Opciones para el Select de Tipo de Usuario
  const userTypeOptions = [
    { key: "seller", label: "Vendedor" },
    { key: "delivery", label: "Repartidor" },
    { key: "admin", label: "Administrador" },
    // Agrega más tipos según tus necesidades
  ];

  // Funciones de Validación
  const isValidEmail = (email) => {
    // Expresión regular básica para validar el correo electrónico
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhoneNumber = (phone) => {
    // Validar que el número de teléfono tenga entre 10 y 15 dígitos
    return /^\+?\d{10,15}$/.test(phone);
  };

  // Fetch de datos del empleado
  useEffect(() => {
    const fetchEmployee = async () => {
      setInitialLoading(true);
      setError(null);
      const token = Cookies.get("access_token");
      try {
        const response = await api.get(`/users/${employeeUsername}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        const data = response.data;
        setId(data.id);
        setUsername(data.username || "");
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setEmail(data.email || "");
        setPhoneNumber(data.phone_number || "");
        setUserType(data.user_type ? data.user_type.toLowerCase() : null);
      } catch (error) {
        console.error("Error al cargar los datos del empleado:", error);
        setError("Error al cargar los datos del empleado.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (employeeUsername) {
      fetchEmployee();
    } else {
      setError("ID de empleado no proporcionado.");
      setInitialLoading(false);
    }
  }, [employeeUsername]);

  const handleUpdateEmployee = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Validaciones de campos obligatorios
    if (!username || !firstName || !lastName || !email || !userType || !phoneNumber) {
      setError("Por favor, completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    // Validación del formato del correo electrónico
    if (!isValidEmail(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      setLoading(false);
      return;
    }

    // Validación del número de teléfono
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      setError("Por favor, ingresa un número de teléfono válido.");
      setLoading(false);
      return;
    }

    // Validación de la contraseña si se proporciona
    if (password && password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }

    // Preparar Datos para Enviar
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

      // Redireccionar tras la actualización exitosa
      router.push("/dashboard/employees");
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      if (error.response && error.response.data) {
        // Mostrar errores específicos de la API
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al actualizar el empleado.");
      }
    } finally {
      setLoading(false);
    }
  }, [username, firstName, lastName, email, phoneNumber, userType, password, employeeUsername, router]);

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
        <Link href="/dashboard/employees">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Modificar Empleado - #{id}</p>
      </div>

      {/* Mostrar errores */}
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
            <Spinner size="sm" />
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
