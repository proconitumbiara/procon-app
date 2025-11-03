"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HelpCircle, Upload } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { endService } from "@/actions/end-service";
import { createConsultation } from "@/actions/upsert-consultation";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
    consultationNumber: z.string().optional(),
    authorizationArquive: z.string().optional(),
});

interface CreateConsultationFormProps {
    treatmentId: string;
    ticketId: string;
    onSuccess?: () => void;
    onOpenChange?: (open: boolean) => void;
}

const CreateConsultationForm = ({ treatmentId, ticketId, onSuccess, onOpenChange }: CreateConsultationFormProps) => {
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const form = useForm({
        shouldUnregister: true,
        resolver: zodResolver(formSchema),
        defaultValues: {
            consultationNumber: "",
            authorizationArquive: "",
        }
    });

    const { execute: executeCreateConsultation, status: createStatus } = useAction(createConsultation, {
        onSuccess: async () => {
            toast.success("Consulta registrada com sucesso!");
            // Finalizar o atendimento
            await executeEndService({
                treatmentId,
                resolutionType: "consultation"
            });
        },
        onError: (error) => {
            toast.error("Erro ao registrar consulta.");
            console.log(error);
        },
    });

    const { execute: executeEndService, status: endServiceStatus } = useAction(endService, {
        onSuccess: () => {
            toast.success("Atendimento finalizado com sucesso!");
            onSuccess?.();
            onOpenChange?.(false);
            form.reset();
        },
        onError: (error) => {
            toast.error("Erro ao finalizar atendimento.");
            console.log(error);
        },
    });

    const handleFileUpload = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "consultations");

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                return result.fileUrl;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            throw error;
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        let fileUrl = values.authorizationArquive;

        // Se está no modo offline e há arquivo selecionado
        if (isOfflineMode && selectedFile) {
            try {
                toast.info("Fazendo upload do arquivo...");
                fileUrl = await handleFileUpload(selectedFile);
                toast.success("Arquivo enviado com sucesso!");
            } catch {
                toast.error("Erro ao fazer upload do arquivo");
                return;
            }
        }

        const formData = {
            ...values,
            treatmentId,
            ticketId,
            authorizationArquive: fileUrl,
        };

        executeCreateConsultation(formData);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            toast.success(`Arquivo selecionado: ${file.name}`);
        }
    };

    const isPending = createStatus === "executing" || endServiceStatus === "executing";

    return (
        <DialogContent className="sm:max-w-[500px]">
            <DialogTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Registrar Consulta
            </DialogTitle>
            <DialogDescription>
                Registre uma nova consulta para este atendimento.
            </DialogDescription>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="consultationNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número da Consulta</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Digite o número da consulta"
                                        {...field}
                                        disabled={isOfflineMode}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="offlineMode"
                                checked={isOfflineMode}
                                onChange={(e) => setIsOfflineMode(e.target.checked)}
                                className="rounded"
                            />
                            <Label htmlFor="offlineMode" className="text-sm font-medium">
                                Proconsumidor está offline? Faça upload da autorização
                            </Label>
                        </div>

                        {isOfflineMode && (
                            <div className="space-y-2">
                                <Label>Upload da Autorização (PDF)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="flex-1"
                                    />
                                    <Upload className="w-4 h-4 text-muted-foreground" />
                                </div>
                                {selectedFile && (
                                    <p className="text-sm text-muted-foreground">
                                        Arquivo selecionado: {selectedFile.name}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange?.(false)}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending
                                ? "Salvando..."
                                : "Registrar Consulta"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};

export default CreateConsultationForm;
