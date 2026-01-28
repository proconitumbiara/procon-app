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

import { generateResetPasswordCode } from "@/actions/users/generate-reset-password-code";
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
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);

  const { execute, status } = useAction(generateResetPasswordCode, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast.error(result.data.error.message);
        return;
      }

      if (result?.data?.data) {
        setGeneratedCode(result.data.data.code);
        setExpiresAt(new Date(result.data.data.expiresAt));
        toast.success("Código gerado com sucesso!");
      }
    },
    onError: (error) => {
      const message =
        error.error?.serverError || "Erro ao gerar código de reset de senha";
      toast.error(message);
    },
  });

  const handleGenerateCode = () => {
    execute({ userId });
  };

  const handleCopyCode = async () => {
    if (!generatedCode) return;

    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast.success("Código copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar código");
    }
  };

  const handleClose = () => {
    setGeneratedCode(null);
    setExpiresAt(null);
    setCopied(false);
    onOpenChange(false);
  };

  const formatExpirationDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Redefinir Senha</DialogTitle>
        <DialogDescription>
          {!generatedCode ? (
            <div className="text-muted-foreground text-xs">
              Gere um código de redefinição de senha para -{" "}
              {userName.split(" ").slice(0, 2).join(" ")}.
            </div>
          ) : (
            <div className="text-muted-foreground text-xs">
              <span className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
                <Check className="h-4 w-4" />
                Código gerado com sucesso. Envie este código para{" "}
                {userName.split(" ").slice(0, 2).join(" ")}. <br />
              </span>

              <span className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
                <AlertTriangleIcon className="h-4 w-4" />
                Ele pode ser usado apenas uma vez e expira em 1 hora.
              </span>
            </div>
          )}
        </DialogDescription>
      </DialogHeader>

      <div className="">
        {!generatedCode ? (
          <div className="flex w-full items-center justify-center">
            <Button
              onClick={handleGenerateCode}
              disabled={status === "executing"}
              className="w-full"
            >
              {status === "executing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando código...
                </>
              ) : (
                <>
                  <RotateCcwKey className="h-4 w-4" />
                  Gerar Código de Reset
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium">
                Código de Redefinição de Senha
              </label>
              <div className="flex gap-2">
                <Input
                  value={generatedCode}
                  readOnly
                  className="flex-1 font-mono text-lg font-bold tracking-wider"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
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
            {expiresAt && (
              <p className="text-xs text-muted-foreground">
                Expira em: {formatExpirationDate(expiresAt)}
              </p>
            )}
          </div>
        )}
      </div>

      <DialogFooter>
        {generatedCode && (
          <>
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4" />
              Fechar
            </Button>
            <Button variant="default" onClick={handleGenerateCode}>
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
