"use client";

import { Pencil, RotateCcwKey } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { usersTable } from "@/db/schema";

import ResetPasswordDialog from "./reset-password-dialog";
import UpdateUserForm from "./update-user-form";

interface ProfessionalHeaderProps {
  professional: typeof usersTable.$inferSelect;
  onUpdateSuccess?: () => void;
}

const ProfessionalHeader = ({
  professional,
  onUpdateSuccess,
}: ProfessionalHeaderProps) => {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);

  const professionalInitials = professional.name
    .split(" ")
    .map((name: string) => name[0])
    .slice(0, 2)
    .join("");

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 11) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return phone;
  };

  const formatCPF = (cpf: string) => {
    const digits = cpf.replace(/\D/g, "");
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full text-2xl font-semibold">
              {professionalInitials}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{professional.name}</h2>
              <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                <span>
                  <strong>Telefone:</strong>{" "}
                  {formatPhone(professional.phoneNumber || "")}
                </span>
                <span>
                  <strong>CPF:</strong> {formatCPF(professional.cpf || "")}
                </span>
                <span>
                  <strong>Acesso:</strong>{" "}
                  {professional.role === "administrator"
                    ? "Administrador"
                    : "Profissional"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
              </DialogTrigger>
              <UpdateUserForm
                user={professional}
                onSuccess={() => {
                  setIsEditFormOpen(false);
                  onUpdateSuccess?.();
                }}
              />
            </Dialog>
            <Dialog
              open={isResetPasswordDialogOpen}
              onOpenChange={setIsResetPasswordDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <RotateCcwKey className="h-4 w-4" />
                  Redefinir Senha
                </Button>
              </DialogTrigger>
              <ResetPasswordDialog
                userId={professional.id}
                userName={professional.name || ""}
                open={isResetPasswordDialogOpen}
                onOpenChange={setIsResetPasswordDialogOpen}
              />
            </Dialog>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default ProfessionalHeader;
