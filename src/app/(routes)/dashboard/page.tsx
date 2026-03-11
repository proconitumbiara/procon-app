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
import { auth } from "@/lib/auth";
import {
  getCurrentMonthInSaoPaulo,
  saoPauloDateStringToUTCEnd,
  saoPauloDateStringToUTCStart,
} from "@/lib/timezone-utils";

import { DatePicker } from "./_components/date-picker";
import StatsCards from "./_components/stats-cards";
import TopProfessionals from "./_components/top-professionals";

interface DashboardPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  // session.user.role já é resolvido via customSession — sem query extra ao banco
  if (session.user.role !== "administrator") {
    return <AccessDenied />;
  }

  // Período padrão: mês atual no fuso de São Paulo
  const { year, month, lastDay } = getCurrentMonthInSaoPaulo();
  const mm = String(month).padStart(2, "0");
  const dd = String(lastDay).padStart(2, "0");

  const defaultFromStr = `${year}-${mm}-01`;
  const defaultToStr = `${year}-${mm}-${dd}`;

  const { from, to } = await searchParams;

  // Interpreta as strings YYYY-MM-DD como datas no calendário de Brasília (UTC-3),
  // convertendo para os limites UTC corretos para as queries no banco.
  const fromDate = from
    ? saoPauloDateStringToUTCStart(from)
    : saoPauloDateStringToUTCStart(defaultFromStr);

  const toDate = to
    ? saoPauloDateStringToUTCEnd(to)
    : saoPauloDateStringToUTCEnd(defaultToStr);

  const dashboard = await getDashboard({ from: fromDate, to: toDate });

  const professionals = dashboard.topProfessionals.map((p) => ({
    id: p.professionalId as string,
    name: p.name as string,
    avatarImageUrl: null,
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
          <DatePicker defaultFromStr={defaultFromStr} defaultToStr={defaultToStr} />
        </PageActions>
      </PageHeader>
      <PageContent className="flex flex-1 flex-col gap-6">
        <StatsCards
          totalAppointments={dashboard.totalTreatments}
          totalClients={dashboard.totalNewClients}
          totalCanceledTickets={dashboard.totalCanceledTickets}
          averageTreatmentDuration={dashboard.averageTreatmentDuration}
          averageWaitingTimeMinutes={dashboard.averageWaitingTimeMinutes}
          averageTotalWaitingTimeMinutes={dashboard.averageTotalWaitingTimeMinutes}
        />
        <TopProfessionals professionals={professionals} />
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
