"use client"

import { ColumnDef } from "@tanstack/react-table"

import { clientsTable } from "@/db/schema"
import { formatCPF, formatPhoneNumber } from "@/lib/utils"

import TableClientActions from "./table-actions"

type Client = typeof clientsTable.$inferSelect;

export const clientsTableColumns = (sectors: { id: string; name: string }[]): ColumnDef<Client>[] => [
    {
        id: "name",
        accessorKey: "name",
        header: "Nome",
    },
    {
        id: "register",
        accessorKey: "register",
        header: "CPF",
        cell: ({ row }) => formatCPF(row.original.register),
    },
    {
        id: "phoneNumber",
        accessorKey: "phoneNumber",
        header: "Telefone",
        cell: ({ row }) => formatPhoneNumber(row.original.phoneNumber),
    },
    {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
            const client = row.original;
            return (
                <TableClientActions client={client} sectors={sectors} />
            )
        }
    },
]