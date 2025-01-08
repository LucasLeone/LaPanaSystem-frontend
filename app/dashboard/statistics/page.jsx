"use client";

import { useCallback, useEffect, useState } from "react";
import { Spinner, Tooltip, Button, DateRangePicker, Input, Select, SelectItem } from "@nextui-org/react";
import { IconDownload } from "@tabler/icons-react";
import { getLocalTimeZone } from "@internationalized/date";
import Cookies from "js-cookie";
import api from "@/app/axios";

import { getISOWeek, getISOWeekYear } from 'date-fns';

import StatisticsTabs from "./components/StatisticsTabs";
import StatisticsCards from "./components/StatisticsCards";
import TopProductsChart from "./components/TopProductsChart";
import DailyBreakdownChart from "./components/DailyBreakdownChart";
import MonthlyBreakdownChart from "./components/MonthlyBreakdownChart";

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedTab, setSelectedTab] = useState("today");

  const [week, setWeek] = useState(() => {
    const now = new Date();
    const weekNumber = getISOWeek(now);
    const weekYear = getISOWeekYear(now);
    return `${weekYear}-W${weekNumber < 10 ? '0' + weekNumber : weekNumber}`;
  });

  const [month, setMonth] = useState(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return `${year}-${month < 10 ? '0' + month : month}`;
  });

  const [year, setYear] = useState("" + new Date().getFullYear());

  const [customRange, setCustomRange] = useState({ start: null, end: null });

  const start_date = customRange.start
    ? customRange.start.toDate(getLocalTimeZone()).toISOString().split("T")[0]
    : null;
  const end_date = customRange.end
    ? customRange.end.toDate(getLocalTimeZone()).toISOString().split("T")[0]
    : null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchStatistics = useCallback(async () => {
    if (selectedTab === "custom") {
      if (!start_date || !end_date) {
        setStatistics({});
        setIsLoading(false);
        return;
      }
    }

    const token = Cookies.get("access_token");
    let url = '/sales/statistics/';

    if (selectedTab === "today") {
      url += '?today';
    } else if (selectedTab === "week" && week) {
      url += `?week=${week}`;
    } else if (selectedTab === "month" && month) {
      url += `?month=${month}`;
    } else if (selectedTab === "year" && year) {
      url += `?year=${year}`;
    } else if (selectedTab === "custom" && customRange.start && customRange.end) {
      url += `?start_date=${start_date}&end_date=${end_date}`;
    }

    try {
      setIsLoading(true);
      const response = await api.get(url, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setStatistics(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching statistics", error);
      setIsLoading(false);
      // Opcional: setError("Hubo un problema al cargar las estadísticas.");
    }
  }, [selectedTab, month, week, year, customRange.start, customRange.end, start_date, end_date]);

  useEffect(() => {
    if (isMounted) {
      fetchStatistics();
    } else {
      setIsLoading(false);
    }
  }, [fetchStatistics, isMounted]);

  const isPeriodIncomplete = selectedTab === "custom" && (!customRange.start || !customRange.end);
  const showDailyBreakdown = (selectedTab === "week" || selectedTab === "month" || selectedTab === "custom") && !isPeriodIncomplete;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg">Cargando...</Spinner>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      {/* Encabezado y Botones */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Estadísticas</p>
        {/* <div className="flex flex-wrap gap-2">
          <Tooltip content="Exportar productos">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconDownload className="h-4 mr-1" />
              Exportar
            </Button>
          </Tooltip>
        </div> */}
      </div>

      {/* Tabs de Navegación */}
      <div className="flex w-full flex-col">
        <StatisticsTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      </div>

      {/* Selector de Semana */}
      {selectedTab === "week" && (
        <div className="mt-4 w-fit">
          <Input
            type="week"
            label="Semana"
            placeholder="Selecciona una semana"
            variant="underlined"
            value={week}
            onChange={(e) => setWeek(e.target.value)}
          />
        </div>
      )}

      {/* Selector de Mes */}
      {selectedTab === "month" && (
        <div className="mt-4 w-fit">
          <Input
            type="month"
            label="Mes"
            placeholder="Selecciona un mes"
            variant="underlined"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      )}

      {/* Selector de Año */}
      {selectedTab === "year" && (
        <div className="mt-4 max-w-[200px]">
          <Select
            label="Año"
            variant="underlined"
            onChange={(e) => setYear(e.target.value)}
            selectedKeys={[year]}
            disallowEmptySelection={true}
          >
            <SelectItem key="2024" value="2024">2024</SelectItem>
            <SelectItem key="2025" value="2025">2025</SelectItem>
          </Select>
        </div>
      )}

      {/* Selector de Rango de Fechas */}
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

      {/* Mostrar mensaje si el período está incompleto */}
      {isPeriodIncomplete ? (
        <div className="mt-4 text-center text-gray-500">
          Por favor, selecciona ambas fechas para ver las estadísticas.
        </div>
      ) : (
        <div>
          <StatisticsCards statistics={statistics} />
          <TopProductsChart mostSoldProducts={statistics.most_sold_products} />
          {showDailyBreakdown && (
            <DailyBreakdownChart dailyBreakdown={statistics.daily_breakdown} />
          )}
          {selectedTab === "year" && (
            <MonthlyBreakdownChart monthlyBreakdown={statistics.monthly_breakdown} />
          )}
        </div>
      )}
    </div>
  );
}
