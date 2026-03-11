"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { PageActions } from "@/components/ui/page-container";
import { authClient } from "@/lib/auth.client";

import GenerateCodeButton from "./_components/generate-code-button";
import ProfessionalListCard from "./_components/professional-list-card";

interface Professional {
  id: string;
  name: string;
  email: string;
  role: string;
  cpf: string | null;
  phoneNumber: string | null;
}

const ProfissionaisPage = () => {
  const session = authClient.useSession();
  const router = useRouter();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = session.data?.user?.role === "administrator";
  const isProfessional = session.data?.user?.role === "professional";
  const userId = session.data?.user?.id;

  // Redirecionar profissional para a própria página
  useEffect(() => {
    if (session.isPending) return;
    if (isProfessional && userId) {
      router.replace(`/profissionais/${userId}`);
      return;
    }
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const loadProfessionals = async () => {
      try {
        const response = await fetch("/api/professionals");
        if (response.ok) {
          const data = await response.json();
          setProfessionals(data);
        }
      } catch (error) {
        console.error("Erro ao carregar profissionais:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfessionals();
  }, [session.isPending, isProfessional, isAdmin, userId, router]);

  if (session.isPending || (isProfessional && userId)) {
    return (
      <PageContainer>
        <PageContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Redirecionando...</p>
        </PageContent>
      </PageContainer>
    );
  }

  if (!isAdmin) {
    return (
      <PageContainer>
        <PageContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Acesso negado.</p>
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Profissionais</PageTitle>
          <PageDescription>
            Visualize e gerencie os dados dos profissionais.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <GenerateCodeButton />
        </PageActions>
      </PageHeader>
      <PageContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Carregando profissionais...</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {professionals
              .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
              .map((professional) => (
                <ProfessionalListCard
                  key={professional.id}
                  id={professional.id}
                  name={professional.name}
                  role={professional.role}
                />
              ))}
          </div>
        )}
        {!loading && professionals.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            Nenhum profissional cadastrado.
          </p>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default ProfissionaisPage;
