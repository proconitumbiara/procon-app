"use client";

import {
  AlertTriangleIcon,
  Check,
  Copy,
  RefreshCcw,
  RotateCcwKey,
  X,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { generateResetPasswordLink } from "@/actions/generate-reset-password-link";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ResetPasswordDialogProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ResetPasswordDialog = ({
  userId,
  userName,
  onOpenChange,
}: ResetPasswordDialogProps) => {
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { execute, status } = useAction(generateResetPasswordLink, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast.error(result.data.error.message);
        return;
      }

      if (result?.data?.data?.resetUrl) {
        setResetUrl(result.data.data.resetUrl);
        toast.success("Link de reset gerado com sucesso!");
      }
    },
    onError: (error) => {
      const message =
        error.error?.serverError || "Erro ao gerar link de reset de senha";
      toast.error(message);
    },
  });

  const handleGenerateLink = () => {
    execute({ userId });
  };

  const handleCopyLink = async () => {
    if (!resetUrl) return;

    try {
      await navigator.clipboard.writeText(resetUrl);
      setCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  const handleClose = () => {
    setResetUrl(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Redefinir Senha</DialogTitle>
        <DialogDescription>
          {!resetUrl ? (
            <div className="text-muted-foreground text-xs">
              Gere um link de redefinição de senha para -{" "}
              {userName.split(" ").slice(0, 2).join(" ")}.
            </div>
          ) : (
            <div className="text-muted-foreground text-xs">
              <span className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
                <Check className="h-4 w-4" />
                Link gerado com sucesso. Envie este link para{" "}
                {userName.split(" ").slice(0, 2).join(" ")}. <br />
              </span>

              <span className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
                <AlertTriangleIcon className="h-4 w-4" />
                Ele pode ser usado apenas uma vez e expira em 15 minutos.
              </span>
            </div>
          )}
        </DialogDescription>
      </DialogHeader>

      <div className="">
        {!resetUrl ? (
          <div className="flex w-full items-center justify-center">
            <Button
              onClick={handleGenerateLink}
              disabled={status === "executing"}
              className="w-full"
            >
              {status === "executing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando link...
                </>
              ) : (
                <>
                  <RotateCcwKey className="h-4 w-4" />
                  Gerar Link de Reset
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium">
                Link de Redefinição de Senha
              </label>
              <div className="flex gap-2">
                <Input value={resetUrl} readOnly className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        {resetUrl && (
          <>
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4" />
              Fechar
            </Button>
            <Button variant="default" onClick={handleGenerateLink}>
              <RefreshCcw className="h-4 w-4" />
              Gerar novamente
            </Button>
          </>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default ResetPasswordDialog;
