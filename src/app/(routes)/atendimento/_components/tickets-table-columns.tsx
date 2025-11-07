"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"


export type TicketTableRow = {
    id: string
    status: string
    priority: number
    clientName: string
    clientId: string
    sectorName: string
    sectorId: string
    createdAt: Date
}

export const ticketsTableColumns: ColumnDef<TicketTableRow>[] = [
    {
        id: "clientName",
        accessorKey: "clientName",
        header: "Cliente",
    },
    {
        id: "sectorName",
        accessorKey: "sectorName",
        header: "Setor",
    },
    {
        id: "priority",
        accessorKey: "priority",
        header: "Prioridade",
        cell: ({ row }) => {
            const priority = row.original.priority;
            const label = priority === 1 ? "Prioritário" : "Comum";
            const color = priority === 1 
                ? "bg-purple-100 text-purple-800 border-purple-300" 
                : "bg-gray-100 text-gray-800 border-gray-300";
            return (
                <Badge className={color}>{label}</Badge>
            );
        },
    },
    {
        id: "status",
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            let label = status;
            let color = "";
            if (status === "pending") {
                label = "Aguardando";
                color = "bg-yellow-100 text-yellow-800 border-yellow-300";
            } else if (status === "canceled") {
                label = "Cancelado";
                color = "bg-red-100 text-red-800 border-red-300";
            } else if (status === "finished") {
                label = "Atendido";
                color = "bg-green-100 text-green-800 border-green-300";
            }
            return (
                <Badge className={color}>{label}</Badge>
            );
        },
    },
]