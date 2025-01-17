"use client";

import "@/styles/globals.css";
import { Sidebar, SidebarBody, SidebarLink } from "@/app/components/Sidebar";
import { useEffect, useState } from "react";
import {
  IconHome,
  IconPackage,
  IconUsers,
  IconCreditCard,
  IconShoppingCart,
  IconUser,
  IconArrowLeft,
  IconUsersGroup,
  IconChartBar,
  IconArrowBackUp,
  IconTruckDelivery,
  IconCash,
  IconDeviceDesktop
} from "@tabler/icons-react";
import { Link } from "@nextui-org/react";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({});
  const router = useRouter();

  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        Cookies.remove("user");
      }
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("user");
    Cookies.remove("access_token");
    router.push("/auth/login");
  };

  const menuItems = [
    { label: "Inicio", path: "/dashboard", icon: <IconHome />, rolesAllowed: ["ADMIN", "DELIVERY", "SELLER"] },
    { label: "Estadísticas", path: "/dashboard/statistics", icon: <IconChartBar />, rolesAllowed: ["ADMIN"] },
    { label: "Productos", path: "/dashboard/products", icon: <IconPackage />, rolesAllowed: ["ADMIN", "SELLER"] },
    { label: "Clientes", path: "/dashboard/customers", icon: <IconUsersGroup />, rolesAllowed: ["ADMIN"] },
    { label: "Gastos", path: "/dashboard/expenses", icon: <IconCreditCard />, rolesAllowed: ["ADMIN", "SELLER"] },
    { label: "Empleados", path: "/dashboard/employees", icon: <IconUsers />, rolesAllowed: ["ADMIN"] },
    { label: "Ventas", path: "/dashboard/sales", icon: <IconShoppingCart />, rolesAllowed: ["ADMIN", "SELLER"] },
    { label: "Devoluciones", path: "/dashboard/returns", icon: <IconArrowBackUp />, rolesAllowed: ["ADMIN", "DELIVERY"] },
    { label: "Repartir", path: "/dashboard/delivery", icon: <IconTruckDelivery />, rolesAllowed: ["ADMIN", "DELIVERY"] },
    { label: "Cobrar", path: "/dashboard/collect", icon: <IconCash />, rolesAllowed: ["ADMIN", "DELIVERY"] },
    { label: "Punto de Venta", path: "/", icon: <IconDeviceDesktop />, rolesAllowed: ["ADMIN", "SELLER"] },
    {
      label: "Cerrar sesión",
      onClick: handleLogout,
      icon: <IconArrowLeft />,
      className: "text-red-500 hover:text-red-700",
      rolesAllowed: ["ADMIN", "DELIVERY", "SELLER"],
    },
  ];

  return (
    <div className="flex md:min-h-screen flex-wrap md:flex-nowrap">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10 min-h-screen">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {sidebarOpen ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {menuItems.map((item) => {
                const isDisabled = !item.rolesAllowed.includes(user.user_type);
                return (
                  <SidebarLink
                    key={item.label}
                    link={item}
                    onClick={!isDisabled ? item.onClick : undefined}
                    isDisabled={isDisabled}
                    className={`${item.className || ""}`}
                  />
                );
              })}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: `${user.first_name} ${user.last_name}`,
                path: "/dashboard/profile",
                icon: <IconUser />,
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex-grow p-4 mb-10 md:mb-0">
        {children}
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0 text-center">
        <p>PS</p>
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-white whitespace-pre"
      >
        LaPanaSystem
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0 text-center">
        <p>PS</p>
      </div>
    </Link>
  );
};
