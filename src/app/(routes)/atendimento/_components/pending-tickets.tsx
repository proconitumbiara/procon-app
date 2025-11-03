"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";

import CallNextTicketButton from "./call-next-ticket-button";
import { ticketsTableColumns, TicketTableRow } from "./tickets-table-columns";

const fetchTickets = async () => {
    const res = await fetch("/api/tickets", { credentials: "same-origin" });
    if (!res.ok) {
        if (res.status === 401) throw new Error("unauthorized");
        throw new Error("Erro ao buscar tickets");
    }
    return res.json();
};

const fetchClientsAndSectors = async () => {
    const res = await fetch("/api/clients", { credentials: "same-origin" });
    if (!res.ok) {
        if (res.status === 401) throw new Error("unauthorized");
        throw new Error("Erro ao buscar clientes/setores");
    }
    return res.json();
};

export default function PendingTickets() {
    const [tableData, setTableData] = useState<TicketTableRow[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [ticketsData, clientsSectorsData] = await Promise.all([
                fetchTickets(),
                fetchClientsAndSectors(),
            ]);
            const clientsMap = Object.fromEntries((clientsSectorsData.clients || []).map((c: { id: string; name: string }) => [c.id, c.name]));
            const sectorsMap = Object.fromEntries((clientsSectorsData.sectors || []).map((s: { id: string; name: string }) => [s.id, s.name]));
            const tickets = (ticketsData.tickets || []);
            const mapped: TicketTableRow[] = tickets.map((ticket: { id: string; status: string; clientId: string; sectorId: string; createdAT: string; createdAt: string }) => ({
                id: ticket.id,
                status: ticket.status,
                clientName: clientsMap[ticket.clientId] || ticket.clientId,
                clientId: ticket.clientId,
                sectorName: sectorsMap[ticket.sectorId] || ticket.sectorId,
                sectorId: ticket.sectorId,
                createdAt: new Date(ticket.createdAT ?? ticket.createdAt),
            })).sort((a: TicketTableRow, b: TicketTableRow) => a.createdAt.getTime() - b.createdAt.getTime());
            setTableData(mapped);
            setLoading(false);
        } catch (err: unknown) {
            if (err instanceof Error && err.message === "unauthorized") {
                router.replace("/");
            }
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [loadData]);

    if (loading) {
        return <Card className="w-full h-full text-sm text-muted-foreground text-center">Carregando...</Card>;
    }

    if (!tableData.length) {
        return <Card className="w-full h-full text-sm text-muted-foreground text-center">Nenhum atendimento pendente.</Card>;
    }

    return (
        <div className="flex flex-col gap-4 w-full h-full max-h-[80vh]">
            <Card className="w-full h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Atendimentos Pendentes</CardTitle>
                    <CallNextTicketButton />
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-0">
                    <div className="p-6">
                        <DataTable data={tableData} columns={ticketsTableColumns} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}