import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { complaintsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { buildUserPermissions } from "@/lib/authorization";
import {
  ComplaintEvidenceFile,
  getIdPrefixFromComplaintId,
  listComplaintEvidenceFiles,
} from "@/lib/blob/complaint-evidence";

export const dynamic = "force-dynamic";

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
}

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR");
}

function getViewingBadgeConfig(status: "pending" | "viewed") {
  if (status === "viewed") {
    return { className: "bg-green-100 text-green-800 border-green-300", label: "Visualizada" };
  }

  return { className: "bg-yellow-100 text-yellow-800 border-yellow-300", label: "Pendente" };
}

interface DenunciaDetailPageProps {
  params: Promise<{ id: string }>;
}

const DenunciaDetailPage = async ({ params }: DenunciaDetailPageProps) => {
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

  if (!perms.can("complaints.view")) {
    return <AccessDenied />;
  }

  const { id } = await params;

  const [complaint] = await db
    .select()
    .from(complaintsTable)
    .where(eq(complaintsTable.id, id))
    .limit(1);

  if (!complaint) {
    notFound();
  }

  const idPrefix = getIdPrefixFromComplaintId(complaint.id);
  let evidenceDocuments: ComplaintEvidenceFile[] = [];
  let evidenceMedia: ComplaintEvidenceFile[] = [];
  let evidenceListError: string | null = null;

  if (complaint.evidenceType !== "none") {
    if (!idPrefix) {
      evidenceListError =
        "Não foi possível calcular o `idPrefix` para buscar evidências no Blob.";
    } else {
      try {
        const evidence = await listComplaintEvidenceFiles({ idPrefix });
        if (complaint.evidenceType === "documentary") {
          evidenceDocuments = evidence.documents;
        } else if (complaint.evidenceType === "photo_video") {
          evidenceMedia = evidence.media;
        }
      } catch {
        evidenceListError = "Erro ao carregar arquivos do Blob.";
      }
    }
  }

  const sortByIndex = (a: ComplaintEvidenceFile, b: ComplaintEvidenceFile) =>
    (a.index ?? Number.MAX_SAFE_INTEGER) -
    (b.index ?? Number.MAX_SAFE_INTEGER);

  const mediaImages = evidenceMedia
    .filter((f) => f.kind === "image")
    .sort(sortByIndex);
  const mediaVideos = evidenceMedia
    .filter((f) => f.kind === "video")
    .sort(sortByIndex);
  const mediaAudios = evidenceMedia
    .filter((f) => f.kind === "audio")
    .sort(sortByIndex);

  const idShort = complaint.id.slice(0, 6);
  // `viewing_status` é `text` no banco, então o tipo chega como `string`.
  // Convertendo para a união esperada para o helper de UI.
  const viewingStatus: "pending" | "viewed" =
    complaint.viewingStatus === "viewed" ? "viewed" : "pending";
  const badgeConfig = getViewingBadgeConfig(viewingStatus);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label="Voltar para denúncias"
            >
              <Link href="/denuncias">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <PageTitle>
              Denúncia <span className="font-mono text-base">({idShort})</span>
            </PageTitle>
            <PageDescription>
              {complaint.isAnonymous ? "Solicitante anônimo" : "Solicitante identificado"}
              {" · "}
              {badgeConfig.label}
            </PageDescription>
          </div>
        </PageHeaderContent>
        <PageActions>
          <Badge variant="outline" className={badgeConfig.className}>
            {badgeConfig.label}
          </Badge>
        </PageActions>
      </PageHeader>

      <PageContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 p-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">ID completo</p>
                <p className="font-mono text-sm break-all">{complaint.id}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Data do registro</p>
                <p className="text-sm">{formatDate(complaint.filingDate)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Criada em</p>
                <p className="text-sm">{formatDateTime(complaint.createdAt)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Visualizada em</p>
                <p className="text-sm">
                  {complaint.viewingDate ? formatDateTime(complaint.viewingDate) : "-"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Empresa denunciada</p>
                <p className="text-sm font-semibold">
                  {complaint.respondentCompanyName}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Resumo dos fatos</p>
                <p className="whitespace-pre-wrap text-sm">{complaint.factsDescription}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Pedido</p>
                <p className="whitespace-pre-wrap text-sm">{complaint.request}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Anonimato</p>
                <p className="text-sm">
                  {complaint.isAnonymous
                    ? "Solicitante anônimo"
                    : `Solicitante: ${complaint.complainantName ?? "-"}`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {complaint.evidenceType !== "none" && (
          <div className="mt-6">
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Arquivos da denúncia
                  </p>
                  <p className="text-sm font-semibold">
                    {complaint.evidenceType === "documentary"
                      ? "Documentos (PDF)"
                      : "Mídias (imagens, vídeo e áudio)"}
                  </p>
                </div>

                {evidenceListError ? (
                  <p className="text-sm text-red-600">{evidenceListError}</p>
                ) : idPrefix === null ? (
                  <p className="text-sm text-muted-foreground">
                    Não foi possível calcular o `idPrefix` para buscar evidências
                    no Blob.
                  </p>
                ) : complaint.evidenceType === "documentary" ? (
                  evidenceDocuments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma prova encontrada no Blob para este `idPrefix`.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {evidenceDocuments.length === 1 && (
                        <iframe
                          src={evidenceDocuments[0].fileUrl}
                          className="h-[600px] w-full rounded-md border"
                        />
                      )}

                      <div className="space-y-2">
                        {evidenceDocuments.map((doc) => (
                          <div
                            key={doc.fileUrl}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {doc.fileName}
                              </p>
                              {doc.index !== undefined && (
                                <p className="text-xs text-muted-foreground">
                                  Documento {doc.index}
                                </p>
                              )}
                            </div>
                            <Button asChild variant="secondary" size="sm">
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Abrir
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ) : evidenceMedia.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma prova encontrada no Blob para este `idPrefix`.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {mediaImages.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Imagens</p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                          {mediaImages.map((img) => (
                            <a
                              key={img.fileUrl}
                              href={img.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={img.fileUrl}
                                loading="lazy"
                                alt={img.fileName}
                                className="w-full rounded-md border bg-muted"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {mediaVideos.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Vídeos</p>
                        <div className="space-y-4">
                          {mediaVideos.map((v) => (
                            <div key={v.fileUrl} className="space-y-2">
                              <p className="text-sm font-medium">{v.fileName}</p>
                              <video
                                controls
                                src={v.fileUrl}
                                className="w-full rounded-md border"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {mediaAudios.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Áudios</p>
                        <div className="space-y-4">
                          {mediaAudios.map((a) => (
                            <div key={a.fileUrl} className="space-y-2">
                              <p className="text-sm font-medium">{a.fileName}</p>
                              <audio
                                controls
                                src={a.fileUrl}
                                className="w-full"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default DenunciaDetailPage;

