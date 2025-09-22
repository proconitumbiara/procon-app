"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateUserData } from "@/actions/update-user-data";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth.client";

const registerSchema = z.object({
    name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
    email: z.string().trim().email({ message: "Email inválido" }),
    password: z.string().trim().min(8, { message: "Senha é obrigatória e deve ter pelo menos 8 caracteres" }),
    phoneNumber: z.string().trim().min(1, { message: "Telefone é obrigatório" }),
    cpf: z.string().trim().min(1, { message: "CPF é obrigatório" }),
})

export function SignUpForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const formRegister = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            phoneNumber: "",
            cpf: "",
        },
    })

    async function onSubmitRegister(values: z.infer<typeof registerSchema>) {
        try {
            await authClient.signUp.email({
                email: values.email,
                password: values.password,
                name: values.name,
            }, {
                onSuccess: async (ctx) => {
                    try {
                        await updateUserData({
                            userId: ctx.data.user.id,
                            cpf: values.cpf,
                            phoneNumber: values.phoneNumber,
                            role: 'administrator'
                        });
                        toast.success("Cadastro realizado com sucesso")
                        router.push("/users/dashboard")
                    } catch {
                        toast.error("Erro ao salvar dados adicionais")
                    }
                },
                onError: (ctx) => {
                    if (ctx.error.code === "USER_ALREADY_EXISTS" || ctx.error.code === "EMAIL_ALREADY_EXISTS") {
                        toast.error("Email já cadastrado, por favor faça login")
                        return;
                    } else {
                        toast.error("Erro ao cadastrar, por favor tente novamente")
                    }
                }
            })
        } catch {
            toast.error("Erro ao realizar cadastro")
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-center">
                <Image
                    src="/Logo.svg"
                    alt="Procon Logo"
                    width={400}
                    height={0}
                    priority
                />
            </div>
            <Card className="overflow-hidden p-0 bg-white w-full border-1 border-gray-200 shadow-sm">
                <CardContent className="p-6 md:p-8 text-center">
                    <Form {...formRegister}>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center">
                                <h1 className="text-xl font-bold text-gray-900">Cadastro de Administrador</h1>
                            </div>
                            <form onSubmit={formRegister.handleSubmit(onSubmitRegister)} className="space-y-8">
                                <FormField
                                    control={formRegister.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-900">Nome:</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Digite seu nome" {...field} className="bg-white shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-600 border-1 border-gray-200" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={formRegister.control}
                                    name="cpf"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-900">CPF:</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Digite seu CPF"  {...field} className="bg-white shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-600 border-1 border-gray-200" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={formRegister.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-900">Telefone:</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Digite seu telefone" {...field} className="bg-white shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-600 border-1 border-gray-200" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={formRegister.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-900">Email:</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Digite seu email" {...field} className="bg-white shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-600 border-1 border-gray-200" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={formRegister.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-900">Senha:</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Crie sua senha"
                                                        type={showPassword ? "text" : "password"}
                                                        {...field}
                                                        className="bg-white shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-600 border-1 border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                        onClick={() => setShowPassword((v) => !v)}
                                                        tabIndex={-1}
                                                    >
                                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full"
                                    disabled={formRegister.formState.isSubmitting}>
                                    {formRegister.formState.isSubmitting ? "Cadastrando..." : "Cadastrar"}
                                </Button>
                            </form>
                        </div>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
