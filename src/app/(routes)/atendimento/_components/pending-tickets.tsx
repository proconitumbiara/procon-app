"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useTicketsWebSocket } from "@/hooks/use-tickets-websocket";

import CallNextTicketButton from "./call-next-ticket-button";
import { ticketsTableColumns, TicketTableRow } from "./tickets-table-columns";

const fetchPendingTicketsWithNames = async () => {
    const res = await fetch("/api/tickets/pending-with-names", { credentials: "same-origin" });
    if (!res.ok) {
        if (res.status === 401) throw new Error("unauthorized");
        throw new Error("Erro ao buscar tickets");
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
            const data = await fetchPendingTicketsWithNames();
            const tickets = data.tickets ?? [];
            const mapped: TicketTableRow[] = tickets.map(
                (ticket: {
                    id: string;
                    status: string;
                    priority: number;
                    clientId: string;
                    clientName: string;
                    sectorId: string;
                    sectorName: string;
                    createdAt: string;
                }) => ({
                    id: ticket.id,
                    status: ticket.status,
                    priority: ticket.priority ?? 0,
                    clientName: ticket.clientName ?? "-",
                    clientId: ticket.clientId,
                    sectorName: ticket.sectorName ?? "-",
                    sectorId: ticket.sectorId,
                    createdAt: new Date(ticket.createdAt),
                }),
            );
            setTableData(mapped);
            setLoading(false);
        } catch (err: unknown) {
            if (err instanceof Error && err.message === "unauthorized") {
                router.replace("/");
            }
            setLoading(false);
        }
    }, [router]);

    // Conectar ao WebSocket para atualizações em tempo real
    useTicketsWebSocket(loadData);

    useEffect(() => {
        loadData();
        // Manter polling como fallback, mas com intervalo maior (60s)
        const interval = setInterval(loadData, 60000);
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