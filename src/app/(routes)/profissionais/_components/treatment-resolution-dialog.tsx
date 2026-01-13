"use client";

import {
  AlertTriangle,
  Building,
  Calendar,
  Eye,
  File,
  FileText,
  Hash,
  HelpCircle,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface TreatmentResolution {
  complaint?: {
    id: string;
    caseNumber: string | null;
    consumerName: string | null;
    supplierName: string | null;
    numberOfPages: number | null;
    status: string;
    authorizationArquive: string | null;
    createdAT: Date;
    updatedAt: Date | null;
  };
  denunciation?: {
    id: string;
    denunciationNumber: string | null;
    authorizationArquive: string | null;
    createdAT: Date;
    updatedAt: Date | null;
  };
  consultation?: {
    id: string;
    consultationNumber: string | null;
    authorizationArquive: string | null;
    createdAT: Date;
    updatedAt: Date | null;
  };
}

interface TreatmentResolutionDialogProps {
  treatmentId: string;
  children: React.ReactNode;
}

const TreatmentResolutionDialog = ({
  treatmentId,
  children,
}: TreatmentResolutionDialogProps) => {
  const [resolution, setResolution] = useState<TreatmentResolution | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchResolution = async () => {
      if (!open) return;

      setLoading(true);
      try {
        const response = await fetch(
          `/api/treatment-resolution?treatmentId=${treatmentId}`,
        );
        if (!response.ok) {
          throw new Error("Erro ao buscar resolução");
        }
        const data = await response.json();
        setResolution(data);
      } catch (error) {
        console.error("Erro ao buscar resolução:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchResolution();
    }
  }, [open, treatmentId]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Aberto";
      case "closed":
        return "Fechado";
      case "in_progress":
        return "Em andamento";
      default:
        return status;
    }
  };

  const handleViewFile = (filePath: string) => {
    // Se for uma URL completa do blob, usar diretamente
    if (filePath.startsWith("https://")) {
      window.open(filePath, "_blank");
      return;
    }

    // Para caminhos locais antigos, usar a API serve-file
    // Remove o prefixo /uploads/ se existir, pois a API serve-file já adiciona uploads/
    const cleanPath = filePath.startsWith("/uploads/")
      ? filePath.substring(8)
      : filePath;
    const fileUrl = `/api/serve-file/${cleanPath}`;
    window.open(fileUrl, "_blank");
  };

  const hasResolution =
    resolution &&
    (resolution.complaint ||
      resolution.denunciation ||
      resolution.consultation);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resolução do Atendimento
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !hasResolution ? (
          <div className="py-8 text-center">
            <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">
              Nenhuma resolução encontrada para este atendimento.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Reclamação */}
            {resolution.complaint && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Reclamação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Hash className="text-muted-foreground h-4 w-4" />
                        <span className="font-medium">Número do Caso:</span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {resolution.complaint.caseNumber || "Não informado"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                      </div>
                      <Badge
                        className={getStatusColor(resolution.complaint.status)}
                      >
                        {getStatusText(resolution.complaint.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="text-muted-foreground h-4 w-4" />
                        <span className="font-medium">Consumidor:</span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {resolution.complaint.consumerName || "Não informado"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="text-muted-foreground h-4 w-4" />
                        <span className="font-medium">Fornecedor:</span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {resolution.complaint.supplierName || "Não informado"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <File className="text-muted-foreground h-4 w-4" />
                        <span className="font-medium">Número de Páginas:</span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {resolution.complaint.numberOfPages || "Não informado"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        <span className="font-medium">Criado em:</span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {formatDate(resolution.complaint.createdAT)}
                      </p>
                    </div>
                  </div>

                  {resolution.complaint.authorizationArquive && (
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            Arquivo de Autorização:
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              resolution.complaint?.authorizationArquive &&
                              handleViewFile(
                                resolution.complaint.authorizationArquive,
                              )
                            }
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-sm break-all">
                          {resolution.complaint.authorizationArquive}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Denúncia */}
            {resolution.denunciation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Denúncia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Hash className="text-muted-foreground h-4 w-4" />
                        <span className="font-medium">Número da Denúncia:</span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {resolution.denunciation.denunciationNumber ||
                          "Não informado"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        <span className="font-medium">Criado em:</span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {formatDate(resolution.denunciation.createdAT)}
                      </p>
                    </div>
                  </div>

                  {resolution.denunciation.authorizationArquive && (
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            Arquivo de Autorização:
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              resolution.denunciation?.authorizationArquive &&
                              handleViewFile(
                                resolution.denunciation.authorizationArquive,
                              )
                            }
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-sm break-all">
                          {resolution.denunciation.authorizationArquive}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Consulta */}
            {resolution.consultation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-500" />
                    Consulta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Hash className="text-muted-foreground h-4 w-4" />
                        <span className="font-medium">Número da Consulta:</span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {resolution.consultation.consultationNumber ||
                          "Não informado"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        <span className="font-medium">Criado em:</span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {formatDate(resolution.consultation.createdAT)}
                      </p>
                    </div>
                  </div>

                  {resolution.consultation.authorizationArquive && (
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            Arquivo de Autorização:
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              resolution.consultation?.authorizationArquive &&
                              handleViewFile(
                                resolution.consultation.authorizationArquive,
                              )
                            }
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-sm break-all">
                          {resolution.consultation.authorizationArquive}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TreatmentResolutionDialog;
