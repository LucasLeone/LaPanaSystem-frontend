"use client";

import { Tabs, Tab } from "@nextui-org/react";

export default function StatisticsTabs({ selectedTab, setSelectedTab }) {

  return (
    <Tabs
      aria-label="Options"
      variant="underlined"
      selectedKey={selectedTab}
      onSelectionChange={setSelectedTab}
      classNames={{
        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
        cursor: "w-full",
        tab: "max-w-fit px-0 h-12",
      }}
    >
      <Tab key="today" title="Hoy" value="today" />
      <Tab key="week" title="Semana" value="week" />
      <Tab key="month" title="Mes" value="month" />
      <Tab key="year" title="Año" value="year" />
      <Tab key="custom" title="Rango de Fechas" value="custom" />
    </Tabs>
  );
}
