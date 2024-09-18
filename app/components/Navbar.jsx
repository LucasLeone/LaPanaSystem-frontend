"use client";

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { UserIcon } from "@heroicons/react/24/solid";

export default function AppNavbar() {
  const router = useRouter();
  const [user, setUser] = useState({});

  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("user");
    router.push("/auth/login");
  };

  const menuItems = [
    { label: "Inicio", path: "/dashboard" },
    { label: "Productos", path: "/dashboard/products" },
    { label: "Clientes", path: "/dashboard/customers" },
    { label: "Gastos", path: "/dashboard/expenses" },
    { label: "Ventas", path: "/dashboard/sales" },
  ];

  return (
    <Navbar isBordered variant="sticky">
      <NavbarBrand>
        <p className="font-bold">
          LaPanaSystem
        </p>
      </NavbarBrand>
      <NavbarContent>
        {menuItems.map((item) => (
          <NavbarItem key={item.label}>
            <Link as={NextLink} href={item.path} color="foreground">
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end">
        <Dropdown placement="bottom-right">
          <DropdownTrigger>
            <User
              name={user.first_name + ' ' + user.last_name || "Usuario"}
              description={user.user_type || "Tipo de usuario"}
              className="cursor-pointer"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Opciones de usuario">
            <DropdownItem key="profile">Perfil</DropdownItem>
            <DropdownItem key="settings">Configuración</DropdownItem>
            <DropdownItem key="logout" color="danger" withDivider onClick={handleLogout}>
              Cerrar Sesión
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}
