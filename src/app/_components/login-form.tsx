"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button"
import { CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email ou senha inválidos" }),
  password: z.string().trim().min(8, { message: "Email ou senha inválidos" }),
})


const LoginForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const formLogin = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmitLogin(values: z.infer<typeof loginSchema>) {

    await authClient.signIn.email({
      email: values.email,
      password: values.password,
    }, {
      onSuccess: () => {
        toast.success("Login realizado com sucesso")
        router.push("/users")
      },
      onError: () => {
        toast.error("Email ou senha inválidos")
      }
    })
  }



  return (
    <Card className="overflow-hidden p-0 bg-white w-full border-1 border-gray-200 shadow-sm">
      <CardContent className="grid p-0 text-center">
        <CardHeader className="flex flex-col items-center justify-center">
          <CardTitle className="text-gray-900 text-xl font-bold mt-4">
            Seja bem-vindo(a) de volta!
          </CardTitle>
          <CardDescription className="text-gray-900 text-sm font-extralight">
            Faça login para continuar
          </CardDescription>
        </CardHeader>
        <div className="mx-auto w-full max-w-md p-6 md:p-8">
          <Form {...formLogin}>
            <form onSubmit={formLogin.handleSubmit(onSubmitLogin)} className="space-y-4">
              <div className="space-y-4">
                <FormField
                  control={formLogin.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu email" {...field} className="bg-white shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-600 border-1 border-gray-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formLogin.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900">Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua senha"
                            {...field}
                            className="bg-white shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-600 border-1 border-gray-200"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
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
              </div>
              <CardFooter className="p-0">
                <Button variant="default" type="submit" className="w-full" disabled={formLogin.formState.isSubmitting}>
                  {formLogin.formState.isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoginForm;