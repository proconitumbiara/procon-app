"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateUserData } from "@/actions/users/update-user-data";
import { validateRegistrationCode } from "@/actions/users/validate-registration-code";
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
import { useAction } from "next-safe-action/hooks";

const registerSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().trim().min(8, {
    message: "Senha é obrigatória e deve ter pelo menos 8 caracteres",
  }),
  phoneNumber: z.string().trim().min(1, { message: "Telefone é obrigatório" }),
  cpf: z.string().trim().min(1, { message: "CPF é obrigatório" }),
  registrationCode: z
    .string()
    .trim()
    .min(6, { message: "Código deve ter 6 caracteres" })
    .max(6, { message: "Código deve ter 6 caracteres" })
    .regex(/^[A-Z0-9]{6}$/i, {
      message: "Código deve conter apenas letras e números",
    }),
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
      registrationCode: "",
    },
  });

  const { execute: validateCode } = useAction(validateRegistrationCode, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast.error(result.data.error.message);
        return;
      }
      // Se chegou aqui, o código é válido, prosseguir com cadastro
      const formValues = formRegister.getValues();
      proceedWithRegistration(formValues);
    },
    onError: (error) => {
      const message =
        error.error?.serverError || "Erro ao validar código de registro";
      toast.error(message);
    },
  });

  async function proceedWithRegistration(
    values: z.infer<typeof registerSchema>,
  ) {
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

  async function onSubmitRegister(values: z.infer<typeof registerSchema>) {
    // Validar código de registro antes de prosseguir
    validateCode({ code: values.registrationCode });
  }

  return (
    <Card className="h-full w-full overflow-hidden border-none bg-white/20 shadow-none backdrop-blur-sm">
      <CardContent className="h-full w-full space-y-4 text-center">
        <CardHeader className="flex flex-col items-center justify-center">
          <CardTitle className="text-2xl font-bold text-white">
            Cadastro
          </CardTitle>
          <CardDescription className="text-base font-light text-white">
            Preencha os campos abaixo para cadastrar-se
          </CardDescription>
        </CardHeader>
        <div className="w-full space-y-4">
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
                      <FormLabel className="text-base font-semibold text-white">
                        Nome
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite seu nome"
                          {...field}
                          className="dark:focus:text-primary focus:text-primary border border-white bg-transparent text-white shadow-none placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent dark:text-white"
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
                      <FormLabel className="text-base font-semibold text-white">
                        CPF
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite seu CPF"
                          {...field}
                          className="dark:focus:text-primary focus:text-primary border border-white bg-transparent text-white shadow-none placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent dark:text-white"
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
                      <FormLabel className="text-base font-semibold text-white">
                        Telefone
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite seu telefone"
                          {...field}
                          className="dark:focus:text-primary focus:text-primary border border-white bg-transparent text-white shadow-none placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent dark:text-white"
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
                      <FormLabel className="text-base font-semibold text-white">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite seu email"
                          {...field}
                          className="dark:focus:text-primary focus:text-primary border border-white bg-transparent text-white shadow-none placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent dark:text-white"
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
                      <FormLabel className="text-base font-semibold text-white">
                        Senha
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Crie sua senha"
                            {...field}
                            className="dark:focus:text-primary focus:text-primary border border-white bg-transparent text-white shadow-none placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent dark:text-white"
                          />
                          <button
                            type="button"
                            className="absolute top-0 right-2 h-full cursor-pointer border-none bg-transparent text-white shadow-none hover:bg-transparent"
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
                <FormField
                  control={formRegister.control}
                  name="registrationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-white">
                        Código de Cadastro
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o código de cadastro"
                          {...field}
                          className="dark:focus:text-primary focus:text-primary border border-white bg-transparent font-mono text-white uppercase shadow-none placeholder:font-sans placeholder:text-white placeholder:normal-case focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent dark:text-white"
                          maxLength={6}
                          onChange={(e) => {
                            const value = e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, "");
                            field.onChange(value);
                          }}
                        />
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
                  className="mt-4 w-full"
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
