// app/statistics/components/StatisticsCards.jsx
"use client";

import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import {
  IconCash,
  IconArrowBack,
  IconArrowDownRight,
  IconTrendingUp,
} from "@tabler/icons-react";

export default function StatisticsCards({ statistics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full mt-6">
      {/* Ventas */}
      <Card variant="bordered" className="shadow-lg">
        <CardHeader className="flex items-center">
          <IconCash className="w-6 h-6 text-green-500 mr-2" />
          <p className="font-semibold">Ventas</p>
        </CardHeader>
        <Divider />
        <CardBody>
          <p className="text-lg font-semibold">
            {statistics.total_sales ? parseFloat(statistics.total_sales).toLocaleString("es-AR", {
              style: "currency",
              currency: "ARS",
            }) : "$0"}
          </p>
          <p className="text-green-500 text-sm">
            {statistics.total_sales_count ? statistics.total_sales_count : "0"} ventas
          </p>
        </CardBody>
      </Card>

      {/* Devoluciones */}
      <Card variant="bordered" className="shadow-lg">
        <CardHeader className="flex items-center">
          <IconArrowBack className="w-6 h-6 text-red-500 mr-2" />
          <p className="font-semibold">Devoluciones</p>
        </CardHeader>
        <Divider />
        <CardBody>
          <p className="text-lg font-semibold">
            {statistics.total_returns_amount ? parseFloat(statistics.total_returns_amount).toLocaleString("es-AR", {
              style: "currency",
              currency: "ARS",
            }) : "$0"}
          </p>
        </CardBody>
      </Card>

      {/* Total Cobrado */}
      <Card variant="bordered" className="shadow-lg">
        <CardHeader className="flex items-center">
          <IconCash className="w-6 h-6 text-blue-500 mr-2" />
          <p className="font-semibold">Total Cobrado</p>
        </CardHeader>
        <Divider />
        <CardBody>
          <p className="text-lg font-semibold">
            {statistics.total_collected_amount ? parseFloat(statistics.total_collected_amount).toLocaleString(
              "es-AR",
              { style: "currency", currency: "ARS" }
            ) : "$0"}
          </p>
        </CardBody>
      </Card>

      {/* Gastos */}
      <Card variant="bordered" className="shadow-lg">
        <CardHeader className="flex items-center">
          <IconArrowDownRight className="w-6 h-6 text-yellow-500 mr-2" />
          <p className="font-semibold">Gastos</p>
        </CardHeader>
        <Divider />
        <CardBody>
          <p className="text-lg font-semibold">
            {statistics.total_expenses ? parseFloat(statistics.total_expenses).toLocaleString("es-AR", {
              style: "currency",
              currency: "ARS",
            }) : "$0"}
          </p>
        </CardBody>
      </Card>

      {/* Ganancias */}
      <Card variant="bordered" className="shadow-lg">
        <CardHeader className="flex items-center">
          <IconTrendingUp className="w-6 h-6 text-green-500 mr-2" />
          <p className="font-semibold">Ganancias</p>
        </CardHeader>
        <Divider />
        <CardBody>
          <p className="text-lg font-semibold">
            {statistics.total_profit ? parseFloat(statistics.total_profit).toLocaleString("es-AR", {
              style: "currency",
              currency: "ARS",
            }) : "$0"}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
