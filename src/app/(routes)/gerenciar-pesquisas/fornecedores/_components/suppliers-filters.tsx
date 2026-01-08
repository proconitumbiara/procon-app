"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { suppliersTable } from "@/db/schema";

import { suppliersTableColumns } from "./suppliers-table-columns";

type Supplier = typeof suppliersTable.$inferSelect;

interface SuppliersFiltersProps {
  suppliers: Supplier[];
}

export default function SuppliersFilters({ suppliers }: SuppliersFiltersProps) {
  const [nameFilter, setNameFilter] = useState("");

  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(nameFilter.toLowerCase()),
    );
    // Se não há filtros, ordena por createdAT do mais novo para o mais antigo
    if (!nameFilter) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.createdAT).getTime();
        const dateB = new Date(b.createdAT).getTime();
        return dateB - dateA; // mais novo primeiro
      });
    }
    return filtered;
  }, [suppliers, nameFilter]);

  const columns = useMemo(() => suppliersTableColumns(), []);

  return (
    <>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Buscar por nome"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="rounded border p-2 text-sm"
        />
        <Button
          onClick={() => {
            setNameFilter("");
          }}
          variant="link"
        >
          Resetar filtros
        </Button>
      </div>
      {/* Contador de registros */}
      <div className="text-muted-foreground mb-2 text-sm">
        {filteredSuppliers.length} registro
        {filteredSuppliers.length === 1 ? "" : "s"} encontrado
        {filteredSuppliers.length === 1 ? "" : "s"}
      </div>
      <DataTable data={filteredSuppliers} columns={columns} />
    </>
  );
}
