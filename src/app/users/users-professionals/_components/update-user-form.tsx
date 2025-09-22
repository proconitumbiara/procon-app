import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { updateUser } from "@/actions/update-user";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usersTable } from "@/db/schema";

const formSchema = z.object({
    name: z.string().trim().min(1, { message: "Nome do usuário é obrigatório." }),
    phoneNumber: z.string().trim().min(1, { message: "Telefone do usuário é obrigatório." }),
    cpf: z.string().trim().min(1, { message: "CPF do usuário é obrigatório." }),
    role: z.string().trim().min(1, { message: "Cargo do usuário é obrigatório." }),
});

interface UpdateUserFormProps {
    user?: typeof usersTable.$inferSelect;
    onSuccess?: () => void;
}

// Funções utilitárias para máscara
function maskPhone(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 10) {
        // Formato para telefones fixos: (XX) XXXX-XXXX
        return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, (m, g1, g2, g3) =>
            g3 ? `(${g1}) ${g2}-${g3}` : g2 ? `(${g1}) ${g2}` : g1 ? `(${g1}` : ''
        );
    } else {
        // Formato para celulares: (XX) XXXXX-XXXX
        return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, (m, g1, g2, g3) =>
            g3 ? `(${g1}) ${g2}-${g3}` : g2 ? `(${g1}) ${g2}` : g1 ? `(${g1}` : ''
        );
    }
}

function maskCPF(value: string) {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
        .trim();
}

const UpdateUserForm = ({ user, onSuccess }: UpdateUserFormProps) => {
    const { execute: executeUpdateUser, status } = useAction(updateUser);

    const form = useForm<z.infer<typeof formSchema>>({
        shouldUnregister: true,
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user?.name || "",
            phoneNumber: user?.phoneNumber || "",
            cpf: user?.cpf || "",
            role: user?.role || "",
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // Enviar apenas campos alterados
        const changedFields: Partial<z.infer<typeof formSchema>> = {};
        if (user) {
            if (values.name !== user.name) changedFields.name = values.name;
            if (values.phoneNumber !== user.phoneNumber) changedFields.phoneNumber = values.phoneNumber;
            if (values.cpf !== user.cpf) changedFields.cpf = values.cpf;
            if (values.role !== user.role) changedFields.role = values.role;
        } else {
            Object.assign(changedFields, values);
        }
        try {
            await executeUpdateUser({
                id: user?.id || "",
                ...changedFields,
            });
            toast.success(user ? "Usuário atualizado com sucesso!" : "Usuário adicionado com sucesso!");
            form.reset();
            onSuccess?.();
        } catch {
            toast.error(user ? `Erro ao atualizar usuário.` : `Erro ao adicionar usuário.`);
        }
    };

    return (
        <DialogContent>
            <DialogTitle>{user ? user.name : "Adicionar usuário"}</DialogTitle>
            <DialogDescription>{user ? "Edite as informações desse usuário." : "Adicione um novo usuário à sua empresa!"}</DialogDescription>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome do usuário</FormLabel>
                                <FormControl>
                                    <Input placeholder="Digite o nome do usuário" {...field} />
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
                                <FormLabel>Telefone do usuário</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Digite o telefone do usuário"
                                        {...field}
                                        value={maskPhone(field.value)}
                                        onChange={e => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 11))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cpf"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>CPF do usuário</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Digite o CPF do usuário"
                                        {...field}
                                        value={maskCPF(field.value)}
                                        onChange={e => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 11))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cargo do usuário</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecione o cargo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Cargos</SelectLabel>
                                            <SelectItem value="administrator">Administrador</SelectItem>
                                            <SelectItem value="professional">Usuário Padrão</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="submit" disabled={status === "executing"}>
                            {status === "executing"
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                                : user ? "Editar usuário" : "Cadastrar usuário"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}

export default UpdateUserForm;