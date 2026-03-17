import { eq, or } from "drizzle-orm";
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
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  assertSectorKeyAccess,
  buildUserPermissions,
} from "@/lib/authorization";

import OperationsCard from "./_components/operations-card";

const Operations = async () => {
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

  if (!perms.can("operations.view")) {
    return <AccessDenied />;
  }

  // Buscar operações com status 'operating' ou 'in-attendance', incluindo joins e atendimentos
  const operationsRaw = await db.query.operationsTable.findMany({
    where: (op, { eq, or }) =>
      or(eq(op.status, "operating"), eq(op.status, "in-attendance")),
    with: {
      servicePoint: {
        with: {
          sector: true,
        },
      },
      user: true,
      treatments: {
        where: (treatment, { eq }) => eq(treatment.status, "in_service"),
        with: {
          ticket: {
            with: {
              client: true,
            },
          },
        },
      },
    },
  });

  const operations = operationsRaw.filter((op) => {
    try {
      assertSectorKeyAccess(perms, op.servicePoint.sector?.key_name);
      return true;
    } catch {
      return false;
    }
  });

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.user.id),
  });

  if (!user?.role) {
    return <AccessDenied />;
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Operações</PageTitle>
          <PageDescription>
            Gerencie as operações do seu atendimento
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <></>
        </PageActions>
      </PageHeader>
      <PageContent>
        <OperationsCard operations={operations} />
      </PageContent>
    </PageContainer>
  );
};

export default Operations;
