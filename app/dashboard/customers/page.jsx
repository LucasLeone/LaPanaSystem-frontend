"use client";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input } from "@nextui-org/react";
import { IconDownload, IconPlus, IconSearch, IconFilter } from "@tabler/icons-react";

export default function CustomersPage() {

  const filterItems = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'correo', label: 'Correo' },
    { key: 'telefono', label: 'Teléfono' },
  ];

  const handleFilterAction = (key) => {
    console.log(`Filtro seleccionado: ${key}`);
  };

  return (
    <div className="flex flex-col w-full">

      <div className="flex justify-between items-center mb-4">
        <p className="text-2xl font-bold">Clientes</p>
        <div className="space-x-2">
          <Button variant="bordered" className="rounded-md border-1.5">
            <IconDownload className="h-4" />
            Exportar
          </Button>
          <Button className="rounded-md bg-black text-white">
            <IconPlus className="h-4" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center space-x-2">
        <Input
          placeholder="Buscar clientes"
          startContent={<IconSearch className="h-4" />}
          radius="none"
          variant="underlined"
        />
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconFilter className="h-4" />
              Filtros
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Filters" onAction={handleFilterAction}>
            {filterItems.map(item => (
              <DropdownItem key={item.key} value={item.key}>
                {item.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
}
