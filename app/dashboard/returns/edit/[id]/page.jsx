"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
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
} from "@nextui-org/react";
import { IconPlus, IconArrowLeft, IconTrash } from "@tabler/icons-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";
import useCustomers from "@/app/hooks/useCustomers";
import useProducts from "@/app/hooks/useProducts";
import useReturn from "@/app/hooks/useReturn";
import useSales from "@/app/hooks/useSales";
import { formatDateForDisplay } from "@/app/utils";

export default function EditReturnPage() {
  const router = useRouter();
  const params = useParams();
  const returnId = params.id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sale, setSale] = useState(null);

  const [customer, setCustomer] = useState(null);
  const [date, setDate] = useState(getTodayDate());

  const [returnDetails, setReturnDetails] = useState([
    { product: null, quantity: "" },
  ]);

  const { return_, loading: returnLoading, error: returnError } = useReturn(returnId);
  const { customers, loading: customersLoading, error: customersError } = useCustomers();
  const { products, loading: productsLoading, error: productsError } = useProducts();

  const [isReturnLoaded, setIsReturnLoaded] = useState(false);

  useEffect(() => {
    if (return_ && !returnLoading) {
      const saleState = return_.sale_details?.state;

      if (["cobrada", "anulada", "cancelada"].includes(saleState)) {
        router.back();
        return;
      }

      setCustomer(return_.sale_details?.customer_details?.id?.toString() || null);
      setSale(return_.sale_details?.id?.toString() || null);
      setDate(return_.date ? return_.date.split("T")[0] : getTodayDate());
      if (return_.return_details && return_.return_details.length > 0) {
        setReturnDetails(
          return_.return_details.map((detail) => ({
            product: detail.product_details.id?.toString() || null,
            quantity: detail.quantity.toString(),
          }))
        );
      } else {
        setReturnDetails([{ product: null, quantity: "" }]);
      }
      setIsReturnLoaded(true);
    }
  }, [return_, returnLoading, router]);

  const { sales, loading: salesLoading, error: salesError } = useSales({
    sale_type: 'mayorista',
    customer: customer,
    state: 'creada,pendiente_entrega,entregada,cobrada,cobrada_parcial',
    limit: 100000
  });

  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const isValidQuantity = (quantity, maxQuantity) => {
    const validFormat = /^\d+(\.\d{1,3})?$/.test(quantity);
    const parsedQuantity = parseFloat(quantity);
    return (
      validFormat &&
      parsedQuantity > 0 &&
      (!maxQuantity || parsedQuantity <= maxQuantity)
    );
  };

  const selectedSale = useMemo(() => {
    return sales.find((s) => s.id === parseInt(sale, 10));
  }, [sales, sale]);

  const productQuantityMap = useMemo(() => {
    if (!selectedSale) return {};
    const map = {};
    selectedSale.sale_details.forEach((detail) => {
      map[detail.product_details.id] = parseFloat(detail.quantity);
    });
    return map;
  }, [selectedSale]);

  const saleProductIds = useMemo(() => {
    if (!selectedSale) return [];
    return selectedSale.sale_details.map((detail) =>
      detail.product_details.id.toString()
    );
  }, [selectedSale]);

  const isValidReturn = useCallback(() => {
    if (!customer) {
      setError("Por favor, selecciona un cliente.");
      return false;
    }

    if (!sale) {
      setError("Por favor, selecciona una venta.");
      return false;
    }

    for (let i = 0; i < returnDetails.length; i++) {
      const detail = returnDetails[i];
      if (!detail.product) {
        setError(`Por favor, selecciona un producto en el detalle ${i + 1}.`);
        return false;
      }

      const maxQuantity = productQuantityMap[parseInt(detail.product)];

      if (
        !detail.quantity ||
        !isValidQuantity(detail.quantity, maxQuantity)
      ) {
        setError(
          `Por favor, ingresa una cantidad válida en el detalle ${
            i + 1
          }. La cantidad no puede exceder ${maxQuantity}.`
        );
        return false;
      }

      if (!saleProductIds.includes(detail.product)) {
        setError(
          `El producto seleccionado en el detalle ${
            i + 1
          } no está en la venta seleccionada.`
        );
        return false;
      }
    }

    return true;
  }, [customer, sale, returnDetails, productQuantityMap, saleProductIds]);

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...returnDetails];
    newDetails[index][field] = value;
    setReturnDetails(newDetails);
  };

  const addReturnDetail = () => {
    setReturnDetails([...returnDetails, { product: null, quantity: "" }]);
  };

  const removeReturnDetail = (index) => {
    const newDetails = returnDetails.filter((_, i) => i !== index);
    setReturnDetails(newDetails);
  };

  const returnDetailsWithPrices = useMemo(() => {
    return returnDetails.map((detail) => {
      if (!detail.product || !isValidQuantity(detail.quantity)) {
        return { ...detail, price: 0, subtotal: 0 };
      }
      const product = products.find((p) => p.id === parseInt(detail.product, 10));
      if (!product) {
        return { ...detail, price: 0, subtotal: 0 };
      }

      const price = parseFloat(product.wholesale_price) || parseFloat(product.retail_price) || 0;
      const quantity = parseFloat(detail.quantity);
      const subtotal = price * quantity;
      return { ...detail, price, subtotal };
    });
  }, [returnDetails, products]);

  const total = useMemo(() => {
    return returnDetailsWithPrices.reduce((acc, detail) => acc + detail.subtotal, 0);
  }, [returnDetailsWithPrices]);

  const handleUpdateReturn = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isValidReturn()) {
      setLoading(false);
      return;
    }

    const returnData = {
      ...(date ? { date: date } : {}),
      sale: sale ? parseInt(sale, 10) : null,
      return_details: returnDetails.map((detail) => ({
        product: parseInt(detail.product, 10),
        quantity: parseFloat(detail.quantity),
      })),
    };

    const token = Cookies.get("access_token");
    try {
      await api.put(`/returns/${returnId}/`, returnData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      router.push("/dashboard/returns");
    } catch (error) {
      console.error("Error al actualizar la devolución:", error);
      if (error.response && error.response.data) {
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al actualizar la devolución.");
      }
    } finally {
      setLoading(false);
    }
  }, [date, isValidReturn, returnDetails, returnId, router, sale]);

  // Mostrar cargador si los datos necesarios aún se están cargando
  if (customersLoading || productsLoading || returnLoading || !isReturnLoaded || salesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg">Cargando...</Spinner>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      <div className="flex items-center mb-4 gap-1">
        <Link href="/dashboard/returns">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Editar Devolución #{returnId}</p>
      </div>

      {error && (
        <Code color="danger" className="text-wrap mb-4">
          {error}
        </Code>
      )}

      <div className="space-y-4 mt-4">
        <Autocomplete
          label="Seleccionar Cliente"
          placeholder="Escribe para buscar y seleccionar un cliente"
          className="w-full"
          aria-label="Seleccionar Cliente"
          onClear={() => {
            setCustomer(null);
            setSale(null);
          }}
          onSelectionChange={(value) => {
            setCustomer(value);
            setSale(null);
          }}
          variant="underlined"
          isClearable
          selectedKey={customer || ""}
        >
          {customers.map((cust) => (
            <AutocompleteItem key={cust.id.toString()} value={cust.id.toString()}>
              {cust.name}
            </AutocompleteItem>
          ))}
        </Autocomplete>

        <Autocomplete
          label="Seleccionar Venta"
          placeholder="Escribe para buscar y seleccionar una venta"
          className="w-full"
          aria-label="Seleccionar Venta"
          variant="underlined"
          isClearable
          onSelectionChange={setSale}
          isDisabled={!customer}
          selectedKey={sale || ""}
        >
          {sales.map((saleItem) => (
            <AutocompleteItem
              aria-label={`Venta ${saleItem.id}`}
              key={saleItem.id.toString()}
              value={saleItem.id.toString()}
            >
              Venta #{saleItem.id} - {saleItem.date ? formatDateForDisplay(saleItem.date) : null}
            </AutocompleteItem>
          ))}
        </Autocomplete>

        <Input
          label="Fecha (Opcional)"
          placeholder="Selecciona una fecha"
          value={date}
          onChange={(e) => {
            const selectedDate = e.target.value;
            setDate(selectedDate);
          }}
          fullWidth
          variant="underlined"
          type="date"
          aria-label="Fecha de Devolución"
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-lg font-semibold">Detalles de la Devolución</p>
            <Button
              variant="light"
              color="primary"
              size="sm"
              onPress={addReturnDetail}
              isIconOnly
              aria-label="Agregar Detalle de Devolución"
            >
              <IconPlus className="h-4 w-4" />
            </Button>
          </div>

          <div className="overflow-x-auto border rounded-md max-h-72 overflow-y-auto">
            <Table
              aria-label="Detalles de la Devolución"
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
                {returnDetailsWithPrices.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Autocomplete
                        placeholder="Escribe para buscar y seleccionar un producto"
                        className="min-w-[200px]"
                        aria-label={`Seleccionar Producto ${index + 1}`}
                        onClear={() => handleDetailChange(index, "product", null)}
                        onSelectionChange={(value) =>
                          handleDetailChange(index, "product", value)
                        }
                        variant="underlined"
                        isClearable
                        selectedKey={detail.product || ""}
                      >
                        {products.map((prod) => (
                          <AutocompleteItem key={prod.id.toString()} value={prod.id.toString()}>
                            {prod.name}
                          </AutocompleteItem>
                        ))}
                      </Autocomplete>
                    </TableCell>
                    <TableCell>
                      <Input
                        aria-label={`Cantidad Detalle ${index + 1}`}
                        placeholder="Cantidad"
                        value={detail.quantity}
                        onChange={(e) =>
                          handleDetailChange(index, "quantity", e.target.value)
                        }
                        variant="underlined"
                        type="number"
                        min="0.001"
                        step="0.001"
                        isRequired
                        className="max-w-[100px]"
                        max={
                          detail.product
                            ? productQuantityMap[parseInt(detail.product)] || undefined
                            : undefined
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {detail.price
                        ? `${detail.price.toLocaleString("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          })}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {detail.subtotal
                        ? `${detail.subtotal.toLocaleString("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          })}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {returnDetails.length > 1 && (
                        <Tooltip content="Eliminar Detalle">
                          <Button
                            variant="light"
                            color="danger"
                            size="sm"
                            onPress={() => removeReturnDetail(index)}
                            isIconOnly
                            aria-label="Eliminar Detalle de Devolución"
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

          <div className="flex justify-end mt-4">
            <p className="text-xl font-semibold">
              Total: {`${total.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
              })}`}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleUpdateReturn}
          isDisabled={loading || customersLoading || productsLoading || salesLoading || returnLoading}
          fullWidth
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <IconPlus className="h-4 mr-2" /> Actualizar Devolución
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
