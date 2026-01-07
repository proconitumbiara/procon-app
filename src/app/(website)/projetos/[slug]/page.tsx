import Image from "next/image";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getProjectBySlug } from "@/lib/data/content";

const DEFAULT_PROJECT_IMAGE = "/LogoVertical.png";

interface ProjetoDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjetoDetailPage({
  params,
}: ProjetoDetailPageProps) {
  const { slug } = await params;
  const projeto = await getProjectBySlug(slug);

  if (!projeto) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Projeto não encontrado</h1>
          <Link href="/projetos" className="text-primary hover:underline">
            Voltar para projetos
          </Link>
        </div>
      </div>
    );
  }

  const contentHtml =
    projeto.description ||
    "<p>Estamos preparando uma descrição detalhada para este projeto.</p>";

  return (
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
                <Link href="/projetos">Projetos</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">
                {projeto.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Conteúdo do projeto */}
        <article className="mx-auto max-w-4xl">
          {/* Header com logo, título e descrição */}
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:gap-6">
            {/* Logo do projeto */}
            <div className="shrink-0">
              <div className="bg-muted/50 relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg sm:h-40 sm:w-40">
                <Image
                  src={projeto.coverImageUrl || DEFAULT_PROJECT_IMAGE}
                  alt={projeto.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 128px, 160px"
                  priority
                />
              </div>
            </div>

            {/* Título e descrição */}
            <div className="min-w-0 flex-1">
              <h1 className="text-foreground mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl md:text-4xl">
                {projeto.title}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                {projeto.summary ||
                  "Descrição breve não disponível. Consulte o conteúdo completo abaixo."}
              </p>
            </div>
          </div>

          {/* Conteúdo estilo blog */}
          <div
            className="prose prose-lg text-foreground prose-headings:text-foreground prose-p:text-foreground prose-p:leading-7 prose-p:mb-4 sm:prose-p:mb-6 prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>
      </div>
    </main>
  );
}
