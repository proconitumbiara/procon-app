"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateUserData } from "@/actions/update-user-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth.client";

const registerSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().trim().min(8, {
    message: "Senha é obrigatória e deve ter pelo menos 8 caracteres",
  }),
  phoneNumber: z.string().trim().min(1, { message: "Telefone é obrigatório" }),
  cpf: z.string().trim().min(1, { message: "CPF é obrigatório" }),
});

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
  });

  async function onSubmitRegister(values: z.infer<typeof registerSchema>) {
    try {
      await authClient.signUp.email(
        {
          email: values.email,
          password: values.password,
          name: values.name,
        },
        {
          onSuccess: async (ctx) => {
            try {
              await updateUserData({
                userId: ctx.data.user.id,
                cpf: values.cpf,
                phoneNumber: values.phoneNumber,
                role: "professional",
              });
              toast.success("Cadastro realizado com sucesso");
              router.push("/atendimento");
            } catch {
              toast.error("Erro ao salvar dados adicionais");
            }
          },
          onError: (ctx) => {
            if (
              ctx.error.code === "USER_ALREADY_EXISTS" ||
              ctx.error.code === "EMAIL_ALREADY_EXISTS"
            ) {
              toast.error("Email já cadastrado, por favor faça login");
              return;
            } else {
              toast.error("Erro ao cadastrar, por favor tente novamente");
            }
          },
        },
      );
    } catch {
      toast.error("Erro ao realizar cadastro");
    }
  }

  return (
    <Card className="w-full overflow-hidden border-1 border-gray-200 bg-white p-0 shadow-sm">
      <CardContent className="grid p-0 text-center">
        <CardHeader className="flex flex-col items-center justify-center">
          <CardTitle className="mt-4 text-xl font-bold text-gray-900">
            Cadastro
          </CardTitle>
          <CardDescription className="text-sm font-extralight text-gray-900">
            Preencha os campos abaixo para cadastrar-se
          </CardDescription>
        </CardHeader>
        <div className="mx-auto w-full max-w-md p-6 md:p-8">
          <Form {...formRegister}>
            <form
              onSubmit={formRegister.handleSubmit(onSubmitRegister)}
              className="space-y-4"
            >
              <div className="space-y-4">
                <FormField
                  control={formRegister.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900">Nome:</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite seu nome"
                          {...field}
                          className="text-primary border-1 border-gray-200 bg-white shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
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
                        <Input
                          placeholder="Digite seu CPF"
                          {...field}
                          className="text-primary border-1 border-gray-200 bg-white shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
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
                        <Input
                          placeholder="Digite seu telefone"
                          {...field}
                          className="text-primary border-1 border-gray-200 bg-white shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
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
                        <Input
                          placeholder="Digite seu email"
                          {...field}
                          className="text-primary border-1 border-gray-200 bg-white shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
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
                            className="text-primary border-1 border-gray-200 bg-white shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                          <button
                            type="button"
                            className="text-primary absolute top-0 right-2 h-full cursor-pointer border-none bg-transparent shadow-none hover:bg-transparent"
                            onClick={() => setShowPassword((v) => !v)}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <CardFooter className="p-0">
                <Button
                  variant="default"
                  type="submit"
                  className="w-full"
                  disabled={formRegister.formState.isSubmitting}
                >
                  {formRegister.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Cadastrando...
                    </>
                  ) : (
                    "Cadastrar"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
