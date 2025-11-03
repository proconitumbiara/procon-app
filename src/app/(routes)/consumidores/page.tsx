"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { PageActions, PageContainer, PageContent, PageDescription, PageHeader, PageHeaderContent, PageTitle } from "@/components/ui/page-container";
import { clientsTable, sectorsTable } from "@/db/schema";

import AddClientButton from "./_components/add-client-button";
import ClientFilters from "./_components/client-filters";

const fetchClientsAndSectors = async () => {
    const res = await fetch("/api/clients", { credentials: "same-origin" });
    if (!res.ok) {
        if (res.status === 401) throw new Error("unauthorized");
        throw new Error("Erro ao buscar clientes");
    }
    return res.json();
};

type Client = typeof clientsTable.$inferSelect;
type Sector = typeof sectorsTable.$inferSelect;

export default function ProfessionalServices() {
    const [clients, setClients] = useState<Client[]>([]);
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchClientsAndSectors();
            setClients(data.clients);
            setSectors(data.sectors);
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

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Consumidores</PageTitle>
                    <PageDescription>Visualize e gerencie os consumidores.</PageDescription>
                </PageHeaderContent>
                <PageActions>
                    <AddClientButton />
                </PageActions>
            </PageHeader>
            <PageContent>
                {loading ? (
                    <div>Carregando...</div>
                ) : (
                    <ClientFilters clients={clients} sectors={sectors} />
                )}
            </PageContent>
        </PageContainer>
    );
}