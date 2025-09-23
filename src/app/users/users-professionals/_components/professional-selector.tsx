"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usersTable } from "@/db/schema";

interface ProfessionalSelectorProps {
    professionals: (typeof usersTable.$inferSelect)[];
    selectedProfessionalId?: string;
    onProfessionalSelect: (professionalId: string) => void;
}

const ProfessionalSelector = ({
    professionals,
    selectedProfessionalId,
    onProfessionalSelect
}: ProfessionalSelectorProps) => {
    return (
        <div className="w-full max-w-md">
            <label className="text-sm font-medium mb-2 block">
                Selecione um profissional
            </label>
            <Select
                value={selectedProfessionalId || ""}
                onValueChange={onProfessionalSelect}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Escolha um profissional..." />
                </SelectTrigger>
                <SelectContent>
                    {professionals.map((professional) => (
                        <SelectItem key={professional.id} value={professional.id}>
                            {professional.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default ProfessionalSelector;
