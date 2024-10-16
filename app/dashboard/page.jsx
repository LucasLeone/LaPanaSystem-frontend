"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Card, CardBody, CardHeader, Spinner, Divider } from "@nextui-org/react";
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
import NextLink from 'next/link'; // Importar Link de Next.js

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
        Bienvenido a tu dashboard. Aquí puedes gestionar todas las áreas clave de tu negocio de manera eficiente.
      </p>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {/* Estadísticas */}
        <NextLink href="/estadisticas" passHref>
          <Card
            as="a"
            shadow="none"
            className="border-1 rounded-md hover:shadow-lg transition-shadow w-full md:h-32"
          >
            <CardHeader className="font-semibold gap-2">
              <IconChartBar className="w-6" />
              Estadísticas
            </CardHeader>
            <CardBody>
              <p>
                Resumen de ventas, clientes activos y rendimiento de empleados.
              </p>
            </CardBody>
          </Card>
        </NextLink>

        {/* Productos */}
        <NextLink href="/dashboard/products" passHref>
          <Card
            as="a"
            shadow="none"
            className="border-1 rounded-md hover:shadow-lg transition-shadow w-full md:h-32"
          >
            <CardHeader className="font-semibold gap-2">
              <IconPackage className="w-6" />
              Productos
            </CardHeader>
            <CardBody>
              <p>
                Gestiona tu catálogo, inventario y productos más vendidos.
              </p>
            </CardBody>
          </Card>
        </NextLink>

        {/* Clientes */}
        <NextLink href="/dashboard/customers" passHref>
          <Card
            as="a"
            shadow="none"
            className="border-1 rounded-md hover:shadow-lg transition-shadow w-full md:h-32"
          >
            <CardHeader className="font-semibold gap-2">
              <IconUsersGroup className="w-6" />
              Clientes
            </CardHeader>
            <CardBody>
              <p>
                Administra la información y segmenta a tus clientes.
              </p>
            </CardBody>
          </Card>
        </NextLink>

        {/* Gastos */}
        <NextLink href="/dashboard/expenses" passHref>
          <Card
            as="a"
            shadow="none"
            className="border-1 rounded-md hover:shadow-lg transition-shadow w-full md:h-32"
          >
            <CardHeader className="font-semibold gap-2">
              <IconCreditCard className="w-6" />
              Gastos
            </CardHeader>
            <CardBody>
              <p>
                Controla y analiza los gastos operativos y de marketing.
              </p>
            </CardBody>
          </Card>
        </NextLink>

        {/* Ventas */}
        <NextLink href="/dashboard/sales" passHref>
          <Card
            as="a"
            shadow="none"
            className="border-1 rounded-md hover:shadow-lg transition-shadow w-full md:h-32"
          >
            <CardHeader className="font-semibold gap-2">
              <IconShoppingCart className="w-6" />
              Ventas
            </CardHeader>
            <CardBody>
              <p>
                Monitorea tus ventas y compara con objetivos mensuales.
              </p>
            </CardBody>
          </Card>
        </NextLink>

        {/* Devoluciones */}
        <NextLink href="/dashboard/returns" passHref>
          <Card
            as="a"
            shadow="none"
            className="border-1 rounded-md hover:shadow-lg transition-shadow w-full md:h-32"
          >
            <CardHeader className="font-semibold gap-2">
              <IconArrowBackUp className="w-6" />
              Devoluciones
            </CardHeader>
            <CardBody>
              <p>
                Gestiona las devoluciones y analiza sus motivos.
              </p>
            </CardBody>
          </Card>
        </NextLink>

        {/* Empleados */}
        <NextLink href="/dashboard/employees" passHref>
          <Card
            as="a"
            shadow="none"
            className="border-1 rounded-md hover:shadow-lg transition-shadow w-full md:h-32"
          >
            <CardHeader className="font-semibold gap-2">
              <IconUsers className="w-6" />
              Empleados
            </CardHeader>
            <CardBody>
              <p>
                Administra información y desempeño de tus empleados.
              </p>
            </CardBody>
          </Card>
        </NextLink>

        {/* Repartir */}
        <NextLink href="/dashboard/delivery" passHref>
          <Card
            as="a"
            shadow="none"
            className="border-1 rounded-md hover:shadow-lg transition-shadow w-full md:h-32"
          >
            <CardHeader className="font-semibold gap-2">
              <IconTruckDelivery className="w-6" />
              Repartir
            </CardHeader>
            <CardBody>
              <p>
                Optimiza las rutas de reparto y monitorea entregas.
              </p>
            </CardBody>
          </Card>
        </NextLink>

        {/* Cobrar */}
        <NextLink href="/dashboard/collect" passHref>
          <Card
            as="a"
            shadow="none"
            className="border-1 rounded-md hover:shadow-lg transition-shadow w-full md:h-32"
          >
            <CardHeader className="font-semibold gap-2">
              <IconCash className="w-6" />
              Cobrar
            </CardHeader>
            <CardBody>
              <p>
                Gestiona pagos pendientes y registra transacciones.
              </p>
            </CardBody>
          </Card>
        </NextLink>
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
