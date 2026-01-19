"use client";

import { Check, Copy, KeyRound, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { generateRegistrationCode } from "@/actions/users/generate-registration-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const GenerateCodeButton = () => {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);

  const { execute, status } = useAction(generateRegistrationCode, {
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
        error.error?.serverError || "Erro ao gerar código de registro";
      toast.error(message);
    },
  });

  const handleGenerateCode = () => {
    execute({});
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Código de Cadastro
        </CardTitle>
        <CardDescription>
          Gere um código de segurança para permitir novos cadastros no sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedCode ? (
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
                <KeyRound className="mr-2 h-4 w-4" />
                Gerar Código de Cadastro
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
              <label className="text-sm font-medium text-gray-900">
                Código Gerado
              </label>
              <div className="mt-2 flex gap-2">
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
              {expiresAt && (
                <p className="mt-2 text-xs text-gray-600">
                  Expira em: {formatExpirationDate(expiresAt)}
                </p>
              )}
            </div>
            <Button
              onClick={handleGenerateCode}
              disabled={status === "executing"}
              variant="outline"
              className="w-full"
            >
              {status === "executing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando novo código...
                </>
              ) : (
                "Gerar Novo Código"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GenerateCodeButton;
