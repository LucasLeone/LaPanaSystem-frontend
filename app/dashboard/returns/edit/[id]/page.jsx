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

export default function EditReturnPage() {
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingReturn, setLoadingReturn] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);

  const [customer, setCustomer] = useState(null); // ID del cliente
  const [date, setDate] = useState(getTodayDate());

  const [returnDetails, setReturnDetails] = useState([
    { product: null, quantity: "" },
  ]);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const router = useRouter();
  const params = useParams(); // Obtener los parámetros de la ruta
  const returnId = params.id; // Asumimos que la ruta tiene el parámetro 'id'

  // Función para obtener la fecha de hoy en formato YYYY-MM-DD
  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Los meses en JS van de 0 a 11
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Validación de Cantidad (acepta decimales)
  const isValidQuantity = (quantity) => {
    return /^\d+(\.\d{1,3})?$/.test(quantity) && parseFloat(quantity) > 0;
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

    const fetchReturn = async () => {
      if (!returnId) return;
      setLoadingReturn(true);
      const token = Cookies.get("access_token");
      try {
        const response = await api.get(`/returns/${returnId}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        const retorno = response.data;
        setCustomer(retorno.customer);
        setDate(retorno.date ? retorno.date.split("T")[0] : getTodayDate());

        if (retorno.return_details && retorno.return_details.length > 0) {
          setReturnDetails(
            retorno.return_details.map((detail) => ({
              product: detail.product_details.id,
              quantity: detail.quantity.toString(),
            }))
          );
        } else {
          setReturnDetails([{ product: null, quantity: "" }]);
        }
      } catch (error) {
        console.error("Error al cargar la devolución:", error);
        setError("Error al cargar la devolución.");
      } finally {
        setLoadingReturn(false);
      }
    };

    fetchCustomers();
    fetchProducts();
    if (returnId) {
      fetchReturn();
    }
  }, [returnId]);

  // Validación de Campos
  const isValidReturn = () => {
    if (!customer) {
      setError("Por favor, selecciona un cliente.");
      return false;
    }

    for (let i = 0; i < returnDetails.length; i++) {
      const detail = returnDetails[i];
      if (!detail.product) {
        setError(`Por favor, selecciona un producto en el detalle ${i + 1}.`);
        return false;
      }
      if (!detail.quantity || !isValidQuantity(detail.quantity)) {
        setError(
          `Por favor, ingresa una cantidad válida en el detalle ${i + 1}.`
        );
        return false;
      }
    }

    return true;
  };

  // Manejar Cambios en los Detalles de Devolución
  const handleDetailChange = (index, field, value) => {
    const newDetails = [...returnDetails];
    newDetails[index][field] = value;
    setReturnDetails(newDetails);
  };

  // Agregar un Nuevo Detalle de Devolución
  const addReturnDetail = () => {
    setReturnDetails([...returnDetails, { product: null, quantity: "" }]);
  };

  // Eliminar un Detalle de Devolución
  const removeReturnDetail = (index) => {
    const newDetails = returnDetails.filter((_, i) => i !== index);
    setReturnDetails(newDetails);
  };

  // Calcular precios y subtotales sin actualizar el estado
  const returnDetailsWithPrices = useMemo(() => {
    return returnDetails.map((detail) => {
      if (!detail.product || !isValidQuantity(detail.quantity)) {
        return { ...detail, price: 0, subtotal: 0 };
      }
      const product = products.find((p) => p.id === parseInt(detail.product));
      if (!product) {
        return { ...detail, price: 0, subtotal: 0 };
      }

      // Puedes agregar lógica adicional para calcular el precio si es necesario
      const price = parseFloat(product.wholesale_price) || parseFloat(product.retail_price) || 0;
      const quantity = parseFloat(detail.quantity);
      const subtotal = price * quantity;
      return { ...detail, price, subtotal };
    });
  }, [returnDetails, products]);

  // Calcular total
  const total = useMemo(() => {
    return returnDetailsWithPrices.reduce((acc, detail) => acc + detail.subtotal, 0);
  }, [returnDetailsWithPrices]);

  // Manejar Actualización de Devolución
  const handleUpdateReturn = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isValidReturn()) {
      setLoading(false);
      return;
    }

    // Preparar Datos para Enviar
    const returnData = {
      customer: parseInt(customer, 10),
      // Solo incluir la fecha si está seleccionada
      ...(date ? { date: new Date(date).toISOString().split("T")[0] } : {}),
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

      // Redireccionar tras la actualización exitosa
      router.push("/dashboard/returns");
    } catch (error) {
      console.error("Error al actualizar la devolución:", error);
      if (error.response && error.response.data) {
        // Mostrar errores específicos de la API
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al actualizar la devolución.");
      }
    } finally {
      setLoading(false);
    }
  }, [customer, date, returnDetails, returnId, router]);

  // Mostrar spinner mientras se cargan los datos
  if (loadingCustomers || loadingProducts || loadingReturn) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      {/* Header */}
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

      {/* Mostrar Errores */}
      {error && (
        <Code color="danger" className="text-wrap mb-4">
          {error}
        </Code>
      )}

      {/* Formulario de Edición de Devolución */}
      <div className="space-y-4 mt-4">
        {/* Selección de Cliente */}
        <Autocomplete
          label="Seleccionar Cliente"
          placeholder="Escribe para buscar y seleccionar un cliente"
          className="w-full"
          aria-label="Seleccionar Cliente"
          onClear={() => setCustomer(null)}
          onSelectionChange={(value) => setCustomer(value)}
          variant="underlined"
          clearable
          value={customer ? customer.toString() : ""}
          selectedKey={customer ? customer.toString() : ""}
        >
          {customers.map((cust) => (
            <AutocompleteItem key={cust.id.toString()} value={cust.id.toString()}>
              {cust.name}
            </AutocompleteItem>
          ))}
        </Autocomplete>

        {/* Selección de Fecha (Opcional) */}
        <Input
          label="Fecha (Opcional)"
          placeholder="Selecciona una fecha"
          value={date}
          onChange={(e) => {
            const selectedDate = e.target.value ? new Date(e.target.value) : null;
            setDate(selectedDate ? e.target.value : "");
          }}
          fullWidth
          variant="underlined"
          type="date"
          aria-label="Fecha de Devolución"
        />

        {/* Detalles de la Devolución */}
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
                        value={detail.product ? detail.product.toString() : ""}
                        selectedKey={detail.product ? detail.product.toString() : ""}
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
                        min="0.01"
                        step="0.01"
                        isRequired
                        className="max-w-[100px]"
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

          {/* Total */}
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

      {/* Botón para Actualizar Devolución */}
      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleUpdateReturn}
          isDisabled={loading || loadingCustomers || loadingProducts || loadingReturn}
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
