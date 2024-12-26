"use client";

import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function TopProductsChart({ mostSoldProducts }) {
  const topProducts = (mostSoldProducts || []).slice(0, 10);
  const categories = topProducts.map((product) => product.product_name);
  const seriesData = topProducts.map((product) => product.total_quantity_sold);

  const chartOptions = {
    chart: {
      type: "bar",
      height: 350,
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories,
      title: { text: "Productos" },
      labels: {
        rotate: -45,
      },
    },
    yaxis: {
      title: { text: "Cantidad Vendida" },
    },
    fill: {
      opacity: 1,
      colors: ["#4CAF50"],
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} unidades`,
      },
    },
  };

  const chartSeries = [
    {
      name: "Cantidad Vendida",
      data: seriesData,
    },
  ];

  return (
    <Card isHoverable variant="bordered" className="shadow-lg w-full mt-6">
      <CardHeader>
        <p className="font-semibold">Productos más Vendidos</p>
      </CardHeader>
      <Divider />
      <CardBody>
        {categories.length > 0 ? (
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="bar"
            height={350}
          />
        ) : (
          <p className="text-gray-500">No hay productos vendidos para este rango.</p>
        )}
      </CardBody>
    </Card>
  );
}
