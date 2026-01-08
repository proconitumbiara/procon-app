"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useTicketsWebSocket } from "@/hooks/use-tickets-websocket";

import { ticketsTableColumns, TicketTableRow } from "./table-columns";

interface TicketsFiltersProps {
  tickets: TicketTableRow[];
  sectors: { id: string; name: string }[];
}

export default function TicketsFilters({
  tickets: initialTickets,
  sectors,
}: TicketsFiltersProps) {
  const [tickets, setTickets] = useState(initialTickets);
  const [nameFilter, setNameFilter] = useState("");
  const [cpfFilter, setCpfFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [showAllTickets, setShowAllTickets] = useState(false);

  // Função para recarregar tickets
  const reloadTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets", { credentials: "same-origin" });
      if (!res.ok) {
        if (res.status === 401) throw new Error("unauthorized");
        throw new Error("Erro ao buscar tickets");
      }
      const data = await res.json();
      
      // Buscar clientes e setores
      const clientsRes = await fetch("/api/clients", { credentials: "same-origin" });
      if (!clientsRes.ok) throw new Error("Erro ao buscar clientes/setores");
      const clientsSectorsData = await clientsRes.json();
      
      const clientsMap = Object.fromEntries(
        (clientsSectorsData.clients || []).map((c: { id: string; name: string }) => [c.id, c.name])
      );
      const sectorsMap = Object.fromEntries(
        (clientsSectorsData.sectors || []).map((s: { id: string; name: string }) => [s.id, s.name])
      );
      
      const mapped: TicketTableRow[] = (data.tickets || []).map(
        (ticket: { id: string; status: string; priority: number; clientId: string; sectorId: string; createdAT: string; createdAt: string }) => ({
          id: ticket.id,
          status: ticket.status,
          priority: ticket.priority ?? 0,
          clientName: clientsMap[ticket.clientId] || ticket.clientId,
          clientId: ticket.clientId,
          sectorName: sectorsMap[ticket.sectorId] || ticket.sectorId,
          sectorId: ticket.sectorId,
          createdAt: new Date(ticket.createdAT ?? ticket.createdAt),
        })
      );
      
      setTickets(mapped);
    } catch (error) {
      console.error("Erro ao recarregar tickets:", error);
    }
  }, []);

  // Conectar ao WebSocket para atualizações em tempo real
  useTicketsWebSocket(reloadTickets);

  // Atualizar tickets quando initialTickets mudar (server-side update)
  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  // Polling como fallback (60 segundos)
  useEffect(() => {
    const interval = setInterval(reloadTickets, 60000);
    return () => clearInterval(interval);
  }, [reloadTickets]);

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

  const displayedTickets = useMemo(() => {
    return showAllTickets ? filteredTickets : filteredTickets.slice(0, 20);
  }, [filteredTickets, showAllTickets]);

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
      <DataTable data={displayedTickets} columns={ticketsTableColumns} />
      {filteredTickets.length > 20 && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => setShowAllTickets(!showAllTickets)}
          >
            {showAllTickets
              ? "Ver menos"
              : `Ver mais (${filteredTickets.length - 20} restantes)`}
          </Button>
        </div>
      )}
    </>
  );
}
