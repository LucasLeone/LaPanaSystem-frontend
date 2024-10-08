"use client";

import { useState, useEffect } from "react";
import { Button, Card, Input, Link, Tooltip, Spinner } from "@nextui-org/react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";

export default function EditProfilePage() {
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = Cookies.get("access_token");
      const user = JSON.parse(Cookies.get("user"));
      try {
        const response = await api.get(`/users/${user.username}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get("access_token");
    const user = JSON.parse(Cookies.get("user"));
    try {
      await api.put(
        `/users/${user.username}/`,
        {
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          phone_number: userData.phone_number,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      router.push("/dashboard/profile");
    } catch (error) {
      console.error("Error al actualizar los datos del usuario:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner label="Cargando..." />
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-6 md:w-2/3 lg:w-1/2">
      <div className="flex items-center mb-4 gap-1">
        <Link href="/dashboard/profile">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Modificar Perfil</p>
      </div>
      <Card className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          <div>
            <label className="text-sm font-semibold text-gray-500">
              Nombre:
            </label>
            <Input
              name="first_name"
              value={userData.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-500">
              Apellido:
            </label>
            <Input
              name="last_name"
              value={userData.last_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-500">
              Email:
            </label>
            <Input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-500">
              Número de teléfono:
            </label>
            <Input
              name="phone_number"
              value={userData.phone_number}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="rounded-md bg-black text-white">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
