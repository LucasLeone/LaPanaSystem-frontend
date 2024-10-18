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
  Autocomplete,
  AutocompleteItem,
  DatePicker
} from "@nextui-org/react";
import { IconPlus, IconArrowLeft, IconTrash } from "@tabler/icons-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";
import useProducts from "@/app/hooks/useProducts";
import useCustomers from "@/app/hooks/useCustomers";
import useSale from "@/app/hooks/useSale";
import { formatDateToISO } from "@/app/utils";
import { parseDateTime } from "@internationalized/date";
import { parseAbsoluteToLocal } from "@internationalized/date";

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

export default function EditSalePage() {
  const router = useRouter();
  const params = useParams();
  const saleId = params.id;

  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { customers, loading: customersLoading, error: customersError } = useCustomers();
  const { sale, loading: saleLoading, error: saleError } = useSale(saleId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [customer, setCustomer] = useState(null);
  const [saleType, setSaleType] = useState("minorista");
  const [date, setDate] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");

  const [saleDetails, setSaleDetails] = useState([
    { product: null, quantity: "" },
  ]);

  const isValidQuantity = (quantity) => {
    return /^\d+(\.\d{1,3})?$/.test(quantity) && parseFloat(quantity) > 0;
  };

  useEffect(() => {
    setCustomer(sale.customer_details?.id);
    setSaleType(sale.sale_type);
    setDate(sale.date ? parseAbsoluteToLocal(sale.date) : null)
    setPaymentMethod(sale.payment_method || "efectivo");
    if (sale.sale_details && sale.sale_details.length > 0) {
      setSaleDetails(sale.sale_details.map(detail => ({
        product: detail.product_details.id.toString(),
        quantity: detail.quantity.toString(),
      })));
    } else {
      setSaleDetails([{ product: null, quantity: "" }]);
    }
  }, [sale]);

  const saleDetailsWithPrices = useMemo(() => {
    return saleDetails.map((detail, index) => {
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

      if (isNaN(price)) {
        price = 0;
      }

      const quantity = parseFloat(detail.quantity);
      if (isNaN(quantity)) {
        return { ...detail, price: 0, subtotal: 0 };
      }

      const subtotal = price * quantity;
      return { ...detail, price, subtotal };
    });
  }, [saleType, saleDetails, products]);

  const total = useMemo(() => {
    return saleDetailsWithPrices.reduce((acc, detail) => acc + detail.subtotal, 0);
  }, [saleDetailsWithPrices]);

  const handleUpdateSale = useCallback(async () => {
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
      sale_details: saleDetails.map((detail) => ({
        product: parseInt(detail.product),
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
  }, [customer, saleType, saleDetails, date, paymentMethod, saleId, router]);

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

  if (loading && !customersLoading && !productsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

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

      {error && <Code color="danger" className="text-wrap">{error}</Code>}

      <div className="space-y-4 mt-4">
        {customersLoading ? (
          <div className="flex justify-center items-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <Autocomplete
            aria-label="Cliente"
            label="Cliente"
            placeholder="Seleccione un cliente"
            selectedKey={customer ? customer.toString() : ""}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              setCustomer(selected ? parseInt(selected, 10) : null);
            }}
            variant="underlined"
            isRequired
          >
            {customers.map((cust) => (
              <AutocompleteItem key={cust.id.toString()} value={cust.id.toString()}>
                {cust.name}
              </AutocompleteItem>
            ))}
          </Autocomplete>
        )}

        <Select
          aria-label="Tipo de Venta"
          label="Tipo de Venta"
          placeholder="Seleccione el tipo de venta"
          selectedKeys={saleType ? [saleType.toString()] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            setSaleType(selected ? selected.toString() : "minorista");
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
          type="datetime"
          aria-label="Fecha de la Venta"
          hideTimeZone
          showMonthAndYearPickers
        />

        <Select
          aria-label="Método de Pago"
          label="Método de Pago"
          placeholder="Seleccione un método de pago"
          selectedKeys={paymentMethod ? [paymentMethod.toString()] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            setPaymentMethod(selected || "efectivo");
          }}
          variant="underlined"
        >
          {PAYMENT_METHOD_CHOICES.map((method) => (
            <SelectItem key={method.id} value={method.id}>
              {method.name}
            </SelectItem>
          ))}
        </Select>

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
                          aria-label={`Detalle Producto ${index + 1}`}
                          placeholder="Seleccione un producto"
                          onSelectionChange={(value) => handleSaleDetailChange(index, "product", value)}
                          selectedKey={detail.product ? detail.product.toString() : ""}
                          variant="underlined"
                          isRequired
                          className="min-w-[200px]"
                          value={detail.product ? detail.product.toString() : ""}
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
          onPress={handleUpdateSale}
          isDisabled={loading || customersLoading || productsLoading}
          fullWidth
        >
          {loading ? <Spinner size="sm" /> : <><IconPlus className="h-4" /> Actualizar Venta</>}
        </Button>
      </div>
    </div>
  );
}
