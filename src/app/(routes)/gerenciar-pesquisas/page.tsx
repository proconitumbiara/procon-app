import { asc, desc, eq } from "drizzle-orm";
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

import AddPriceSearchButton from "./_components/add-price-search-button";
import PriceSearchesGrid from "./_components/price-searches-grid";

const GerenciarPesquisasPage = async () => {
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

  const [priceSearches, suppliers, categories] = await Promise.all([
    db.query.priceSearchesTable.findMany({
      orderBy: (table) => desc(table.createdAT),
      with: {
        products: {
          with: {
            supplier: true,
            category: true,
          },
        },
      },
    }),
    db.query.suppliersTable.findMany({
      orderBy: (table) => asc(table.name),
    }),
    db.query.categoriesTable.findMany({
      orderBy: (table) => asc(table.name),
    }),
  ]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Pesquisas de preços</PageTitle>
          <PageDescription>
            Cadastre e acompanhe as pesquisas e seus itens.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddPriceSearchButton suppliers={suppliers} categories={categories} />
        </PageActions>
      </PageHeader>
      <PageContent>
        <PriceSearchesGrid
          priceSearches={priceSearches}
          suppliers={suppliers}
          categories={categories}
        />
      </PageContent>
    </PageContainer>
  );
};

export default GerenciarPesquisasPage;
