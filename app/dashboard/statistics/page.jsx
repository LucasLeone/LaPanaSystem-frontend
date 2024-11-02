"use client";

import {
  Tooltip,
  Button,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Tabs,
  Tab,
  DateRangePicker,
} from "@nextui-org/react";
import {
  IconDownload,
  IconTrendingUp,
  IconCash,
  IconArrowUpRight,
} from "@tabler/icons-react";
import { useState } from "react";
import { formatDateForDisplay } from "@/app/utils";
import { getLocalTimeZone } from "@internationalized/date";
import useStatistics from "@/app/hooks/useStatistics";
import dynamic from 'next/dynamic';
import { IconArrowBack } from "@tabler/icons-react";
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function StatisticsPage() {
  const [selectedTab, setSelectedTab] = useState("today");
  const [customRange, setCustomRange] = useState({
    start: null,
    end: null,
  });

  const formattedRange = {
    start_date: customRange.start ? customRange.start.toDate(getLocalTimeZone()).toISOString().split('T')[0] : null,
    end_date: customRange.end ? customRange.end.toDate(getLocalTimeZone()).toISOString().split('T')[0] : null,
  };

  const { statistics, loading } = useStatistics(
    selectedTab === "custom" && formattedRange.start_date && formattedRange.end_date ? formattedRange : {}
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg">Cargando...</Spinner>
      </div>
    );
  }

  const prepareChartData = () => {
    const products = statistics[selectedTab]?.most_sold_products || [];
    const topProducts = products.slice(0, 10);
    const categories = topProducts.map((product) => product.product_name);
    const seriesData = topProducts.map((product) => product.total_quantity_sold);

    return {
      categories,
      seriesData,
    };
  };

  const { categories, seriesData } = prepareChartData();

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: categories,
      title: {
        text: 'Productos'
      },
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
        }
      },
    },
    yaxis: {
      title: {
        text: 'Cantidad Vendida'
      }
    },
    fill: {
      opacity: 1,
      colors: ['#4CAF50']
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return `${val} unidades`;
        }
      }
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '70%',
            }
          },
          xaxis: {
            labels: {
              rotate: -90
            }
          }
        }
      }
    ]
  };

  const chartSeries = [
    {
      name: 'Cantidad Vendida',
      data: seriesData
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      {/* Encabezado y Botones */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Estadísticas</p>
        <div className="flex flex-wrap gap-2">
          <Tooltip content="Exportar productos">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconDownload className="h-4 mr-1" />
              Exportar
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="flex w-full flex-col">
        <Tabs
          aria-label="Options"
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full",
            tab: "max-w-fit px-0 h-12",
          }}
          selectedKey={selectedTab}
          onSelectionChange={setSelectedTab}
        >
          <Tab key="today" title="Hoy" value="today" />
          <Tab key="week" title="Semana" value="week" />
          <Tab key="month" title="Mes" value="month" />
          <Tab key="custom" title="Rango de Fechas" value="custom" />
        </Tabs>
      </div>

      {/* Selector de Rango de Fechas para la Pestaña Custom */}
      {selectedTab === "custom" && (
        <div className="mt-4 w-fit">
          <DateRangePicker
            value={customRange}
            onChange={setCustomRange}
            placeholder="Selecciona un rango de fechas"
            label="Rango de Fechas"
            variant="underlined"
          />
        </div>
      )}

      {/* Sección Mejorada de Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full mt-6">
        {/* Ventas */}
        <Card isHoverable variant="bordered" className="shadow-lg">
          <CardHeader className="flex items-center">
            <IconCash className="w-6 h-6 text-green-500 mr-2" />
            <p className="font-semibold">Ventas</p>
          </CardHeader>
          <CardBody>
            <p className="text-lg font-semibold">{parseFloat(statistics[selectedTab]?.total_sales).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</p>
            <p className="text-green-500 text-sm">
              {statistics[selectedTab]?.total_sales_count} ventas
            </p>
          </CardBody>
        </Card>

        {/* Devoluciones */}
        <Card isHoverable variant="bordered" className="shadow-lg">
          <CardHeader className="flex items-center">
            <IconArrowBack className="w-6 h-6 text-red-500 mr-2" />
            <p className="font-semibold">Devoluciones</p>
          </CardHeader>
          <CardBody>
            <p className="text-lg font-semibold">{parseFloat(statistics[selectedTab]?.total_returns_amount).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</p>
          </CardBody>
        </Card>

        {/* Total Cobrado */}
        <Card isHoverable variant="bordered" className="shadow-lg">
          <CardHeader className="flex items-center">
            <IconCash className="w-6 h-6 text-blue-500 mr-2" />
            <p className="font-semibold">Total Cobrado</p>
          </CardHeader>
          <CardBody>
            <p className="text-lg font-semibold">{parseFloat(statistics[selectedTab]?.total_collected_amount).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</p>
          </CardBody>
        </Card>

        {/* Gastos */}
        <Card isHoverable variant="bordered" className="shadow-lg">
          <CardHeader className="flex items-center">
            <IconArrowUpRight className="w-6 h-6 text-yellow-500 mr-2" />
            <p className="font-semibold">Gastos</p>
          </CardHeader>
          <CardBody>
            <p className="text-lg font-semibold">{parseFloat(statistics[selectedTab]?.total_expenses).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</p>
          </CardBody>
        </Card>

        {/* Ganancias */}
        <Card isHoverable variant="bordered" className="shadow-lg">
          <CardHeader className="flex items-center">
            <IconTrendingUp className="w-6 h-6 text-green-500 mr-2" />
            <p className="font-semibold">Ganancias</p>
          </CardHeader>
          <CardBody>
            <p className="text-lg font-semibold">{parseFloat(statistics[selectedTab]?.total_profit).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</p>
          </CardBody>
        </Card>
      </div>

      {/* Productos Más Vendidos */}
      <div className="w-full mt-6">
        <Card isHoverable variant="bordered" className="shadow-lg">
          <CardHeader>
            <p className="font-semibold">Productos Más Vendidos</p>
          </CardHeader>
          <CardBody>
            {categories.length > 0 ? (
              <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type="bar"
                height={350}
              />
            ) : (
              <p className="text-gray-500">No hay productos vendidos para esta pestaña.</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Desgloses Diarios */}
      {selectedTab !== "today" && statistics[selectedTab]?.daily_breakdown && (
        <div className="w-full mt-6">
          <Card variant="bordered" className="shadow-lg">
            <CardHeader>
              <p className="font-semibold">Desglose Diario</p>
            </CardHeader>
            <CardBody>
              {statistics[selectedTab].daily_breakdown.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devoluciones</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cobrado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gastos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganancias</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {statistics[selectedTab].daily_breakdown.map((day) => (
                      <tr key={day.date}>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDateForDisplay(day.date, false)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{parseFloat(day.total_sales).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{parseFloat(day.total_returns).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{parseFloat(day.net_collected).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{parseFloat(day.daily_expenses).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{parseFloat(day.daily_profit).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No hay desgloses disponibles para esta pestaña.</p>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
