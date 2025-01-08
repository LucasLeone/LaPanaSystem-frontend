"use client";

import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { parseISO, format } from "date-fns";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function MonthlyBreakdownChart({ monthlyBreakdown }) {
  const processedData = useMemo(() => {
    if (!monthlyBreakdown || monthlyBreakdown.length === 0) {
      return { categories: [], series: [] };
    }

    const filteredBreakdown = monthlyBreakdown.filter((item) => {
      return (
        parseInt(item.sales_count, 10) !== 0 ||
        parseFloat(item.total_sales) !== 0 ||
        parseFloat(item.total_collected) !== 0 ||
        parseFloat(item.total_returns) !== 0 ||
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
          enabled: false,
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
        enabled: false,
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
      yaxis: [
        {
          seriesName: "Cantidad de Ventas",
          title: {
            text: "Cantidad de Ventas",
            style: {
              fontSize: "14px",
            },
          },
          labels: {
            formatter: (val) => parseInt(val, 10),
          },
          tickAmount: 5,
          min: 0,
        },
        {
          seriesName: "Total Vendido",
          opposite: true,
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
          tickAmount: 5,
          min: 0,
        },
      ],
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (val, { seriesIndex }) {
            if (seriesIndex === 0) {
              return `${val} ventas`;
            } else {
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
        "#4CAF50",
        "#FF9800",
        "#2196F3",
        "#F44336",
        "#9C27B0",
        "#00BCD4",
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
              type="bar"
              height="400"
            />
          </div>
        ) : (
          <p className="text-gray-500 text-center">No hay datos disponibles para mostrar.</p>
        )}
      </CardBody>
    </Card>
  );
}
