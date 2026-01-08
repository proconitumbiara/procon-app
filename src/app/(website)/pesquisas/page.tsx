import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import PriceSearchCard from "@/components/website/cards/PriceSearchCard";
import Footer from "@/components/website/global/Footer";
import Header from "@/components/website/global/Header";
import { getAllPriceSearches } from "@/lib/data/content";

const DEFAULT_PRICE_SEARCH_IMAGE = "/LogoHorizontal.png";

export default async function PesquisasPage() {
  const priceSearches = await getAllPriceSearches();
  const hasPriceSearches = priceSearches.length > 0;

  return (
    <>
      <Header />
      <main id="main-content" role="main" aria-label="Conteúdo principal">
        <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Início</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Pesquisas de Preço</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Título da página */}
          <div className="mb-8">
            <h1 className="text-foreground mb-2 text-3xl font-bold sm:text-4xl">
              Pesquisas de Preço
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Compare os preços de produtos em diferentes estabelecimentos de
              Itumbiara
            </p>
          </div>

          {/* Grid de pesquisas */}
          {hasPriceSearches ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {priceSearches.map((priceSearch) => (
                <PriceSearchCard
                  key={priceSearch.id}
                  id={priceSearch.id}
                  title={priceSearch.title}
                  description={
                    priceSearch.summary ?? priceSearch.description ?? undefined
                  }
                  slug={priceSearch.slug}
                  image={
                    priceSearch.coverImageUrl || DEFAULT_PRICE_SEARCH_IMAGE
                  }
                  imageAlt={priceSearch.title}
                  year={priceSearch.year}
                />
              ))}
            </div>
          ) : (
            <div className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center">
              Nenhuma pesquisa de preço disponível no momento. Volte em breve
              para conferir as pesquisas realizadas pelo Procon Itumbiara.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
