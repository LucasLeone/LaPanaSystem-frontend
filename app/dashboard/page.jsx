"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Card, CardBody, CardHeader, Spinner, Divider, Link } from "@nextui-org/react";
import {
  IconPackage,
  IconUsers,
  IconCreditCard,
  IconShoppingCart,
  IconUser,
  IconUsersGroup,
  IconChartBar,
  IconArrowBackUp,
  IconTruckDelivery,
  IconCash
} from "@tabler/icons-react";
import NextLink from 'next/link';
import { motion } from "framer-motion"; // Para animaciones opcionales

export default function DashboardHome() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userCookie = Cookies.get('user');

    if (userCookie) {
      try {
        const decodedCookie = decodeURIComponent(userCookie);
        const userData = JSON.parse(decodedCookie);
        setUser(userData);
      } catch (error) {
        console.error("Error al parsear la cookie del usuario:", error);
      }
    }

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg">Cargando...</Spinner>
      </div>
    );
  }

  // Definir los módulos con roles permitidos
  const dashboardModules = [
    {
      label: "Estadísticas",
      path: "/dashboard/statistics",
      icon: <IconChartBar className="w-6" />,
      rolesAllowed: ["ADMIN"],
      description: "Estadísticas y gráficos de ventas, gastos y clientes."
    },
    {
      label: "Productos",
      path: "/dashboard/products",
      icon: <IconPackage className="w-6" />,
      rolesAllowed: ["ADMIN", "SELLER"],
      description: "Gestiona los productos de tu panadería."
    },
    {
      label: "Clientes",
      path: "/dashboard/customers",
      icon: <IconUsersGroup className="w-6" />,
      rolesAllowed: ["ADMIN"],
      description: "Administra tus clientes y sus pedidos diarios en caso de mayoristas."
    },
    {
      label: "Gastos",
      path: "/dashboard/expenses",
      icon: <IconCreditCard className="w-6" />,
      rolesAllowed: ["ADMIN", "SELLER"],
      description: "Controla los gastos operativos."
    },
    {
      label: "Ventas",
      path: "/dashboard/sales",
      icon: <IconShoppingCart className="w-6" />,
      rolesAllowed: ["ADMIN", "SELLER"],
      description: "Registra y lista las ventas realizadas."
    },
    {
      label: "Devoluciones",
      path: "/dashboard/returns",
      icon: <IconArrowBackUp className="w-6" />,
      rolesAllowed: ["ADMIN", "DELIVERY"],
      description: "Gestiona las devoluciones para realizar el cobro correspondiente."
    },
    {
      label: "Empleados",
      path: "/dashboard/employees",
      icon: <IconUsers className="w-6" />,
      rolesAllowed: ["ADMIN"],
      description: "Administra información de tus empleados."
    },
    {
      label: "Repartir",
      path: "/dashboard/delivery",
      icon: <IconTruckDelivery className="w-6" />,
      rolesAllowed: ["ADMIN", "DELIVERY"],
      description: "Empieza el proceso de reparto de pedidos."
    },
    {
      label: "Cobrar",
      path: "/dashboard/collect",
      icon: <IconCash className="w-6" />,
      rolesAllowed: ["ADMIN", "DELIVERY"],
      description: "Realiza el cobro de las ventas realizadas."
    },
    {
      label: "Perfil",
      path: "/dashboard/profile",
      icon: <IconUser className="w-6" />,
      rolesAllowed: ["ADMIN", "DELIVERY", "SELLER"],
      description: "Administra tu información personal."
    },
  ];

  return (
    <div className="container mx-auto shadow-md p-6 pb-0">
      {/* Saludo al Usuario */}
      <div className="flex flex-wrap items-center gap-1">
        <IconUser className="w-6" />
        <p className="text-2xl font-semibold">
          Bienvenido, {user ? `${user.first_name} ${user.last_name}` : 'Invitado'}
        </p>
      </div>

      {/* Texto Descriptivo */}
      <p className="mt-4">
        Bienvenido al dashboard de PanaSystem. Aquí puedes gestionar todas las áreas de tu panadería de manera eficiente.
      </p>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {dashboardModules.map((module) => {
          const isDisabled = !module.rolesAllowed.includes(user.user_type.toUpperCase());

          return (
            <Link href={module.path} passHref key={module.label} isDisabled={isDisabled}>
              <Card
                shadow="none"
                className="border-1 rounded-md hover:shadow-lg transition-shadow w-full md:h-32 cursor-pointer"
              >
                <CardHeader className="font-semibold gap-2">
                  {module.icon}
                  {module.label}
                </CardHeader>
                <CardBody>
                  <p>
                    {module.description}
                  </p>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Separador */}
      <Divider className="mt-4" />

      {/* Sección Final */}
      <div className="text-center p-2">
        <p className="text-sm">PanaSystem v1.0</p>
      </div>
    </div>
  );
}
