"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

import {
  ServicePerformedTableRow,
  servicesPerformedColumns,
} from "./services-performed-columns";

interface ServicesPerformedListProps {
  tableData: ServicePerformedTableRow[];
}

export default function ServicesPerformedList({
  tableData,
}: ServicesPerformedListProps) {
  const [showAll, setShowAll] = useState(false);

  const displayed = useMemo(() => {
    return showAll ? tableData : tableData.slice(0, 20);
  }, [tableData, showAll]);

  if (!tableData.length) {
    return (
      <div className="text-muted-foreground w-full text-center text-sm">
        Nenhum atendimento realizado hoje.
      </div>
    );
  }

  return (
    <>
      <div className="text-muted-foreground mb-2 text-sm">
        {tableData.length} registro
        {tableData.length === 1 ? "" : "s"} encontrado
        {tableData.length === 1 ? "" : "s"}
      </div>
      <DataTable data={displayed} columns={servicesPerformedColumns} />
      {tableData.length > 20 && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll
              ? "Ver menos"
              : `Ver mais (${tableData.length - 20} restantes)`}
          </Button>
        </div>
      )}
    </>
  );
}
