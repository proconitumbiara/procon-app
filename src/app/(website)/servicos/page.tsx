import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ServiceCard from "@/components/website/cards/ServiceCard";
import Footer from "@/components/website/global/Footer";
import Header from "@/components/website/global/Header";
import { getActiveServices } from "@/lib/data/content";

export default async function ServicosPage() {
  const services = await getActiveServices();
  const hasServices = services.length > 0;

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
                <BreadcrumbPage>Serviços</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Título da página */}
          <div className="mb-8">
            <h1 className="text-foreground mb-2 text-3xl font-bold sm:text-4xl">
              Todos os Serviços
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Conheça os serviços oferecidos pelo Procon Itumbiara para proteger
              e defender os direitos dos consumidores
            </p>
          </div>

          {/* Grid de serviços */}
          {hasServices ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.title}
                  description={
                    service.description ||
                    "Descrição detalhada deste serviço estará disponível em breve."
                  }
                  slug={service.slug}
                  status={service.isActive ? "active" : "inactive"}
                />
              ))}
            </div>
          ) : (
            <div className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center">
              Ainda não há serviços cadastrados. Assim que disponíveis, eles
              aparecerão nesta página.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
