"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";

import { resetPassword } from "@/actions/users/reset-password";
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

const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(6, "Código deve ter 6 caracteres")
      .max(6, "Código deve ter 6 caracteres")
      .regex(/^[A-Z0-9]{6}$/i, "Código deve conter apenas letras e números"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z
      .string()
      .min(8, "A confirmação deve ter pelo menos 8 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const ResetPasswordForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { execute, status } = useAction(resetPassword, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast.error(result.data.error.message);
        return;
      }

      if (result?.data?.success) {
        toast.success("Senha redefinida com sucesso!");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    },
    onError: (error) => {
      const message =
        error.error?.serverError || "Erro inesperado ao redefinir senha";
      toast.error(message);
    },
  });

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    execute({
      code: values.code,
      password: values.password,
      confirmPassword: values.confirmPassword,
    });
  };

  const isLoading = status === "executing";

  return (
    <div
      className="relative flex h-screen w-full flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/CapaAuthentication.png')",
      }}
    >
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#003173]/20 backdrop-blur-sm">
        <Image
          src="/Logo.svg"
          alt="Procon Logo"
          width={300}
          height={0}
          priority
          className="absolute top-4 left-4 z-10"
        />
        <div className="h-auto w-full max-w-md rounded-md">
          <Card className="h-full w-full overflow-hidden border-none bg-white/20 shadow-none backdrop-blur-sm">
            <CardContent className="h-full w-full space-y-4 text-center">
              <CardHeader className="flex flex-col items-center justify-center">
                <CardTitle className="text-2xl font-bold text-white">
                  Redefinir Senha
                </CardTitle>
                <CardDescription className="text-base font-light text-white">
                  Digite o código recebido e sua nova senha
                </CardDescription>
              </CardHeader>
              <div className="w-full space-y-4">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-white">
                              Código de Reset
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Digite o código de 6 dígitos"
                                {...field}
                                disabled={isLoading}
                                className="focus:text-primary border border-white bg-transparent text-white shadow-none placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent dark:text-white"
                                maxLength={6}
                                onChange={(e) => {
                                  const value = e.target.value.toUpperCase();
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-white">
                              Nova Senha
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Digite sua nova senha"
                                  {...field}
                                  disabled={isLoading}
                                  className="focus:text-primary border border-white bg-transparent text-white shadow-none placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent dark:text-white"
                                />
                                <button
                                  type="button"
                                  className="absolute top-0 right-2 h-full cursor-pointer border-none bg-transparent text-white shadow-none hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                  disabled={isLoading}
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
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-white">
                              Confirmar Nova Senha
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  placeholder="Confirme sua nova senha"
                                  {...field}
                                  disabled={isLoading}
                                  className="focus:text-primary border border-white bg-transparent text-white shadow-none placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent dark:text-white"
                                />
                                <button
                                  type="button"
                                  className="absolute top-0 right-2 h-full cursor-pointer border-none bg-transparent text-white shadow-none hover:bg-transparent"
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                  disabled={isLoading}
                                  tabIndex={-1}
                                >
                                  {showConfirmPassword ? (
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
                    <CardFooter className="flex flex-col gap-2 p-0">
                      <Button
                        variant="default"
                        type="submit"
                        className="mt-4 w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Redefinindo...
                          </>
                        ) : (
                          "Redefinir Senha"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => router.push("/")}
                        className="w-full cursor-pointer text-white hover:text-white/80"
                        disabled={isLoading}
                      >
                        Voltar para Login
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div
          className="relative flex h-screen w-full flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/CapaAuthentication.png')",
          }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#003173]/20 backdrop-blur-sm">
            <Card className="h-full w-full max-w-md overflow-hidden border-none bg-white/20 shadow-none backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">
                  Carregando...
                </CardTitle>
                <CardDescription className="text-base font-light text-white">
                  Aguarde enquanto carregamos a página de redefinição de senha.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPasswordPage;
