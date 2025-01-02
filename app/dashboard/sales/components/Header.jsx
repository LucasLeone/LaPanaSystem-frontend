"use client";

import { Button, Tooltip, Link } from "@nextui-org/react";
import {
  IconDownload,
  IconPlus,
  IconFilter
} from "@tabler/icons-react";

const Header = ({ onFilterModalOpen }) => {
  return (
    <div className="flex flex-col mb-6">
      {/* Primera Fila: Título y Botones de Acción */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-4">
        <p className="text-2xl font-bold mb-4 md:mb-0">Ventas</p>
        <div className="flex flex-wrap gap-2">
          <Tooltip content="Exportar ventas">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconDownload className="h-4 mr-1" />
              Exportar
            </Button>
          </Tooltip>
          <Tooltip content="Agregar nueva venta únicamente con total">
            <Link href="/dashboard/sales/create-without-details">
              <Button className="rounded-md bg-black text-white">
                <IconPlus className="h-4 mr-1" />
                Nueva Venta sin Detalles
              </Button>
            </Link>
          </Tooltip>
          <Tooltip content="Agregar nueva venta con detalles de venta">
            <Link href="/dashboard/sales/create-with-details">
              <Button className="rounded-md bg-black text-white">
                <IconPlus className="h-4 mr-1" />
                Nueva Venta con Detalles
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Segunda Fila: Botón de Filtros */}
      <div className="flex justify-start md:justify-end">
        <Tooltip content="Aplicar Filtros">
          <Button
            variant="bordered"
            className="rounded-md border-1.5"
            onPress={onFilterModalOpen}
            aria-label="Abrir Modal de Filtros"
          >
            <IconFilter className="h-4 mr-1" />
            Filtros
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default Header;
