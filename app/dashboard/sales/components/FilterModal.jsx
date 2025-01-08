"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Input,
  DatePicker,
  DateRangePicker,
} from "@nextui-org/react";
import { useState, useEffect } from "react";

const DEFAULT_STATE_FILTERS = [
  "creada",
  "pendiente_entrega",
  "entregada",
  "cobrada",
  "cobrada_parcial",
];

const STATE_CHOICES = [
  { id: "creada", name: "Creada" },
  { id: "pendiente_entrega", name: "Pendiente de Entrega" },
  { id: "entregada", name: "Entregada" },
  { id: "cobrada", name: "Cobrada" },
  { id: "cobrada_parcial", name: "Cobrada Parcial" },
  { id: "cancelada", name: "Cancelada" },
  { id: "anulada", name: "Anulada" },
];

const SALE_TYPE_CHOICES = [
  { id: "minorista", name: "Minorista" },
  { id: "mayorista", name: "Mayorista" },
];

const PAYMENT_METHOD_CHOICES = [
  { id: "efectivo", name: "Efectivo" },
  { id: "tarjeta", name: "Tarjeta" },
  { id: "transferencia", name: "Transferencia" },
  { id: "qr", name: "QR" },
  { id: "cuenta_corriente", name: "Cuenta Corriente" },
];

const FilterModal = ({
  isOpen,
  onClose,
  applyFilters,
  clearFilters,
  customers,
  users,
}) => {
  const [tempFilterState, setTempFilterState] = useState(new Set(DEFAULT_STATE_FILTERS));
  const [tempFilterSaleType, setTempFilterSaleType] = useState(null);
  const [tempFilterPaymentMethod, setTempFilterPaymentMethod] = useState(null);
  const [tempFilterCustomer, setTempFilterCustomer] = useState(null);
  const [tempFilterUser, setTempFilterUser] = useState(null);
  const [tempFilterMinTotal, setTempFilterMinTotal] = useState("");
  const [tempFilterMaxTotal, setTempFilterMaxTotal] = useState("");
  const [tempFilterDate, setTempFilterDate] = useState(null);
  const [tempFilterDateRange, setTempFilterDateRange] = useState(null);

  const handleApply = () => {
    applyFilters({
      state: Array.from(tempFilterState),
      sale_type: tempFilterSaleType,
      payment_method: tempFilterPaymentMethod,
      customer: tempFilterCustomer,
      user: tempFilterUser,
      min_total: tempFilterMinTotal,
      max_total: tempFilterMaxTotal,
      date: tempFilterDate,
      date_range: tempFilterDateRange,
    });
    onClose();
  };

  const handleClear = () => {
    clearFilters();

    setTempFilterState(new Set(DEFAULT_STATE_FILTERS));
    setTempFilterSaleType(null);
    setTempFilterPaymentMethod(null);
    setTempFilterCustomer(null);
    setTempFilterUser(null);
    setTempFilterMinTotal("");
    setTempFilterMaxTotal("");
    setTempFilterDate(null);
    setTempFilterDateRange(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      aria-labelledby="modal-filters-title"
      placement="center"
      size="lg"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Filtros de Ventas
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col space-y-4">
                {/* Filtro de Estado con Select Múltiple */}
                <div>
                  <Select
                    label="Buscar y seleccionar estado"
                    placeholder="Selecciona uno o más estados"
                    className="w-full"
                    aria-label="Filtro de Estado"
                    onClear={() =>
                      setTempFilterState(new Set(DEFAULT_STATE_FILTERS))
                    }
                    onSelectionChange={(value) =>
                      setTempFilterState(value ? new Set(value) : new Set())
                    }
                    selectedKeys={tempFilterState}
                    variant="underlined"
                    selectionMode="multiple"
                  >
                    {STATE_CHOICES.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Filtro de Tipo de Venta con Select */}
                <div>
                  <Select
                    label="Buscar y seleccionar tipo de venta"
                    placeholder="Selecciona un tipo de venta"
                    className="w-full"
                    aria-label="Filtro de Tipo de Venta"
                    onClear={() => setTempFilterSaleType(null)}
                    onSelectionChange={(value) =>
                      setTempFilterSaleType(
                        value ? Array.from(value)[0] : null
                      )
                    }
                    selectedKeys={
                      tempFilterSaleType
                        ? new Set([tempFilterSaleType])
                        : new Set()
                    }
                    variant="underlined"
                  >
                    {SALE_TYPE_CHOICES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Filtro de Método de Pago con Select */}
                <div>
                  <Select
                    label="Buscar y seleccionar método de pago"
                    placeholder="Selecciona un método de pago"
                    className="w-full"
                    aria-label="Filtro de Método de Pago"
                    onClear={() => setTempFilterPaymentMethod(null)}
                    onSelectionChange={(value) =>
                      setTempFilterPaymentMethod(
                        value ? Array.from(value)[0] : null
                      )
                    }
                    selectedKeys={
                      tempFilterPaymentMethod
                        ? new Set([tempFilterPaymentMethod])
                        : new Set()
                    }
                    variant="underlined"
                  >
                    {PAYMENT_METHOD_CHOICES.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Filtro de Cliente con Autocomplete */}
                <div>
                  <Autocomplete
                    label="Buscar y seleccionar cliente"
                    placeholder="Selecciona un cliente"
                    className="w-full"
                    aria-label="Filtro de Cliente"
                    onClear={() => setTempFilterCustomer(null)}
                    onSelectionChange={(value) =>
                      setTempFilterCustomer(value ? value : null)
                    }
                    selectedKey={tempFilterCustomer}
                    variant="underlined"
                    isClearable
                  >
                    {customers.map((customer) => (
                      <AutocompleteItem
                        key={customer.id.toString()}
                        value={customer.id.toString()}
                      >
                        {customer.name}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                </div>

                {/* Filtro de Usuario con Autocomplete */}
                <div>
                  <Autocomplete
                    label="Buscar y seleccionar usuario"
                    placeholder="Selecciona un usuario"
                    className="w-full"
                    aria-label="Filtro de Usuario"
                    onClear={() => setTempFilterUser(null)}
                    onSelectionChange={(value) =>
                      setTempFilterUser(value ? value : null)
                    }
                    selectedKey={tempFilterUser}
                    variant="underlined"
                    isClearable
                  >
                    {users.map((user) => (
                      <AutocompleteItem
                        key={user.id.toString()}
                        value={user.id.toString()}
                      >
                        {user.first_name + " " + user.last_name}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                </div>

                {/* Filtro de Total Mínimo y Máximo */}
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                  <div className="w-full">
                    <Input
                      label="Total Mínimo"
                      placeholder="Total Mínimo"
                      type="number"
                      value={tempFilterMinTotal}
                      onChange={(e) =>
                        setTempFilterMinTotal(e.target.value)
                      }
                      className="w-full"
                      aria-label="Filtro de Total Mínimo"
                      variant="underlined"
                      isClearable
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">
                            $
                          </span>
                        </div>
                      }
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      label="Total Máximo"
                      placeholder="Total Máximo"
                      type="number"
                      value={tempFilterMaxTotal}
                      onChange={(e) =>
                        setTempFilterMaxTotal(e.target.value)
                      }
                      className="w-full"
                      aria-label="Filtro de Total Máximo"
                      variant="underlined"
                      isClearable
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">
                            $
                          </span>
                        </div>
                      }
                    />
                  </div>
                </div>

                {/* Filtro de Fecha Específica */}
                <div>
                  <DatePicker
                    label="Seleccionar Fecha"
                    value={tempFilterDate}
                    onChange={setTempFilterDate}
                    placeholder="Selecciona una fecha"
                    aria-label="Filtro de Fecha Específica"
                    variant="underlined"
                    type="date"
                    hideTimeZone
                    showMonthAndYearPickers
                  />
                </div>

                {/* Filtro de Rango de Fechas */}
                <div>
                  <DateRangePicker
                    label="Seleccionar Rango de Fechas"
                    value={tempFilterDateRange}
                    onChange={setTempFilterDateRange}
                    placeholder="Selecciona un rango de fechas"
                    aria-label="Filtro de Rango de Fechas"
                    variant="underlined"
                    type="datetime"
                    hideTimeZone
                    showMonthAndYearPickers
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={handleClear}
                color="warning"
              >
                Limpiar Filtros
              </Button>
              <Button onPress={handleApply} color="primary">
                Aplicar Filtros
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default FilterModal;
