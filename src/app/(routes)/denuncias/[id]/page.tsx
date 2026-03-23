import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import { formatDateInSaoPaulo } from "@/lib/timezone-utils";
import {
  ComplaintEvidenceFile,
  getIdPrefixFromComplaintId,
  listComplaintEvidenceFiles,
} from "@/lib/blob/complaint-evidence";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return formatDateInSaoPaulo(date);
}

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNumericShortId(id: string) {
  // Mostra apenas os dígitos do id (ignorando letras) para formar um "short id".
  const numeric = id.replace(/\D/g, "");
  return numeric.slice(0, 6) || id.slice(0, 6);
}

function getViewingBadgeConfig(status: "pending" | "viewed") {
  if (status === "viewed") {
    return { className: "bg-green-100 text-green-800 border-green-300", label: "Visualizada" };
  }

  return { className: "bg-yellow-100 text-yellow-800 border-yellow-300", label: "Pendente" };
}

function hasValue(value: unknown) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
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

  const idShort = getNumericShortId(complaint.id);
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
          {!complaint.isAnonymous && (
            <Card>
              <CardContent className="space-y-3">
                <h1 className="text-lg font-semibold">Dados do denunciante</h1>

                {hasValue(complaint.complainantName) && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Nome</p>
                    <p className="text-sm font-semibold">{complaint.complainantName}</p>
                  </div>
                )}

                {hasValue(complaint.complainantProfession) && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Profissão</p>
                    <p className="text-sm">{complaint.complainantProfession}</p>
                  </div>
                )}

                {hasValue(complaint.complainantCpf) && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">CPF</p>
                    <p className="text-sm">{complaint.complainantCpf}</p>
                  </div>
                )}

                {hasValue(complaint.complainantPhone) && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="text-sm">{complaint.complainantPhone}</p>
                  </div>
                )}

                {hasValue(complaint.complainantEmail) && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm">{complaint.complainantEmail}</p>
                  </div>
                )}

                {hasValue(complaint.complainantAddress) && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Endereço</p>
                    <p className="text-sm">{complaint.complainantAddress}</p>
                  </div>
                )}

                {hasValue(complaint.complainantZipCode) && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">CEP</p>
                    <p className="text-sm">{complaint.complainantZipCode}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className={!complaint.isAnonymous ? undefined : "md:col-span-2"}>
            <CardContent className="space-y-3">
              <h1 className="text-lg font-semibold">Dados da empresa denunciada</h1>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Nome</p>
                <p className="text-sm font-semibold">{complaint.respondentCompanyName}</p>
              </div>

              {hasValue(complaint.respondentCnpj) && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">CNPJ</p>
                  <p className="text-sm">{complaint.respondentCnpj}</p>
                </div>
              )}

              {hasValue(complaint.respondentAddress) && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Endereço</p>
                  <p className="text-sm">{complaint.respondentAddress}</p>
                </div>
              )}

              {hasValue(complaint.respondentAdditionalInfo) && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Informações adicionais</p>
                  <p className="text-sm">{complaint.respondentAdditionalInfo}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border w-full shadow-sm">
          <CardContent className="space-y-3">
            <h1 className="text-lg font-semibold">Dados da denúncia</h1>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Relato dos fatos</p>
              <p className="whitespace-pre-wrap text-sm">{complaint.factsDescription}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Pedido</p>
              <p className="whitespace-pre-wrap text-sm">{complaint.request}</p>
            </div>
          </CardContent>
          <Separator />
          <CardFooter className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Data do registro: {formatDate(complaint.filingDate)}
            </p>
            {complaint.viewingDate && complaint.viewingStatus === "viewed" && (
              <p className="text-xs text-muted-foreground">
                Visualizada em: {formatDateTime(complaint.viewingDate)}
              </p>
            )}
          </CardFooter>
        </Card>

        {complaint.evidenceType !== "none" && (
          <div className="mt-6">
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <h1 className="text-lg font-semibold">Evidências da denúncia</h1>
                  <p className="text-sm text-muted-foreground">
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
                      Nenhuma evidência encontrada para esta denúncia.
                    </p>
                  ) : (
                    <div className="space-y-3">
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
                            <Button asChild variant="secondary" size="default">
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
                    Nenhuma evidência encontrada para esta denúncia.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {mediaImages.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Imagens</p>
                        <div className="space-y-2">
                          {mediaImages.map((img) => (
                            <div
                              key={img.fileUrl}
                              className="flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {img.fileName}
                                </p>
                                {img.index !== undefined && (
                                  <p className="text-xs text-muted-foreground">
                                    Imagem {img.index}
                                  </p>
                                )}
                              </div>
                              <Button asChild variant="secondary" size="default">
                                <a
                                  href={img.fileUrl}
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
                    )}

                    {mediaVideos.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Vídeos</p>
                        <div className="space-y-2">
                          {mediaVideos.map((v) => (
                            <div
                              key={v.fileUrl}
                              className="flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {v.fileName}
                                </p>
                                {v.index !== undefined && (
                                  <p className="text-xs text-muted-foreground">
                                    Vídeo {v.index}
                                  </p>
                                )}
                              </div>
                              <Button asChild variant="secondary" size="default">
                                <a
                                  href={v.fileUrl}
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
                    )}

                    {mediaAudios.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Áudios</p>
                        <div className="space-y-2">
                          {mediaAudios.map((a) => (
                            <div
                              key={a.fileUrl}
                              className="flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {a.fileName}
                                </p>
                                {a.index !== undefined && (
                                  <p className="text-xs text-muted-foreground">
                                    Áudio {a.index}
                                  </p>
                                )}
                              </div>
                              <Button asChild variant="secondary" size="default">
                                <a
                                  href={a.fileUrl}
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

