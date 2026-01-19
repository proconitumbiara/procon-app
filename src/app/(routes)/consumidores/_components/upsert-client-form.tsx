import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { insertClient, updateUser } from "@/actions/consumers/upsert-client";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { clientsTable } from "@/db/schema";
import {
  formatCPF,
  formatDate,
  formatName,
  formatPhoneNumber,
} from "@/lib/utils";

const formSchema = z.object({
  name: z.string().trim().min(3, {
    message: "Nome do consumidor deve ter pelo menos 3 caracteres.",
  }),
  register: z.string().trim().min(11, {
    message: "CPF do consumidor deve ter pelo menos 11 caracteres.",
  }),
  phoneNumber: z.string().trim().min(11, {
    message: "Telefone do consumidor deve ter pelo menos 11 caracteres.",
  }),
  dateOfBirth: z
    .string()
    .min(10, { message: "Data de nascimento é obrigatória." })
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, {
      message: "Data deve estar no formato DD/MM/YYYY.",
    })
    .refine(
      (date) => {
        const parts = date.split("/");
        if (parts.length !== 3) return false;
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        if (year < 1900 || year > new Date().getFullYear()) return false;
        const dateObj = new Date(year, month - 1, day);
        return (
          dateObj.getDate() === day &&
          dateObj.getMonth() === month - 1 &&
          dateObj.getFullYear() === year &&
          dateObj <= new Date()
        );
      },
      { message: "Data de nascimento inválida." },
    ),
});

interface upsertClientForm {
  client?: typeof clientsTable.$inferSelect;
  onSuccess?: () => void;
}

const UpsertClientForm = ({ client, onSuccess }: upsertClientForm) => {
  const formatDateForInput = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client?.name || "",
      register: client?.register || "",
      phoneNumber: client?.phoneNumber || "",
      dateOfBirth: client?.dateOfBirth
        ? formatDateForInput(client.dateOfBirth)
        : "",
    },
  });

  const { execute: executeInsertClient, status: insertStatus } = useAction(
    insertClient,
    {
      onSuccess: () => {
        toast.success("Consumidor adicionado com sucesso!");
        onSuccess?.();
        form.reset();
      },
      onError: (error) => {
        const errorMessage =
          error?.error?.serverError ||
          error?.error?.validationErrors?.dateOfBirth?._errors?.[0] ||
          "Erro ao cadastrar consumidor.";
        toast.error(errorMessage);
      },
    },
  );

  const { execute: executeUpdateUser, status: updateStatus } = useAction(
    updateUser,
    {
      onSuccess: () => {
        toast.success("Consumidor atualizado com sucesso!");
        onSuccess?.();
        form.reset();
      },
      onError: (error) => {
        const errorMessage =
          error?.error?.serverError ||
          error?.error?.validationErrors?.dateOfBirth?._errors?.[0] ||
          "Erro ao atualizar consumidor.";
        toast.error(errorMessage);
      },
    },
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Converter data de DD/MM/YYYY para YYYY-MM-DD
    const dateParts = values.dateOfBirth.split("/");
    let formattedDate = values.dateOfBirth;

    if (dateParts.length === 3) {
      const day = dateParts[0].padStart(2, "0");
      const month = dateParts[1].padStart(2, "0");
      const year = dateParts[2];
      formattedDate = `${year}-${month}-${day}`;

      // Validar se a data convertida é válida
      const testDate = new Date(formattedDate + "T00:00:00");
      if (isNaN(testDate.getTime())) {
        toast.error("Data de nascimento inválida.");
        return;
      }

      // Verificar se a data convertida corresponde à data original
      const convertedDay = String(testDate.getDate()).padStart(2, "0");
      const convertedMonth = String(testDate.getMonth() + 1).padStart(2, "0");
      const convertedYear = testDate.getFullYear();

      if (
        convertedDay !== day ||
        convertedMonth !== month ||
        convertedYear !== parseInt(year)
      ) {
        toast.error("Data de nascimento inválida.");
        return;
      }
    }

    const sanitizedValues = {
      ...values,
      register: values.register.replace(/\D/g, ""),
      phoneNumber: values.phoneNumber.replace(/\D/g, ""),
      dateOfBirth: formattedDate,
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

  const isPending = client
    ? updateStatus === "executing"
    : insertStatus === "executing";

  return (
    <DialogContent>
      <DialogTitle>{client ? client.name : "Adicionar Consumidor"}</DialogTitle>
      <DialogDescription>
        {client
          ? "Edite as informações desse consumidor."
          : "Adicione um novo consumidor à sua empresa!"}
      </DialogDescription>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do consumidor</FormLabel>
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
                <FormLabel>CPF do consumidor</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o CPF do consumidor"
                    {...field}
                    value={formatCPF(field.value)}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.replace(/\D/g, "").slice(0, 11),
                      )
                    }
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
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.replace(/\D/g, "").slice(0, 11),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => {
              // Se o valor não tem barras, formatar; se já tem, usar como está
              const rawValue = field.value || "";
              const hasSlashes = rawValue.includes("/");
              const formattedValue = hasSlashes
                ? rawValue
                : formatDate(rawValue);

              return (
                <FormItem>
                  <FormLabel>Data de nascimento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="DD/MM/YYYY"
                      value={formattedValue}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // Remover tudo que não é dígito
                        const cleaned = inputValue
                          .replace(/\D/g, "")
                          .slice(0, 8);
                        // Formatar automaticamente
                        const formatted = formatDate(cleaned);
                        // Armazenar o valor formatado
                        field.onChange(formatted);
                      }}
                      maxLength={10}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : client
                  ? "Editar consumidor"
                  : "Cadastrar consumidor"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertClientForm;
