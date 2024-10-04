"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
  Autocomplete,
  AutocompleteItem,
  Link,
  Tooltip,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { IconPlus, IconArrowLeft } from "@tabler/icons-react";
import { useState, useCallback, useEffect } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";
import useCustomers from "@/app/hooks/useCustomers";
import useSale from "@/app/hooks/useSale";

const PAYMENT_METHOD_CHOICES = [
  { id: "efectivo", name: "Efectivo" },
  { id: "tarjeta", name: "Tarjeta" },
  { id: "transferencia", name: "Transferencia" },
  { id: "qr", name: "QR" },
  { id: "cuenta_corriente", name: "Cuenta Corriente" },
];

export default function EditSaleWithoutDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const saleId = params.id;
  
  const { customers, loading: customersLoading, error: customersError } = useCustomers();
  const { sale, loading: saleLoading, error: saleError } = useSale(saleId);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [customer, setCustomer] = useState(null);
  const [date, setDate] = useState(getTodayDate());
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [total, setTotal] = useState("");

  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    if (sale) {
      setCustomer(sale.customer_details?.id);
      setDate(sale.date ? sale.date.split("T")[0] : getTodayDate());
      setPaymentMethod(sale.payment_method || null);
      setTotal(sale.total);
    }
  }, [sale]);

  const isValidTotal = (total) => {
    return /^\d+(\.\d{1,2})?$/.test(total) && parseFloat(total) > 0;
  };

  const handleUpdateSale = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!customer || !total) {
      setError("Por favor, completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    if (!isValidTotal(total)) {
      setError("El total debe ser un número positivo con hasta dos decimales.");
      setLoading(false);
      return;
    }

    const saleData = {
      customer: parseInt(customer),
      total: parseFloat(total),
    };

    if (date) {
      saleData.date = date;
    }

    if (paymentMethod) {
      saleData.payment_method = paymentMethod;
    }

    const token = Cookies.get("access_token");
    try {
      await api.put(`/sales/${saleId}/`, saleData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      router.push("/dashboard/sales");
    } catch (error) {
      console.error("Error al actualizar la venta:", error);
      if (error.response && error.response.data) {
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al actualizar la venta.");
      }
    } finally {
      setLoading(false);
    }
  }, [customer, date, paymentMethod, total, saleId, router]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      <div className="flex items-center mb-4 gap-1">
        <Link href="/dashboard/sales">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Editar Venta #{saleId}</p>
      </div>

      {error && (
        <Code color="danger" className="text-wrap">
          {error}
        </Code>
      )}

      {(customersLoading || saleLoading) && (
        <div className="flex justify-center items-center my-6">
          <Spinner size="lg" />
        </div>
      )}

      {!saleLoading && !customersLoading && (
        <div className="space-y-4 mt-4">
          <Autocomplete
            aria-label="Cliente"
            label="Cliente"
            placeholder="Seleccione un cliente"
            onSelectionChange={(value) => setCustomer(value)}
            selectedKey={customer ? customer.toString() : null}
            variant="underlined"
            isRequired
            value={customer ? customer.toString() : ""}
          >
            {customers.map((cust) => (
              <AutocompleteItem key={cust.id.toString()} value={cust.id.toString()}>
                {cust.name}
              </AutocompleteItem>
            ))}
          </Autocomplete>

          <Input
            label="Fecha"
            placeholder="Seleccione una fecha (Opcional)"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            variant="underlined"
            type="date"
            aria-label="Fecha de la Venta"
          />

          <Select
            aria-label="Método de Pago"
            label="Método de Pago"
            placeholder="Seleccione un método de pago (Opcional)"
            selectedKeys={paymentMethod ? [paymentMethod.toString()] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              setPaymentMethod(selected || null);
            }}
            variant="underlined"
          >
            {PAYMENT_METHOD_CHOICES.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                {method.name}
              </SelectItem>
            ))}
          </Select>

          <Input
            label="Total"
            placeholder="Ingrese el total de la venta (Ej: 4900.53)"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            fullWidth
            variant="underlined"
            type="number"
            step="0.01"
            min="0"
            aria-label="Total de la Venta"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">$</span>
              </div>
            }
            isRequired
          />
        </div>
      )}

      {!saleLoading && !customersLoading && (
        <div className="mt-6">
          <Button
            className="rounded-md bg-black text-white"
            onPress={handleUpdateSale}
            isDisabled={loading}
            fullWidth
          >
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <IconPlus className="h-4" /> Actualizar Venta
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
