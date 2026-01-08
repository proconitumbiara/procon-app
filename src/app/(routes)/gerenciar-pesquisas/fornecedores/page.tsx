import { asc, eq } from "drizzle-orm";
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

import AddSupplierButton from "./_components/add-supplier-button";
import SuppliersFilters from "./_components/suppliers-filters";

const FornecedoresPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.user.id),
  });

  if (user?.role !== "administrator") {
    return <AccessDenied />;
  }

  const suppliers = await db.query.suppliersTable.findMany({
    orderBy: (table) => asc(table.name),
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Fornecedores</PageTitle>
          <PageDescription>
            Gerencie o cadastro de fornecedores.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddSupplierButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <SuppliersFilters suppliers={suppliers} />
      </PageContent>
    </PageContainer>
  );
};

export default FornecedoresPage;

