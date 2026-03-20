"use client";

import { Eye, FileText } from "lucide-react";
import Link from "next/link";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { updateComplaint } from "@/actions/complaint/update";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

function ComplaintCard({ complaint }: { complaint: ComplaintCardRow }) {
  const idShort = complaint.id.slice(0, 6);
  const badgeConfig = getViewingBadgeConfig(complaint.viewingStatus);

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
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              ID: <span className="font-mono">{idShort}</span>
            </p>
            <p className="font-semibold">
              {complaint.respondentCompanyName}
            </p>
          </div>
          <Badge variant="outline" className={badgeConfig.className}>
            {badgeConfig.label}
          </Badge>
        </div>

        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">
            Data do registro: {formatDate(complaint.filingDate)}
          </p>
          <p className="text-muted-foreground">Resumo dos fatos:</p>
          <p className="leading-snug">{truncate(complaint.factsDescription, 140)}</p>
          <p className="text-muted-foreground">Pedido:</p>
          <p className="leading-snug">{truncate(complaint.request, 140)}</p>
        </div>

        {complaint.viewingDate && complaint.viewingStatus === "viewed" && (
          <p className="text-xs text-muted-foreground">
            Visualizada em: {formatDateTime(complaint.viewingDate)}
          </p>
        )}

        <div className="flex items-center justify-end gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Marcar como visualizada"
                  disabled={isViewed || isExecuting}
                  onClick={() => execute({ complaintId: complaint.id })}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px]">
                Marcar como visualizada
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild aria-label="Detalhar denúncia">
                  <Link href={`/denuncias/${complaint.id}`}>
                    <FileText className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Detalhar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
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

