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
} from "@nextui-org/react";
import { IconPlus, IconArrowLeft, IconTrash } from "@tabler/icons-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

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
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);

  const [customer, setCustomer] = useState(null); // ID del cliente
  const [saleType, setSaleType] = useState("minorista");
  const [date, setDate] = useState(getTodayDate());
  const [paymentMethod, setPaymentMethod] = useState("efectivo");

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [saleDetails, setSaleDetails] = useState([
    { product: null, quantity: "" },
  ]);

  const router = useRouter();

  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Los meses en JS van de 0 a 11
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const isValidQuantity = (quantity) => {
    return /^\d+(\.\d{1,2})?$/.test(quantity) && parseFloat(quantity) > 0;
  };

  // Fetch de Clientes y Productos
  useEffect(() => {
    const fetchCustomers = async () => {
      const token = Cookies.get("access_token");
      try {
        const response = await api.get("/customers/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setCustomers(response.data);
      } catch (error) {
        console.error("Error al cargar los clientes:", error);
        setError("Error al cargar los clientes.");
      } finally {
        setLoadingCustomers(false);
      }
    };

    const fetchProducts = async () => {
      const token = Cookies.get("access_token");
      try {
        const response = await api.get("/products/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Error al cargar los productos:", error);
        setError("Error al cargar los productos.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchCustomers();
    fetchProducts();
  }, []);

  // Calcular precios y subtotales sin actualizar el estado
  const saleDetailsWithPrices = useMemo(() => {
    return saleDetails.map((detail) => {
      if (!detail.product || !isValidQuantity(detail.quantity)) {
        return { ...detail, price: 0, subtotal: 0 };
      }
      const product = products.find((p) => p.id === parseInt(detail.product));
      if (!product) {
        return { ...detail, price: 0, subtotal: 0 };
      }

      // Lógica para determinar el precio
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

  // Calcular total
  const total = saleDetailsWithPrices.reduce((acc, detail) => acc + detail.subtotal, 0);

  const handleCreateSale = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Validaciones
    if (!customer || !saleType) {
      setError("Por favor, completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    // Validar sale_details
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

    // Preparar Datos para Enviar
    const saleData = {
      customer: customer,
      sale_type: saleType,
      sale_details: saleDetails.map((detail) => ({
        product: detail.product,
        quantity: parseFloat(detail.quantity),
      })),
    };

    if (date) {
      saleData.date = date;
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

      // Redireccionar tras la creación exitosa
      router.push("/dashboard/sales");
    } catch (error) {
      console.error("Error al crear la venta:", error);
      if (error.response && error.response.data) {
        // Mostrar errores específicos de la API
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al crear la venta.");
      }
    } finally {
      setLoading(false);
    }
  }, [customer, saleType, saleDetails, date, paymentMethod, router]);

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
      {/* Título y Botón de Volver */}
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

      {/* Mostrar Errores */}
      {error && <Code color="danger" className="text-wrap">{error}</Code>}

      {/* Formulario */}
      <div className="space-y-4 mt-4">
        {/* Selección de Cliente */}
        {loadingCustomers ? (
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

        {/* Tipo de Venta */}
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

        {/* Fecha (Opcional) */}
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

        {/* Método de Pago (Opcional) */}
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

        {/* Detalles de la Venta */}
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
                      {loadingProducts ? (
                        <Spinner size="sm" />
                      ) : (
                        <Select
                          aria-label={`Producto Detalle ${index + 1}`}
                          placeholder="Seleccione un producto"
                          selectedKeys={detail.product ? [detail.product.toString()] : []}
                          onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0];
                            handleSaleDetailChange(index, "product", selected ? parseInt(selected, 10) : null);
                          }}
                          variant="underlined"
                          isRequired
                          className="min-w-[200px]"
                        >
                          {products.map((prod) => (
                            <SelectItem key={prod.id.toString()} value={prod.id.toString()}>
                              {prod.name}
                            </SelectItem>
                          ))}
                        </Select>
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

        {/* Total */}
        <div className="flex justify-end mt-4">
          <p className="text-xl font-semibold">
            Total: {`${total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`}
          </p>
        </div>
      </div>

      {/* Botón de Crear Venta */}
      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleCreateSale}
          isDisabled={loading || loadingCustomers || loadingProducts}
          fullWidth
        >
          {loading ? <Spinner size="sm" /> : <><IconPlus className="h-4" /> Crear Venta</>}
        </Button>
      </div>
    </div>
  );
}
