"use client"

import { AlertTriangle, BadgeCheck, FileText, HelpCircle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { endService } from "@/actions/treatments/end-service";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import CreateComplaintForm from "./create-complaint-form";
import CreateConsultationForm from "./create-consultation-form";
import CreateDenunciationForm from "./create-denunciation-form";

interface FinishServiceDialogProps {
    treatmentId: string;
    ticketId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const FinishServiceDialog = ({ treatmentId, ticketId, open, onOpenChange }: FinishServiceDialogProps) => {
    const [, setError] = useState<string | null>(null);
    const [showComplaintForm, setShowComplaintForm] = useState(false);
    const [showDenunciationForm, setShowDenunciationForm] = useState(false);
    const [showConsultationForm, setShowConsultationForm] = useState(false);

    const { status } = useAction(endService, {
        onSuccess: (result) => {
            if (result.data?.error) {
                toast.error(result.data.error.message);
                setError(result.data.error.message);
                return;
            }
            toast.success("Atendimento finalizado com sucesso!");
            setError(null);
            onOpenChange(false);
        },
        onError: (error) => {
            const msg = error.error?.serverError || error.error?.validationErrors?.treatmentId?._errors?.[0] || "Erro ao finalizar atendimento";
            toast.error(msg);
            setError(msg);
        },
    });

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BadgeCheck className="w-5 h-5" />
                            Finalizar Atendimento
                        </DialogTitle>
                        <DialogDescription>
                            Selecione o tipo de finalização para este atendimento.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Tipo de Finalização:</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <Button
                                    variant="outline"
                                    className="justify-start h-auto p-4"
                                    onClick={() => setShowComplaintForm(true)}
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        <div className="text-left">
                                            <div className="font-medium">Reclamação</div>
                                            <div className="text-sm text-muted-foreground">
                                                Registrar uma reclamação do consumidor
                                            </div>
                                        </div>
                                    </div>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="justify-start h-auto p-4"
                                    onClick={() => setShowDenunciationForm(true)}
                                >
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                                        <div className="text-left">
                                            <div className="font-medium">Denúncia</div>
                                            <div className="text-sm text-muted-foreground">
                                                Registrar uma denúncia contra fornecedor
                                            </div>
                                        </div>
                                    </div>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="justify-start h-auto p-4"
                                    onClick={() => setShowConsultationForm(true)}
                                >
                                    <div className="flex items-center gap-3">
                                        <HelpCircle className="w-5 h-5 text-green-600" />
                                        <div className="text-left">
                                            <div className="font-medium">Consulta</div>
                                            <div className="text-sm text-muted-foreground">
                                                Registrar uma consulta de informações
                                            </div>
                                        </div>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={status === "executing"}
                        >
                            Cancelar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Formulários de Upsert */}
            <Dialog open={showComplaintForm} onOpenChange={setShowComplaintForm}>
                <CreateComplaintForm
                    treatmentId={treatmentId}
                    ticketId={ticketId}
                    onSuccess={() => {
                        setShowComplaintForm(false);
                        onOpenChange(false);
                    }}
                    onOpenChange={setShowComplaintForm}
                />
            </Dialog>

            <Dialog open={showDenunciationForm} onOpenChange={setShowDenunciationForm}>
                <CreateDenunciationForm
                    treatmentId={treatmentId}
                    ticketId={ticketId}
                    onSuccess={() => {
                        setShowDenunciationForm(false);
                        onOpenChange(false);
                    }}
                    onOpenChange={setShowDenunciationForm}
                />
            </Dialog>

            <Dialog open={showConsultationForm} onOpenChange={setShowConsultationForm}>
                <CreateConsultationForm
                    treatmentId={treatmentId}
                    ticketId={ticketId}
                    onSuccess={() => {
                        setShowConsultationForm(false);
                        onOpenChange(false);
                    }}
                    onOpenChange={setShowConsultationForm}
                />
            </Dialog>
        </>
    );
};

export default FinishServiceDialog;
