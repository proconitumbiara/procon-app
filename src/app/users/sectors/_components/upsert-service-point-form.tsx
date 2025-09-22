import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertServicePoint } from "@/actions/upsert-service-point";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { servicePointsTable } from "@/db/schema";

const formSchema = z.object({
    name: z.string().trim().min(1, { message: "Nome do ponto de atendimento é obrigatório." }),
});

interface UpsertServicePointFormProps {
    servicePoint?: Partial<typeof servicePointsTable.$inferSelect>;
    onSuccess?: () => void;
}

const UpsertServicePointForm = ({ servicePoint, onSuccess }: UpsertServicePointFormProps) => {
    const [, setError] = useState<string | null>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: servicePoint?.name ?? "",
        }
    });

    const { execute, status } = useAction(upsertServicePoint, {
        onSuccess: (result) => {
            if (result.data?.error) {
                toast.error(result.data.error.message);
                setError(result.data.error.message);
                return;
            }
            toast.success(servicePoint ? "Ponto de atendimento atualizado com sucesso!" : "Ponto de atendimento adicionado com sucesso!");
            setError(null);
            onSuccess?.();
            form.reset();
        },
        onError: (error) => {
            const msg = error.error?.serverError || error.error?.validationErrors?.name?._errors?.[0] || "Erro ao salvar ponto de atendimento";
            toast.error(msg);
            setError(msg);
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        execute({
            ...values,
            id: servicePoint?.id,
            sectorId: servicePoint?.sectorId || "",
        });
    };

    return (
        <DialogContent>
            <DialogTitle>{servicePoint?.id ? servicePoint.name : "Adicionar ponto de atendimento"}</DialogTitle>
            <DialogDescription>
                {servicePoint?.id
                    ? "Edite as informações desse ponto de atendimento."
                    : "Adicione um novo ponto de atendimento à sua empresa!"}
            </DialogDescription>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="Digite o nome do ponto de atendimento"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="submit" disabled={status === "executing"}>
                            {status === "executing" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : servicePoint?.id ? (
                                "Editar ponto de atendimento"
                            ) : (
                                "Cadastrar ponto de atendimento"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};

export default UpsertServicePointForm;