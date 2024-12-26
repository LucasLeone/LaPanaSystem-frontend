"use client";

import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { parseISO, format } from "date-fns";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function MonthlyBreakdownChart({ monthlyBreakdown }) {
  // Procesa los datos para el gráfico
  const processedData = useMemo(() => {
    if (!monthlyBreakdown || monthlyBreakdown.length === 0) {
      return { categories: [], series: [] };
    }

    // Filtrar meses con todas las métricas en cero (opcional)
    const filteredBreakdown = monthlyBreakdown.filter((item) => {
      return (
        parseInt(item.sales_count, 10) !== 0 ||
        parseFloat(item.total_sales) !== 0 ||
        parseFloat(item.total_collected) !== 0 ||
        parseFloat(item.total_returns) !== 0 ||
        parseFloat(item.net_collected) !== 0 ||
        parseFloat(item.monthly_expenses) !== 0 ||
        parseFloat(item.monthly_profit) !== 0
      );
    });

    if (filteredBreakdown.length === 0) {
      return { categories: [], series: [] };
    }

    const categories = filteredBreakdown.map((item) =>
      format(parseISO(`${item.month}-01`), "MMM yyyy")
    );

    const salesCount = filteredBreakdown.map((item) =>
      parseInt(item.sales_count, 10)
    );

    const totalSales = filteredBreakdown.map((item) =>
      parseFloat(item.total_sales)
    );

    const totalCollected = filteredBreakdown.map((item) =>
      parseFloat(item.total_collected)
    );

    const totalReturns = filteredBreakdown.map((item) =>
      parseFloat(item.total_returns)
    );

    const netCollected = filteredBreakdown.map((item) =>
      parseFloat(item.net_collected)
    );

    const monthlyExpenses = filteredBreakdown.map((item) =>
      parseFloat(item.monthly_expenses)
    );

    const monthlyProfit = filteredBreakdown.map((item) =>
      parseFloat(item.monthly_profit)
    );

    return {
      categories,
      series: [
        {
          name: "Cantidad de Ventas",
          type: "column",
          data: salesCount,
        },
        {
          name: "Total Vendido",
          type: "column",
          data: totalSales,
        },
        {
          name: "Total Cobrado",
          type: "column",
          data: totalCollected,
        },
        {
          name: "Total Devoluciones",
          type: "column",
          data: totalReturns,
        },
        {
          name: "Cobrado menos Devoluciones",
          type: "column",
          data: netCollected,
        },
        {
          name: "Gastos",
          type: "column",
          data: monthlyExpenses,
        },
        {
          name: "Ganancias",
          type: "column",
          data: monthlyProfit,
        },
      ],
    };
  }, [monthlyBreakdown]);

  const chartOptions = useMemo(() => {
    return {
      chart: {
        type: "bar",
        height: "100%",
        toolbar: {
          show: true,
        },
        zoom: {
          enabled: false, // Deshabilitar zoom si no es necesario
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "80%",
          endingShape: "rounded",
        },
      },
      dataLabels: {
        enabled: false, // Deshabilitar las etiquetas de datos
        // Si deseas mantener dataLabels pero personalizarlas, puedes ajustar aquí
      },
      xaxis: {
        categories: processedData.categories,
        title: {
          text: "Mes",
          style: {
            fontSize: "14px",
          },
        },
        labels: {
          rotate: -45,
          style: {
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        title: {
          text: "Valores",
          style: {
            fontSize: "14px",
          },
        },
        labels: {
          formatter: (val) =>
            new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: "ARS",
            }).format(val),
        },
        tickAmount: 5, // Ajusta según el rango de tus datos
        min: 0,
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (val, { seriesIndex }) {
            // Identificar si el valor es entero o monetario
            if (seriesIndex === 0) {
              // Cantidad de Ventas
              return `${val} ventas`;
            } else {
              // Valores monetarios
              return new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency: "ARS",
              }).format(val);
            }
          },
        },
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        floating: false,
      },
      colors: [
        "#4CAF50", // Cantidad de Ventas
        "#FF9800", // Total Vendido
        "#2196F3", // Total Cobrado
        "#F44336", // Total Devoluciones
        "#9C27B0", // Cobrado menos Devoluciones
        "#FFC107", // Gastos
        "#00BCD4", // Ganancias
      ],
    };
  }, [processedData.categories]);

  const chartSeries = useMemo(() => processedData.series, [processedData.series]);

  return (
    <Card isHoverable variant="bordered" className="shadow-lg w-full mt-6">
      <CardHeader>
        <p className="font-semibold">Desglose Mensual</p>
      </CardHeader>
      <Divider />
      <CardBody className="p-4">
        {monthlyBreakdown && monthlyBreakdown.length > 0 ? (
          <div className="w-full h-full">
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="bar" // Tipo de gráfico de barras (columnas)
              height="400" // Usar una altura fija o ajustada según el breakpoint
            />
          </div>
        ) : (
          <p className="text-gray-500 text-center">No hay datos disponibles para mostrar.</p>
        )}
      </CardBody>
    </Card>
  );
}
