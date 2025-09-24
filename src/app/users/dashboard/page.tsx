import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/ui/access-denied";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import getDashboard from "@/data/get-dashboard";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { DatePicker } from "./_components/date-picker";
import StatsCards from "./_components/stats-cards";
import TopProfessionals from "./_components/top-professionals";

interface DashboardPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
}

const Home = async ({ searchParams }: DashboardPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/");
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.user.id),
  });

  if (user?.role !== "administrator") {
    return <AccessDenied />;
  }

  // Período padrão: mês atual
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultTo = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const { from, to } = await searchParams;

  const fromDate = from ? new Date(from) : defaultFrom;
  const toDate = to ? new Date(to) : defaultTo;

  const dashboard = await getDashboard({ from: fromDate, to: toDate });

  // Filtrar profissionais com id e name válidos
  const professionals = dashboard.topProfessionals
    .filter((p) => !!p.professionalId && !!p.name)
    .map((p) => ({
      id: p.professionalId as string,
      name: p.name as string,
      avatarImageUrl: null, // Adapte se tiver url
      specialty: "", // Adapte se tiver especialidade
      appointments: p.total,
    }));

  return (
    <PageContainer className="flex min-h-screen flex-col">
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Relatórios e informações sobre a operação.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <DatePicker />
        </PageActions>
      </PageHeader>
      <PageContent className="flex flex-1 flex-col gap-6">
        <StatsCards
          totalAppointments={dashboard.totalTreatments}
          totalClients={dashboard.totalNewClients}
          totalCanceledTickets={dashboard.totalCanceledTickets}
          averageTreatmentDuration={dashboard.averageTreatmentDuration}
          averageWaitingTimeMinutes={dashboard.averageWaitingTimeMinutes}
        />
        <TopProfessionals professionals={professionals} />
      </PageContent>
    </PageContainer>
  );
};

export default Home;
