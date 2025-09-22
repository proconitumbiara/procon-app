"use client";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

import { clientsTableColumns } from "./table-columns";

export default function ClientFilters({
  clients,
  sectors,
}: {
  clients: any[];
  sectors: any[];
}) {
  const [nameFilter, setNameFilter] = useState("");
  const [cpfFilter, setCpfFilter] = useState("");

  const filteredClients = useMemo(() => {
    let filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
        client.register.includes(cpfFilter),
    );
    // Se não há filtros, ordena por createdAT do mais novo para o mais antigo
    if (!nameFilter && !cpfFilter) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.createdAT).getTime();
        const dateB = new Date(b.createdAT).getTime();
        return dateB - dateA; // mais novo primeiro
      });
    }
    return filtered;
  }, [clients, nameFilter, cpfFilter]);

  const columns = useMemo(() => clientsTableColumns(sectors), [sectors]);

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
        <input
          type="text"
          placeholder="Buscar por CPF"
          value={cpfFilter}
          onChange={(e) => setCpfFilter(e.target.value)}
          className="rounded border p-2 text-sm"
        />
        <Button
          onClick={() => {
            setNameFilter("");
            setCpfFilter("");
          }}
          variant="link"
        >
          Resetar filtros
        </Button>
      </div>
      {/* Contador de registros */}
      <div className="text-muted-foreground mb-2 text-sm">
        {filteredClients.length} registro
        {filteredClients.length === 1 ? "" : "s"} encontrado
        {filteredClients.length === 1 ? "" : "s"}
      </div>
      <DataTable data={filteredClients} columns={columns} />
    </>
  );
}
