import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { upsertSector } from "@/actions/upsert-sector";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { sectorsTable } from "@/db/schema";

const formSchema = z.object({
    name: z.string().trim().min(1, { message: "Nome do setor é obrigatório." }),
});

interface UpsertSectorFormProps {
    sector?: typeof sectorsTable.$inferSelect;
    onSuccess?: () => void;
}

const UpsertSectorForm = ({ sector, onSuccess }: UpsertSectorFormProps) => {
    const [, setError] = useState<string | null>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        shouldUnregister: true,
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: sector?.name || "",
        }
    })

    const { execute, status } = useAction(upsertSector, {
        onSuccess: (result) => {
            if (result.data?.error) {
                toast.error(result.data.error.message);
                setError(result.data.error.message);
                return;
            }
            toast.success(sector ? "Setor atualizado com sucesso!" : "Setor adicionado com sucesso!");
            setError(null);
            onSuccess?.();
            form.reset();
        },
        onError: (error) => {
            const msg = error.error?.serverError || error.error?.validationErrors?.name?._errors?.[0] || "Erro ao salvar setor";
            toast.error(msg);
            setError(msg);
        },
    });


    const onSubmit = (values: z.infer<typeof formSchema>) => {
        execute({
            ...values,
            id: sector?.id,
        })
    };

    return (
        <DialogContent>
            <DialogTitle>{sector ? sector.name : "Adicionar setor"}</DialogTitle>
            <DialogDescription>{sector ? "Edite as informações desse setor." : "Adicione um novo setor à sua empresa!"}</DialogDescription>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Digite o nome do setor" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="submit" disabled={status === "executing"}>
                            {status === "executing"
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                                : sector ? "Editar setor"
                                    : "Cadastrar setor"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}

export default UpsertSectorForm;