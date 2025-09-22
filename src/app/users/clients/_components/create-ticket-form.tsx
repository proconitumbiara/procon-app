"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createTicket } from "@/actions/upsert-ticket";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateTicketFormProps {
    clientId: string;
    sectors: { id: string; name: string }[];
    onSuccess?: () => void;
    defaultSectorId?: string;
}

const CreateTicketForm = ({ clientId, sectors, onSuccess, defaultSectorId }: CreateTicketFormProps) => {
    const sectorOnlySchema = z.object({
        sectorId: z.string().min(1, "ID do setor é obrigatório"),
    });

    const form = useForm<z.infer<typeof sectorOnlySchema>>({
        shouldUnregister: true,
        resolver: zodResolver(sectorOnlySchema),
        defaultValues: {
            sectorId: defaultSectorId || sectors[0]?.id || "",
        },
    });

    const { execute: executeCreateTicket, status } = useAction(createTicket, {
        onSuccess: () => {
            toast.success("Ticket criado com sucesso!");
            onSuccess?.();
            form.reset();
        },
        onError: (error) => {
            toast.error("Erro ao criar ticket.");
            console.log(error);
        },
    });

    const onSubmit = (values: { sectorId: string }) => {
        executeCreateTicket({ status: 'pending', sectorId: values.sectorId, clientId });
    };

    const isPending = status === "executing";

    return (
        <DialogContent>
            <DialogTitle>Iniciar atendimento</DialogTitle>
            <DialogDescription>Selecione o setor para iniciar o atendimento.</DialogDescription>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="sectorId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Setor</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o setor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sectors.map((sector) => (
                                                <SelectItem key={sector.id} value={sector.id}>
                                                    {sector.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <p className="text-sm text-muted-foreground">
                        Ao registrar o atendimento, informe o consumidor para aguardar a chamada do seu nome no painel. O atendimento começará assim que houver disponibilidade no setor.
                    </p>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Salvando..." : "Adicionar atendimento"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};

export default CreateTicketForm;