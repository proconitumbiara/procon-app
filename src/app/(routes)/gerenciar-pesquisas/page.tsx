import { asc, desc, eq } from "drizzle-orm";
import { Package, Truck } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/ui/access-denied";
import { Button } from "@/components/ui/button";
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

  const [priceSearches, suppliers, categories, products] = await Promise.all([
    db.query.priceSearchesTable.findMany({
      orderBy: (table) => desc(table.createdAT),
      with: {
        items: {
          with: {
            product: {
              with: {
                category: true,
              },
            },
            supplier: true,
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
    db.query.productsTable.findMany({
      orderBy: (table) => asc(table.name),
      with: {
        category: true,
      },
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
          <div className="flex gap-2">
            <Button variant="secondary" className="no-underline" asChild>
              <Link href="/gerenciar-pesquisas/produtos">
                <Package className="mr-2 h-4 w-4" />
                Gerenciar Produtos
              </Link>
            </Button>
            <Button variant="secondary" className="no-underline" asChild>
              <Link href="/gerenciar-pesquisas/fornecedores">
                <Truck className="mr-2 h-4 w-4" />
                Gerenciar Fornecedores
              </Link>
            </Button>
            <AddPriceSearchButton
              suppliers={suppliers}
              categories={categories}
              products={products}
            />
          </div>
        </PageActions>
      </PageHeader>
      <PageContent>
        <PriceSearchesGrid
          priceSearches={priceSearches}
          suppliers={suppliers}
          categories={categories}
          products={products}
        />
      </PageContent>
    </PageContainer>
  );
};

export default GerenciarPesquisasPage;
