"use client";

import { useState, useEffect } from "react";
import { Button, Card, Spinner } from "@nextui-org/react";
import { IconEdit } from "@tabler/icons-react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
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

  const userTypeMap = {
    SELLER: "Vendedor",
    ADMIN: "Administrador",
    DELIVERY: "Repartidor",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner label="Cargando..." />
      </div>
    );
  }

  if (!userData) {
    return <div>Error al cargar los datos del usuario.</div>;
  }

  return (
    <div className="container px-4 py-6 md:w-2/3 lg:w-1/2">
      <div className="flex flex-row justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Perfil</p>
        <Button className="rounded-md bg-black text-white" onPress={() => router.push("/dashboard/profile/edit")}>
          <IconEdit className="w-5" />
          Editar
        </Button>
      </div>
      <Card className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-500">
              Nombre de usuario:
            </p>
            <p className="text-lg text-gray-800">{userData.username}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Nombre:</p>
            <p className="text-lg text-gray-800">{userData.first_name}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Apellido:</p>
            <p className="text-lg text-gray-800">{userData.last_name}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Email:</p>
            <p className="text-lg text-gray-800">{userData.email}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">
              Número de teléfono:
            </p>
            <p className="text-lg text-gray-800">{userData.phone_number}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">
              Tipo de usuario:
            </p>
            <p className="text-lg text-gray-800">
              {userTypeMap[userData.user_type]}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
