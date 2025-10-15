"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Upload } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { endService } from "@/actions/end-service";
import { createDenunciation } from "@/actions/upsert-denunciation";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
    denunciationNumber: z.string().optional(),
    authorizationArquive: z.string().optional(),
});

interface CreateDenunciationFormProps {
    treatmentId: string;
    ticketId: string;
    onSuccess?: () => void;
    onOpenChange?: (open: boolean) => void;
}

const CreateDenunciationForm = ({ treatmentId, ticketId, onSuccess, onOpenChange }: CreateDenunciationFormProps) => {
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const form = useForm({
        shouldUnregister: true,
        resolver: zodResolver(formSchema),
        defaultValues: {
            denunciationNumber: "",
            authorizationArquive: "",
        }
    });

    const { execute: executeCreateDenunciation, status: createStatus } = useAction(createDenunciation, {
        onSuccess: async () => {
            toast.success("Denúncia registrada com sucesso!");
            // Finalizar o atendimento
            await executeEndService({
                treatmentId,
                resolutionType: "denunciation"
            });
        },
        onError: (error) => {
            toast.error("Erro ao registrar denúncia.");
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
            formData.append("type", "denunciations");

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

        executeCreateDenunciation(formData);
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
                <AlertTriangle className="w-5 h-5" />
                Registrar Denúncia
            </DialogTitle>
            <DialogDescription>
                Registre uma nova denúncia para este atendimento.
            </DialogDescription>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="denunciationNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número da Denúncia</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Digite o número da denúncia"
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

                        {!isOfflineMode && (
                            <FormField
                                control={form.control}
                                name="authorizationArquive"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número da Autorização</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Digite o número da autorização" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                : "Registrar Denúncia"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};

export default CreateDenunciationForm;
