"use client";

import { ArrowLeft, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { formatCPF, formatPhoneNumber } from "@/lib/utils";

import ClientDetailCards from "./client-detail-cards";
import {
  clientDetailTableColumns,
  type ClientTicketRow,
} from "./client-detail-columns";

interface ClientDetailViewProps {
  client: {
    id: string;
    name: string;
    register: string;
    dateOfBirth: string | null;
    phoneNumber: string;
  };
  tickets: ClientTicketRow[];
}

export default function ClientDetailView({ client, tickets }: ClientDetailViewProps) {
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="icon" className="w-fit" asChild aria-label="Voltar aos consumidores">
              <Link href="/consumidores">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <PageTitle>{client.name}</PageTitle>
            <PageDescription className="flex flex-wrap gap-x-4 gap-y-1">
              <span>CPF: {formatCPF(client.register)}</span>
              <span>Telefone: {formatPhoneNumber(client.phoneNumber)}</span>
            </PageDescription>
          </div>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-muted-foreground text-sm">
            {tickets.length} ticket{tickets.length === 1 ? "" : "s"} e
            atendimento{tickets.length === 1 ? "" : "s"} vinculado
            {tickets.length === 1 ? "" : "s"}
          </p>
          <div className="flex gap-1">
            <Button
              variant={viewMode === "table" ? "secondary" : "outline"}
              size="icon"
              onClick={() => setViewMode("table")}
              aria-label="Visualização em tabela"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "cards" ? "secondary" : "outline"}
              size="icon"
              onClick={() => setViewMode("cards")}
              aria-label="Visualização em cards"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {tickets.length === 0 ? (
          <p className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
            Nenhum ticket ou atendimento vinculado a este consumidor.
          </p>
        ) : viewMode === "table" ? (
          <DataTable data={tickets} columns={clientDetailTableColumns} />
        ) : (
          <ClientDetailCards tickets={tickets} />
        )}
      </PageContent>
    </PageContainer>
  );
}
