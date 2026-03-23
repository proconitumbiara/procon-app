"use client";

import { Check, Eye } from "lucide-react";


import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { updateComplaint } from "@/actions/complaint/update";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

type ComplaintCardRow = {
  id: string;
  isAnonymous: boolean;
  respondentCompanyName: string;
  factsDescription: string;
  request: string;
  filingDate: string | Date;
  viewingStatus: "pending" | "viewed";
  viewingDate: Date | string | null;
  createdAt: Date | string;
};



function truncate(text: string, maxChars: number) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).trimEnd() + "...";
}

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

function getNumericShortId(id: string) {
  // Mostra apenas os dígitos do id (ignorando letras) para formar um "short id".
  const numeric = id.replace(/\D/g, "");
  return numeric.slice(0, 6) || id.slice(0, 6);
}

function getViewingBadgeConfig(status: "pending" | "viewed") {
  if (status === "viewed")
    return {
      className: "bg-green-100 text-green-800 border-green-300",
      label: "Visualizada",
    };
  return {
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    label: "Pendente",
  };
}

function getAnonymousBadgeConfig(isAnonymous: boolean) {
  return {
    className: isAnonymous ? "bg-gray-100 text-gray-800 border-gray-300" : "bg-blue-100 text-blue-800 border-blue-300",
    label: isAnonymous ? "Anônimo" : "Identificado",
  };
}

function ComplaintCard({ complaint }: { complaint: ComplaintCardRow }) {
  const router = useRouter();
  const idShort = getNumericShortId(complaint.id);
  const badgeConfig = getViewingBadgeConfig(complaint.viewingStatus);
  const anonymousBadgeConfig = getAnonymousBadgeConfig(complaint.isAnonymous);

  const { execute, status } = useAction(updateComplaint, {
    onSuccess: () => {
      toast.success("Denúncia marcada como visualizada.");
    },
    onError: (error) => {
      const msg =
        error.error?.serverError ||
        error.error?.validationErrors?.complaintId?._errors?.[0] ||
        "Erro ao marcar como visualizada";
      toast.error(msg);
    },
  });

  const isExecuting = status === "executing";
  const isViewed = complaint.viewingStatus === "viewed";

  return (
    <Card className="border shadow-sm">
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex flex-col items-start">
            <p className="font-semibold">
              {complaint.respondentCompanyName}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              ID: <span className="font-mono">{idShort}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={badgeConfig.className}>
              {badgeConfig.label}
            </Badge>
            <Badge variant="outline" className={anonymousBadgeConfig.className}>
              {anonymousBadgeConfig.label}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 mt-4">
          <Button
            variant="outline"
            className="w-full text-xs"
            size="icon"
            aria-label="Visualizar denúncia"
            onClick={() => router.push(`/denuncias/${complaint.id}`)}
          >
            <Eye className="h-4 w-4" />
            Detalhar denúncia
          </Button>
          <Button
            variant="outline"
            className="w-full text-xs"
            size="icon"
            aria-label="Marcar como visualizada"
            disabled={isViewed || isExecuting}
            onClick={() => execute({ complaintId: complaint.id })}
          >
            <Check className="h-4 w-4 text-green-500" />
            {isViewed || isExecuting ? "Visualizada" : "Marcar como visualizada"}
          </Button>
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

  );
}

export default function ComplaintsCards({
  complaints,
}: {
  complaints: ComplaintCardRow[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {complaints.map((complaint) => (
        <ComplaintCard key={complaint.id} complaint={complaint} />
      ))}
    </div>
  );
}

