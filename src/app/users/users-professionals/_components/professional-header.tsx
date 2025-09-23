"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { usersTable } from "@/db/schema";

import UpdateUserForm from "./update-user-form";

interface ProfessionalHeaderProps {
    professional: typeof usersTable.$inferSelect;
    onUpdateSuccess?: () => void;
}

const ProfessionalHeader = ({ professional, onUpdateSuccess }: ProfessionalHeaderProps) => {
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);

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
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-semibold text-primary">
                            {professionalInitials}
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold">{professional.name}</h2>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span>
                                    <strong>Telefone:</strong> {formatPhone(professional.phoneNumber || "")}
                                </span>
                                <span>
                                    <strong>CPF:</strong> {formatCPF(professional.cpf || "")}
                                </span>
                                <span>
                                    <strong>Acesso:</strong> {professional.role === "administrator" ? "Administrador" : "Profissional"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
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
                </div>
            </CardHeader>
        </Card>
    );
};

export default ProfessionalHeader;
