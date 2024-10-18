"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
  Select,
  SelectItem,
  Link,
  Tooltip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Autocomplete,
  AutocompleteItem,
  DatePicker
} from "@nextui-org/react";
import { IconPlus, IconArrowLeft, IconTrash } from "@tabler/icons-react";
import { useState, useCallback, useMemo } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import useCustomers from "@/app/hooks/useCustomers";
import useProducts from "@/app/hooks/useProducts";
import {now, getLocalTimeZone} from "@internationalized/date";
import { formatDateToISO } from "@/app/utils";

const PAYMENT_METHOD_CHOICES = [
  { id: "efectivo", name: "Efectivo" },
  { id: "tarjeta", name: "Tarjeta" },
  { id: "transferencia", name: "Transferencia" },
  { id: "qr", name: "QR" },
  { id: "cuenta_corriente", name: "Cuenta Corriente" },
];

const SALE_TYPE_CHOICES = [
  { id: "minorista", name: "Minorista" },
  { id: "mayorista", name: "Mayorista" },
];

export default function CreateSalePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [customer, setCustomer] = useState(null);
  const [saleType, setSaleType] = useState("minorista");
  const [date, setDate] = useState();
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [needsDelivery, setNeedsDelivery] = useState(false);

  const { customers, loading: customersLoading, error: customersError } = useCustomers();
  const { products, loading: productsLoading, error: productsError } = useProducts();

  const [saleDetails, setSaleDetails] = useState([
    { product: null, quantity: "" },
  ]);

  const router = useRouter();

  const isValidQuantity = (quantity) => {
    return /^\d+(\.\d{1,2})?$/.test(quantity) && parseFloat(quantity) > 0;
  };

  const saleDetailsWithPrices = useMemo(() => {
    return saleDetails.map((detail) => {
      if (!detail.product || !isValidQuantity(detail.quantity)) {
        return { ...detail, price: 0, subtotal: 0 };
      }
      const product = products.find((p) => p.id === parseInt(detail.product));
      if (!product) {
        return { ...detail, price: 0, subtotal: 0 };
      }

      let price = 0;
      if (saleType === "mayorista") {
        if (product.wholesale_price && parseFloat(product.wholesale_price) > 0) {
          price = parseFloat(product.wholesale_price);
        } else {
          price = parseFloat(product.retail_price);
        }
      } else {
        price = parseFloat(product.retail_price);
      }

      const quantity = parseFloat(detail.quantity);
      const subtotal = price * quantity;
      return { ...detail, price, subtotal };
    });
  }, [saleType, saleDetails, products]);

  const total = saleDetailsWithPrices.reduce((acc, detail) => acc + detail.subtotal, 0);

  const handleCreateSale = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!customer || !saleType) {
      setError("Por favor, completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    for (let i = 0; i < saleDetails.length; i++) {
      const detail = saleDetails[i];
      if (!detail.product || !detail.quantity) {
        setError(`Por favor, completa todos los campos requeridos en el detalle ${i + 1}.`);
        setLoading(false);
        return;
      }
      if (!isValidQuantity(detail.quantity)) {
        setError(`La cantidad en el detalle ${i + 1} debe ser un número positivo.`);
        setLoading(false);
        return;
      }
    }

    const saleData = {
      customer: customer,
      sale_type: saleType,
      needs_delivery: needsDelivery,
      sale_details: saleDetails.map((detail) => ({
        product: detail.product,
        quantity: parseFloat(detail.quantity),
      })),
    };

    if (date) {
      saleData.date = formatDateToISO(date);
    }

    if (paymentMethod) {
      saleData.payment_method = paymentMethod;
    }

    const token = Cookies.get("access_token");
    try {
      await api.post("/sales/", saleData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      router.push("/dashboard/sales");
    } catch (error) {
      console.error("Error al crear la venta:", error);
      if (error.response && error.response.data) {
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al crear la venta.");
      }
    } finally {
      setLoading(false);
    }
  }, [customer, saleType, needsDelivery, saleDetails, date, paymentMethod, router]);

  const handleAddSaleDetail = () => {
    setSaleDetails([...saleDetails, { product: null, quantity: "" }]);
  };

  const handleRemoveSaleDetail = (index) => {
    const newSaleDetails = [...saleDetails];
    newSaleDetails.splice(index, 1);
    setSaleDetails(newSaleDetails);
  };

  const handleSaleDetailChange = (index, field, value) => {
    const newSaleDetails = [...saleDetails];
    newSaleDetails[index][field] = value;
    setSaleDetails(newSaleDetails);
  };

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
        <p className="text-2xl font-bold">Crear nueva Venta</p>
      </div>

      {error && <Code color="danger" className="text-wrap">{error}</Code>}

      <div className="space-y-4 mt-4">
        {customersLoading ? (
          <div className="flex justify-center items-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <Select
            aria-label="Cliente"
            label="Cliente"
            placeholder="Seleccione un cliente"
            selectedKeys={customer ? [customer.toString()] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              setCustomer(selected ? parseInt(selected, 10) : null);
            }}
            variant="underlined"
            isRequired
          >
            {customers.map((cust) => (
              <SelectItem key={cust.id.toString()} value={cust.id.toString()}>
                {cust.name}
              </SelectItem>
            ))}
          </Select>
        )}

        <Select
          aria-label="Tipo de Venta"
          label="Tipo de Venta"
          placeholder="Seleccione el tipo de venta"
          selectedKeys={saleType ? [saleType.toString()] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            setSaleType(selected ? selected.toString() : null);
          }}
          variant="underlined"
          isRequired
        >
          {SALE_TYPE_CHOICES.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.name}
            </SelectItem>
          ))}
        </Select>

        <DatePicker
          label="Fecha"
          placeholder="Seleccione una fecha (Opcional)"
          value={date}
          onChange={setDate}
          fullWidth
          variant="underlined"
          type="date"
          aria-label="Fecha de la Venta"
          hideTimeZone
          showMonthAndYearPickers
          defaultValue={now(getLocalTimeZone())}
        />

        <Select
          aria-label="Método de Pago"
          label="Método de Pago"
          placeholder="Seleccione un método de pago"
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

        <Checkbox
          checked={needsDelivery}
          onChange={(e) => setNeedsDelivery(e.target.checked)}
          label="Necesita Envío"
          aria-label="Necesita Envío"
        >
          Necesita Envío
        </Checkbox>

        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-lg font-semibold">Detalles de la Venta</p>
            <Button
              variant="light"
              color="primary"
              size="sm"
              onPress={handleAddSaleDetail}
              isIconOnly
              aria-label="Agregar Detalle de Venta"
            >
              <IconPlus className="h-4 w-4" />
            </Button>
          </div>

          <div className="overflow-x-auto border rounded-md max-h-72 overflow-y-auto">
            <Table
              aria-label="Detalles de la Venta"
              className="border-none min-w-full"
              shadow="none"
              isCompact
              removeWrapper
            >
              <TableHeader>
                <TableColumn className="bg-white text-bold border-b-1">Producto</TableColumn>
                <TableColumn className="bg-white text-bold border-b-1">Cantidad</TableColumn>
                <TableColumn className="bg-white text-bold border-b-1">Precio</TableColumn>
                <TableColumn className="bg-white text-bold border-b-1">Subtotal</TableColumn>
                <TableColumn className="bg-white text-bold border-b-1">Acciones</TableColumn>
              </TableHeader>
              <TableBody>
                {saleDetailsWithPrices.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {productsLoading ? (
                        <Spinner size="sm" />
                      ) : (
                        <Autocomplete
                          aria-label={`Producto Detalle ${index + 1}`}
                          placeholder="Seleccione un producto"
                          onSelectionChange={(value) => handleSaleDetailChange(index, "product", value)}
                          variant="underlined"
                          isRequired
                          className="min-w-[200px]"
                          disabledKeys={saleDetails.map((d) => d.product)}
                        >
                          {products.map((prod) => (
                            <AutocompleteItem key={prod.id.toString()} value={prod.id.toString()}>
                              {prod.name}
                            </AutocompleteItem>
                          ))}
                        </Autocomplete>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        aria-label={`Cantidad Detalle ${index + 1}`}
                        placeholder="Cantidad"
                        value={detail.quantity}
                        onChange={(e) => handleSaleDetailChange(index, "quantity", e.target.value)}
                        variant="underlined"
                        type="number"
                        step="0.01"
                        min="0"
                        isRequired
                        className="max-w-[100px]"
                      />
                    </TableCell>
                    <TableCell>
                      {detail.price
                        ? `${detail.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {detail.subtotal
                        ? `${detail.subtotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {saleDetails.length > 1 && (
                        <Tooltip content="Eliminar Detalle">
                          <Button
                            variant="light"
                            color="danger"
                            size="sm"
                            onPress={() => handleRemoveSaleDetail(index)}
                            isIconOnly
                            aria-label="Eliminar Detalle de Venta"
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <p className="text-xl font-semibold">
            Total: {`${total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleCreateSale}
          isDisabled={loading || customersLoading || productsLoading}
          fullWidth
        >
          {loading ? <Spinner size="sm" /> : <><IconPlus className="h-4" /> Crear Venta</>}
        </Button>
      </div>
    </div>
  );
}
