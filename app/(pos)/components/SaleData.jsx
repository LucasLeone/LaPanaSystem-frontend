"use client";

import {
  Card,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Switch,
} from "@nextui-org/react";
import useCustomers from "@/app/hooks/useCustomers";
import useProducts from "@/app/hooks/useProducts";
import { getTodayDate } from "@/app/utils";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "@/app/axios";
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import Cookies from "js-cookie";

export default function SaleData() {
  const [saleData, setSaleData] = useState({
    date: "",
    customer: "",
    payment_method: "",
    sale_type: "",
  });

  useEffect(() => {
    setSaleData((prev) => ({
      ...prev,
      date: getTodayDate(),
      payment_method: "efectivo",
      sale_type: "minorista"
    }));
  }, []);

  const [withDetails, setWithDetails] = useState(true);
  const [fastSaleTotal, setFastSaleTotal] = useState("");
  const [saleDetails, setSaleDetails] = useState([
    {
      id: uuidv4(),
      product: "",
      price: 0,
      quantity: 0,
      subtotal: 0,
    },
  ]);

  const { customers, loading: loadingCustomers, error: errorCustomers } = useCustomers();

  const { products, loading: loadingProducts, error: errorProducts } = useProducts();

  const [total, setTotal] = useState(0);

  const addSaleDetail = () => {
    setSaleDetails([
      ...saleDetails,
      {
        id: uuidv4(),
        product: "",
        price: 0,
        quantity: 0,
        subtotal: 0,
      },
    ]);
  };

  const removeSaleDetail = (id) => {
    const updatedDetails = saleDetails.filter((detail) => detail.id !== id);
    setSaleDetails(updatedDetails);
  };

  const handleSaleDetailChange = (id, field, value) => {
    const updatedDetails = saleDetails.map((detail) => {
      if (detail.id === id) {
        let updatedDetail = { ...detail, [field]: value };

        if (field === "product" && value) {
          const selectedProduct = products.find((prod) => prod.id === parseInt(value));

          if (selectedProduct) {
            if (saleData.sale_type === "mayorista" && selectedProduct.wholesale_price) {
              updatedDetail.price = parseFloat(selectedProduct.wholesale_price);
            } else {
              updatedDetail.price = parseFloat(selectedProduct.retail_price);
            }

            updatedDetail.subtotal = updatedDetail.price * updatedDetail.quantity;
          }
        }

        if (field === "quantity") {
          if (updatedDetail.quantity < 0) {
            updatedDetail.quantity = 0;
          }
          if (!updatedDetail.product) {
            updatedDetail.subtotal = 0;
          } else {
            updatedDetail.subtotal = updatedDetail.price * updatedDetail.quantity;
          }
        }

        return updatedDetail;
      }
      return detail;
    });

    setSaleDetails(updatedDetails);
  };

  const handleSaleTypeChange = (keys) => {
    const newSaleType = [...keys][0];

    setSaleData((prev) => ({ ...prev, sale_type: newSaleType }));

    setSaleDetails((prevDetails) =>
      prevDetails.map((detail) => {
        if (!detail.product) return detail;

        const selectedProduct = products.find(
          (prod) => prod.id === parseInt(detail.product)
        );
        if (!selectedProduct) return detail;

        let newPrice;

        if (newSaleType === "mayorista" && selectedProduct.wholesale_price) {
          newPrice = parseFloat(selectedProduct.wholesale_price);
        } else {
          newPrice = parseFloat(selectedProduct.retail_price);
        }

        return {
          ...detail,
          price: newPrice,
          subtotal: newPrice * detail.quantity,
        };
      })
    );
  };

  useEffect(() => {
    const newTotal = saleDetails.reduce((acc, detail) => acc + detail.subtotal, 0);
    setTotal(newTotal);
  }, [saleDetails]);

  const handleCreateSale = async () => {
    if (!saleData.date || !saleData.payment_method || !saleData.sale_type) {
      toast.error("Por favor, completa todos los campos requeridos.");
      return;
    }

    const token = Cookies.get("access_token");
    let endpoint = "";
    let payload = {};

    if (withDetails) {
      if (saleDetails.length === 0) {
        toast.error("La venta debe tener al menos un detalle.");
        return;
      }
      for (let detail of saleDetails) {
        if (!detail.product || detail.quantity <= 0) {
          toast.error("Por favor, completa todos los detalles de la venta correctamente.");
          return;
        }
      }

      endpoint = "/sales/";
      payload = {
        date: saleData.date,
        customer: saleData.customer,
        payment_method: saleData.payment_method,
        sale_type: saleData.sale_type,
        sale_details: saleDetails.map((detail) => ({
          product: detail.product,
          price: detail.price,
          quantity: detail.quantity,
          subtotal: detail.subtotal,
        })),
      };
    } else {
      const fastTotalParsed = parseFloat(fastSaleTotal.replace(",", ".")) || 0;
      if (fastTotalParsed <= 0) {
        toast.error("Por favor, ingresa un total válido para la venta rápida.");
        return;
      }

      endpoint = "/sales/create-fast-sale/";
      payload = {
        date: saleData.date,
        customer: saleData.customer,
        payment_method: saleData.payment_method,
        sale_type: saleData.sale_type,
        total: fastTotalParsed,
      };
    }

    try {
      await api.post(endpoint, payload, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      toast.success("Venta creada exitosamente.");

      setSaleData({
        date: getTodayDate(),
        customer: "",
        payment_method: "efectivo",
        sale_type: "minorista",
      });
      setSaleDetails([]);
      setTotal(0);
      setFastSaleTotal("");
    } catch (error) {
      console.error("Error al crear la venta:", error);
      toast.error("Hubo un error al crear la venta.");
    }
  };

  if (loadingCustomers || loadingProducts) {
    return <p>Loading...</p>;
  }

  if (errorCustomers || errorProducts) {
    return <p>Error al cargar los datos.</p>;
  }

  return (
    <Card className="p-4">
      <CardHeader>
        <p className="font-bold text-lg">Datos de la Venta</p>
      </CardHeader>
      <CardBody>
        {/* Datos Generales de la Venta */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Campo de Fecha */}
          <Input
            type="datetime-local"
            label="Fecha"
            placeholder="Fecha"
            isRequired
            value={saleData.date}
            onChange={(e) => setSaleData({ ...saleData, date: e.target.value })}
            variant="underlined"
            className="w-full"
          />

          {/* Campo de Cliente */}
          <Autocomplete
            label="Cliente"
            placeholder="Cliente"
            value={saleData.customer}
            isClearable
            onSelectionChange={(value) => setSaleData({ ...saleData, customer: value })}
            variant="underlined"
            className="w-full"
          >
            {customers.map((customer) => (
              <AutocompleteItem key={customer.id} value={customer.id}>
                {customer.name}
              </AutocompleteItem>
            ))}
          </Autocomplete>

          {/* Campo de Método de Pago */}
          <Select
            label="Método de Pago"
            placeholder="Método de Pago"
            isRequired
            onSelectionChange={(keys) => setSaleData({ ...saleData, payment_method: [...keys][0] })}
            variant="underlined"
            className="w-full"
            selectedKeys={[saleData.payment_method]}
            disallowEmptySelection
          >
            <SelectItem key="efectivo">Efectivo</SelectItem>
            <SelectItem key="tarjeta">Tarjeta</SelectItem>
            <SelectItem key="transferencia">Transferencia</SelectItem>
            <SelectItem key="qr">QR</SelectItem>
            <SelectItem key="cuenta_corriente">Cuenta Corriente</SelectItem>
          </Select>

          {/* Campo de Tipo de Venta */}
          <Select
            label="Tipo de Venta"
            placeholder="Tipo de Venta"
            isRequired
            onSelectionChange={handleSaleTypeChange}
            variant="underlined"
            className="w-full"
            selectedKeys={[saleData.sale_type]}
            disallowEmptySelection
            isDisabled={!withDetails}
          >
            <SelectItem key="minorista">Minorista</SelectItem>
            <SelectItem key="mayorista">Mayorista</SelectItem>
          </Select>
        </div>

        <div className="flex flex-col mb-4">
          <Switch
            isSelected={withDetails}
            onValueChange={
              (value) => {
                setWithDetails(value);
                saleData.sale_type = "minorista";
              }
            }
          >
            Con detalles de venta
          </Switch>
        </div>

        {/* Detalles de la Venta */}
        {withDetails && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-lg">Detalles de la Venta</p>
              <Tooltip content="Agregar Detalle">
                <Button onPress={addSaleDetail} variant="light" isIconOnly size="sm">
                  <PlusIcon className="w-5" />
                </Button>
              </Tooltip>
            </div>
            <Table
              aria-label="Tabla de Detalles de Venta"
              className="max-h-80 overflow-auto border rounded-2xl"
            >
              <TableHeader>
                <TableColumn>Producto</TableColumn>
                <TableColumn>Precio</TableColumn>
                <TableColumn>Cantidad</TableColumn>
                <TableColumn>Subtotal</TableColumn>
                <TableColumn>Acciones</TableColumn>
              </TableHeader>
              <TableBody>
                {saleDetails.map((detail) => (
                  <TableRow key={detail.id}>
                    {/* Producto */}
                    <TableCell>
                      <Autocomplete
                        aria-label="Producto"
                        placeholder="Selecciona un producto"
                        value={detail.product}
                        onSelectionChange={(key) => {
                          handleSaleDetailChange(detail.id, "product", key);
                        }}
                        variant="underlined"
                        className="w-full min-w-[200px]"
                        isClearable
                      >
                        {products.map((product) => (
                          <AutocompleteItem
                            key={product.id}
                            value={product.id.toString()}
                            textValue={`${product.name} (${product.barcode})`}
                          >
                            {product.name} ({product.barcode})
                          </AutocompleteItem>
                        ))}
                      </Autocomplete>
                    </TableCell>

                    {/* Precio */}
                    <TableCell>
                      <Input
                        type="text"
                        value={detail.price.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                        isReadOnly
                        variant="underlined"
                        className="w-full min-w-[150px]"
                      />
                    </TableCell>

                    {/* Cantidad */}
                    <TableCell>
                      <Input
                        type="number"
                        value={detail.quantity}
                        onChange={(e) =>
                          handleSaleDetailChange(detail.id, "quantity", e.target.value)
                        }
                        variant="underlined"
                        className="w-full min-w-[150px]"
                        aria-label="Cantidad"
                      />
                    </TableCell>

                    {/* Subtotal */}
                    <TableCell>
                      <Input
                        type="text"
                        value={detail.subtotal.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                        isReadOnly
                        variant="underlined"
                        className="w-full min-w-[150px]"
                      />
                    </TableCell>

                    {/* Acciones */}
                    <TableCell>
                      <Button
                        color="danger"
                        onPress={() => removeSaleDetail(detail.id)}
                        isIconOnly
                        variant="light"
                      >
                        <TrashIcon className="w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Total de la Venta */}
        <div className="flex justify-end items-center mb-6">
          {withDetails ? (
            <p className="font-bold text-xl">Total: {total.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</p>
          ) : (
            <div className="flex gap-2 items-center">
              <p className="font-bold text-xl">Total:</p>
              <Input
                type="number"
                value={fastSaleTotal}
                className="min-w-[150px]"
                onValueChange={
                  (value) => {
                    if (value < 0) {
                      setFastSaleTotal(0);
                    } else if (value.length === 10) {
                      return;
                    } else {
                      setFastSaleTotal(value);
                    }
                  }
                }
                step={0.01}
                placeholder="0.00"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">$</span>
                  </div>
                }
              />
            </div>
          )}
        </div>

        {/* Botón para Crear la Venta */}
        <div className="flex justify-end">
          <Button color="primary" onPress={handleCreateSale}>
            Crear Venta
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
