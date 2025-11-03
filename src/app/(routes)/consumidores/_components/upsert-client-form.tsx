import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { insertClient, updateUser } from "@/actions/upsert-client";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { clientsTable } from "@/db/schema";
import { formatCPF, formatName,formatPhoneNumber } from "@/lib/utils";

const formSchema = z.object({
    name: z.string().trim().min(3, { message: "Nome do consumidor deve ter pelo menos 3 caracteres." }),
    register: z.string().trim().min(11, { message: "CPF do consumidor deve ter pelo menos 11 caracteres." }),
    phoneNumber: z.string().trim().min(11, { message: "Telefone do consumidor deve ter pelo menos 11 caracteres." }),
})

interface upsertClientForm {
    client?: typeof clientsTable.$inferSelect;
    onSuccess?: () => void;
}

const UpsertClientForm = ({ client, onSuccess }: upsertClientForm) => {
    const form = useForm<z.infer<typeof formSchema>>({
        shouldUnregister: true,
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: client?.name || "",
            register: client?.register || "",
            phoneNumber: client?.phoneNumber || "",
        }
    })

    const { execute: executeInsertClient, status: insertStatus } = useAction(insertClient, {
        onSuccess: () => {
            toast.success("Consumidor adicionado com sucesso!");
            onSuccess?.();
            form.reset();
        },
        onError: (error) => {
            toast.error("Consumidor já possui cadastro.");
            console.log(error);
        },
    });

    const { execute: executeUpdateUser, status: updateStatus } = useAction(updateUser, {
        onSuccess: () => {
            toast.success("Consumidor atualizado com sucesso!");
            onSuccess?.();
            form.reset();
        },
        onError: (error) => {
            toast.error("Erro ao atualizar Consumidor.");
            console.log(error);
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const sanitizedValues = {
            ...values,
            register: values.register.replace(/\D/g, ""),
            phoneNumber: values.phoneNumber.replace(/\D/g, ""),
        };
        if (client) {
            executeUpdateUser({
                ...sanitizedValues,
                id: client.id,
            });
        } else {
            executeInsertClient(sanitizedValues);
        }
    };

    const isPending = client ? updateStatus === "executing" : insertStatus === "executing";

    return (
        <DialogContent>
            <DialogTitle>{client ? client.name : "Adicionar Consumidor"}</DialogTitle>
            <DialogDescription>{client ? "Edite as informações desse consumidor." : "Adicione um novo consumidor à sua empresa!"}</DialogDescription>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Nome do consumidor
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Digite o nome do consumidor"
                                        {...field}
                                        onBlur={(e) => {
                                            const formattedValue = formatName(e.target.value);
                                            field.onChange(formattedValue);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="register"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    CPF do consumidor
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Digite o CPF do consumidor"
                                        {...field}
                                        value={formatCPF(field.value)}
                                        onChange={e => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 11))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Telefone do consumidor</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Digite o telefone do consumidor"
                                        {...field}
                                        value={formatPhoneNumber(field.value)}
                                        onChange={e => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 11))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending
                                ? "Salvando..."
                                : client ? "Editar consumidor"
                                    : "Cadastrar consumidor"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}

export default UpsertClientForm;