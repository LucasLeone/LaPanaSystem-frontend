"use client"

import {
  Tooltip,
  Button,
  Card,
  CardHeader,
  CardBody,
  Spinner
} from "@nextui-org/react";
import { IconDownload } from "@tabler/icons-react";
import useStatistics from "@/app/hooks/useStatistics";

export default function StatisticsPage() {
  const { statistics, loading } = useStatistics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg">Cargando...</Spinner>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
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
    </div>
  );
}