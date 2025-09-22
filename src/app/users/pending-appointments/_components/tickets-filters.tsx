"use client";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

import { ticketsTableColumns, TicketTableRow } from "./table-columns";

interface TicketsFiltersProps {
  tickets: TicketTableRow[];
  sectors: { id: string; name: string }[];
}

export default function TicketsFilters({
  tickets,
  sectors,
}: TicketsFiltersProps) {
  const [nameFilter, setNameFilter] = useState("");
  const [cpfFilter, setCpfFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");

  const filteredTickets = useMemo(() => {
    let filtered = tickets.filter(
      (ticket) =>
        ticket.clientName.toLowerCase().includes(nameFilter.toLowerCase()) &&
        ticket.clientId.includes(cpfFilter) &&
        (statusFilter ? ticket.status === statusFilter : true) &&
        (sectorFilter ? ticket.sectorId === sectorFilter : true),
    );
    // Se não há filtros, ordena por createdAt do mais novo para o mais antigo
    if (!nameFilter && !cpfFilter && !statusFilter && !sectorFilter) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // mais novo primeiro
      });
    }
    return filtered;
  }, [tickets, nameFilter, cpfFilter, statusFilter, sectorFilter]);

  return (
    <>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="rounded border p-2 text-sm"
        />
        <input
          type="text"
          placeholder="Buscar por CPF..."
          value={cpfFilter}
          onChange={(e) => setCpfFilter(e.target.value)}
          className="rounded border p-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border p-2 text-sm"
        >
          <option value="" className="bg-background">
            Status
          </option>
          <option value="pending" className="bg-background">
            Pendente
          </option>
          <option value="in-attendance" className="bg-background">
            Em atendimento
          </option>
          <option value="finished" className="bg-background">
            Atendido
          </option>
          <option value="canceled" className="bg-background">
            Cancelado
          </option>
        </select>
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="rounded border p-2 text-sm"
        >
          <option value="" className="bg-background">
            Setores
          </option>
          {sectors.map((sector) => (
            <option key={sector.id} value={sector.id} className="bg-background">
              {sector.name}
            </option>
          ))}
        </select>
        <Button
          onClick={() => {
            setNameFilter("");
            setCpfFilter("");
            setStatusFilter("");
            setSectorFilter("");
          }}
          variant="link"
        >
          Resetar filtros
        </Button>
      </div>
      {/* Contador de registros */}
      <div className="text-muted-foreground mb-2 text-sm">
        {filteredTickets.length} registro
        {filteredTickets.length === 1 ? "" : "s"} encontrado
        {filteredTickets.length === 1 ? "" : "s"}
      </div>
      <DataTable data={filteredTickets} columns={ticketsTableColumns} />
    </>
  );
}
