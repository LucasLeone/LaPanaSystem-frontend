"use client";

import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { parseISO, format } from "date-fns";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DailyBreakdownChart({ dailyBreakdown }) {
  // Procesa los datos para el gráfico
  const processedData = useMemo(() => {
    if (!dailyBreakdown || dailyBreakdown.length === 0) {
      return { categories: [], series: [] };
    }

    const categories = dailyBreakdown.map((item) =>
      format(parseISO(item.date), "dd/MM")
    );

    const salesCount = dailyBreakdown.map((item) =>
      parseInt(item.sales_count, 10)
    );

    const totalSales = dailyBreakdown.map((item) =>
      parseFloat(item.total_sales)
    );

    const totalCollected = dailyBreakdown.map((item) =>
      parseFloat(item.total_collected)
    );

    const totalReturns = dailyBreakdown.map((item) =>
      parseFloat(item.total_returns)
    );

    const netCollected = dailyBreakdown.map((item) =>
      parseFloat(item.net_collected)
    );

    const dailyExpenses = dailyBreakdown.map((item) =>
      parseFloat(item.daily_expenses)
    );

    const dailyProfit = dailyBreakdown.map((item) =>
      parseFloat(item.daily_profit)
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
          type: "line",
          data: totalSales,
        },
        {
          name: "Total Cobrado",
          type: "line",
          data: totalCollected,
        },
        {
          name: "Total Devoluciones",
          type: "line",
          data: totalReturns,
        },
        {
          name: "Cobrado menos Devoluciones",
          type: "line",
          data: netCollected,
        },
        {
          name: "Gastos",
          type: "line",
          data: dailyExpenses,
        },
        {
          name: "Ganancias",
          type: "line",
          data: dailyProfit,
        },
      ],
    };
  }, [dailyBreakdown]);

  const chartOptions = useMemo(() => {
    return {
      chart: {
        type: "line",
        height: 450,
        toolbar: {
          show: true,
        },
        zoom: {
          enabled: true,
        },
      },
      stroke: {
        width: [0, 2, 2, 2, 2, 2, 2],
        curve: "smooth",
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [0],
      },
      xaxis: {
        categories: processedData.categories,
        title: {
          text: "Fecha",
        },
        labels: {
          rotate: -45,
        },
      },
      yaxis: [
        {
          seriesName: "Ventas",
          title: {
            text: "Cantidad de Ventas",
          },
          labels: {
            formatter: (val) => Math.round(val), // Redondea a entero
          },
          tickAmount: 5, // Ajusta según el rango de tus datos
          min: 0,
        },
        {
          seriesName: "Monetario",
          opposite: true,
          title: {
            text: "Montos (ARS)",
          },
          labels: {
            formatter: (val) =>
              new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency: "ARS",
              }).format(val),
          },
        },
      ],
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (val, { seriesIndex }) {
            if (seriesIndex === 0) {
              // sales_count
              return `${val} ventas`;
            } else {
              // Monetary values
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
        "#4CAF50", // Ventas
        "#FF9800", // Total Ventas
        "#2196F3", // Total Recogido
        "#F44336", // Total Devoluciones
        "#9C27B0", // Neto Recogido
        "#FFC107", // Gastos Diarios
        "#00BCD4", // Ganancias Diarias
      ],
    };
  }, [processedData.categories]);

  const chartSeries = useMemo(() => processedData.series, [processedData.series]);

  return (
    <Card isHoverable variant="bordered" className="shadow-lg w-full mt-6">
      <CardHeader>
        <p className="font-semibold">Desglose Diario</p>
      </CardHeader>
      <Divider />
      <CardBody>
        {dailyBreakdown && dailyBreakdown.length > 0 ? (
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="line"
            height={450}
          />
        ) : (
          <p className="text-gray-500">No hay datos disponibles para mostrar.</p>
        )}
      </CardBody>
    </Card>
  );
}
