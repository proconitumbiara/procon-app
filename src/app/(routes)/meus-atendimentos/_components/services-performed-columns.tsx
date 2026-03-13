"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"


export type ServicePerformedTableRow = {
    id: string
    status: string
    sectorName: string
    sectorId: string
    servicePointName: string
    servicePointId: string
    createdAt: Date
    calledAt: Date | null
    finishedAt: Date | null
    clientName: string
}

export const servicesPerformedColumns: ColumnDef<ServicePerformedTableRow>[] = [
    {
        id: "clientName",
        accessorKey: "clientName",
        header: "Consumidor",
    },
    {
        id: "sectorName",
        accessorKey: "sectorName",
        header: "Setor",
    },
    {
        id: "servicePointName",
        accessorKey: "servicePointName",
        header: "Ponto de serviço",
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
            } else if (status === "cancelled") {
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
    {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Data de criação",
        cell: ({ row }) => {
            const date = row.original.createdAt;
            return date ? new Date(date).toLocaleString("pt-BR") : "-";
        },
    },
    {
        id: "calledAt",
        accessorKey: "calledAt",
        header: "Chamado em",
        cell: ({ row }) => {
            const date = row.original.calledAt;
            return date ? new Date(date).toLocaleString("pt-BR") : "-";
        },
    },
    {
        id: "finishedAt",
        accessorKey: "finishedAt",
        header: "Finalizado em",
        cell: ({ row }) => {
            const date = row.original.finishedAt;
            return date ? new Date(date).toLocaleString("pt-BR") : "-";
        },
    },
]