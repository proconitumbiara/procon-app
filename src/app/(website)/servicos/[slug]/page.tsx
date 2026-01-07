import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Footer from "@/components/website/global/Footer";
import Header from "@/components/website/global/Header";
import { getServiceBySlug } from "@/lib/data/content";

interface ServicoDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ServicoDetailPage({
  params,
}: ServicoDetailPageProps) {
  const { slug } = await params;
  const servico = await getServiceBySlug(slug);

  if (!servico) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Serviço não encontrado</h1>
            <Link href="/servicos" className="text-primary hover:underline">
              Voltar para serviços
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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
                <BreadcrumbLink asChild>
                  <Link href="/servicos">Serviços</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  {servico.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Conteúdo do serviço */}
          <article className="mx-auto max-w-4xl">
            {/* Header com ícone, título e descrição */}
            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:gap-6">
              {/* Título e descrição */}
              <div className="min-w-0 flex-1">
                <h1 className="text-foreground mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl md:text-4xl">
                  {servico.title}
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                  {servico.description ||
                    "Estamos preparando mais detalhes sobre este serviço."}
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {servico.requirements && (
                <section>
                  <h2 className="mb-3 text-xl font-semibold">Requisitos</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {servico.requirements}
                  </p>
                </section>
              )}

              {servico.howToApply && (
                <section>
                  <h2 className="mb-3 text-xl font-semibold">Como solicitar</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {servico.howToApply}
                  </p>
                </section>
              )}

              {(servico.contactEmail || servico.contactPhone) && (
                <section>
                  <h2 className="mb-3 text-xl font-semibold">
                    Informações de contato
                  </h2>
                  <div className="text-muted-foreground space-y-2">
                    {servico.contactEmail && (
                      <p>
                        E-mail:{" "}
                        <a
                          href={`mailto:${servico.contactEmail}`}
                          className="text-primary hover:underline"
                        >
                          {servico.contactEmail}
                        </a>
                      </p>
                    )}
                    {servico.contactPhone && (
                      <p>
                        Telefone:{" "}
                        <a
                          href={`tel:${servico.contactPhone}`}
                          className="text-primary hover:underline"
                        >
                          {servico.contactPhone}
                        </a>
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
