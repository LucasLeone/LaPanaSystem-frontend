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
  IconUser
} from "@tabler/icons-react";
import { Link } from "@nextui-org/react";
import { motion } from "framer-motion";
import Cookies from "js-cookie";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({});

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

  const menuItems = [
    { label: "Inicio", path: "/dashboard", icon: <IconHome /> },
    { label: "Productos", path: "/dashboard/products", icon: <IconPackage /> },
    { label: "Clientes", path: "/dashboard/customers", icon: <IconUsers /> },
    { label: "Gastos", path: "/dashboard/expenses", icon: <IconCreditCard /> },
    { label: "Ventas", path: "/dashboard/sales", icon: <IconShoppingCart /> },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10 min-h-screen">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {sidebarOpen ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {menuItems.map((item) => (
                <SidebarLink key={item.label} link={item} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: `${user.first_name} ${user.last_name}`,
                href: "/dashboard/profile",
                icon: <IconUser />,
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex-1 md:p-16 md:pt-6">
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
