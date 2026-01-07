import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ProjectCard from "@/components/website/cards/ProjectCard";
import Footer from "@/components/website/global/Footer";
import Header from "@/components/website/global/Header";
import { getAllProjects } from "@/lib/data/content";

const DEFAULT_PROJECT_IMAGE = "/LogoVertical.png";

export default async function ProjetosPage() {
  const projects = await getAllProjects();
  const hasProjects = projects.length > 0;

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
                <BreadcrumbPage>Projetos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Título da página */}
          <div className="mb-8">
            <h1 className="text-foreground mb-2 text-3xl font-bold sm:text-4xl">
              Todos os Projetos
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Conheça os projetos e iniciativas desenvolvidas pelo Procon
              Itumbiara para proteger e defender os direitos dos consumidores
            </p>
          </div>

          {/* Grid de projetos */}
          {hasProjects ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.title}
                  description={
                    project.summary ||
                    project.description ||
                    "Descrição não disponível no momento."
                  }
                  slug={project.slug}
                  image={project.coverImageUrl || DEFAULT_PROJECT_IMAGE}
                  imageAlt={project.title}
                />
              ))}
            </div>
          ) : (
            <div className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center">
              Nenhum projeto publicado até o momento. Em breve traremos novas
              iniciativas do Procon Itumbiara.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
