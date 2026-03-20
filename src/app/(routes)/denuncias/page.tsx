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
import { db } from "@/db";
import { complaintsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { buildUserPermissions } from "@/lib/authorization";

import ComplaintsCards from "./_components/complaints-cards";

const DenunciasPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const perms = buildUserPermissions({
    id: session.user.id,
    role: session.user.role,
    profile: (session.user as any).profile,
  });

  if (!perms.can("complaints.view")) {
    return <AccessDenied />;
  }

  const complaintsRaw = await db.query.complaintsTable.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  const complaints = complaintsRaw.map((c) => ({
    id: c.id,
    isAnonymous: c.isAnonymous,
    respondentCompanyName: c.respondentCompanyName,
    factsDescription: c.factsDescription,
    request: c.request,
    filingDate: c.filingDate,
    viewingDate: c.viewingDate,
    createdAt: c.createdAt,
    viewingStatus: c.viewingStatus as "pending" | "viewed",
  }));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Denúncias</PageTitle>
          <PageDescription>
            Acompanhe as denúncias e marque quando já foram visualizadas.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <></>
        </PageActions>
      </PageHeader>
      <PageContent>
        {complaints.length === 0 ? (
          <p className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
            Nenhuma denúncia encontrada.
          </p>
        ) : (
          <ComplaintsCards complaints={complaints} />
        )}
      </PageContent>
    </PageContainer>
  );
};

export default DenunciasPage;

