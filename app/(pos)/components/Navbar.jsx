import {
  Button,
} from "@nextui-org/react";
import { IconBox, IconLayoutDashboard, IconShoppingCart, IconUsersGroup } from "@tabler/icons-react";
import Link from "next/link";

export default function POSNavbar() {
  return (
    <div className="flex flex-col md:flex-row justify-start md:justify-between items-center mb-6 p-4">
      <p className="text-2xl font-bold">PanaSystem</p>

      <div className="flex flex-row items-center space-x-4">
        <Link href="/dashboard">
          <Button
            color="primary"
            variant="ghost"
            className="font-semibold"
          >
            <IconLayoutDashboard className="w-5" />
            Dashboard
          </Button>
        </Link>

        <Link href="/dashboard/products">
          <Button
            color="primary"
            variant="ghost"
            className="font-semibold"
          >
            <IconBox className="w-5" />
            Productos
          </Button>
        </Link>

        <Link href="/dashboard/sales">
          <Button
            color="primary"
            variant="ghost"
            className="font-semibold"
          >
            <IconShoppingCart className="w-5" />
            Ventas
          </Button>
        </Link>

        <Link href="/dashboard/customers">
          <Button
            color="primary"
            variant="ghost"
            className="font-semibold"
          >
            <IconUsersGroup className="w-5" />
            Clientes
          </Button>
        </Link>
      </div>

    </div>
  );
}