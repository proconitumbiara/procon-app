"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertProject } from "@/actions/upsert-project";
import { upsertProjectSchema } from "@/actions/upsert-project/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { ProjectWithDocuments } from "@/types/content-management";

interface UpsertProjectFormProps {
  project?: ProjectWithDocuments;
  onSuccess?: () => void;
}

const formSchema = upsertProjectSchema.omit({ id: true });

type FormValues = z.infer<typeof formSchema>;

const getDefaultValues = (project?: ProjectWithDocuments) => ({
  title: project?.title ?? "",
  slug: project?.slug ?? "",
  summary: project?.summary ?? "",
  description: project?.description ?? "",
  coverImageUrl: project?.coverImageUrl ?? "",
  emphasis: project?.emphasis ?? false,
});

const UpsertProjectForm = ({ project, onSuccess }: UpsertProjectFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(project),
  });

  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const { execute, status } = useAction(upsertProject, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        return;
      }
      toast.success(
        project
          ? "Projeto atualizado com sucesso!"
          : "Projeto criado com sucesso!",
      );
      onSuccess?.();
      form.reset(getDefaultValues(project));
    },
    onError: (error) => {
      const message =
        error.error?.serverError ??
        error.error?.validationErrors?.title?._errors?.[0] ??
        "Erro ao salvar projeto.";
      toast.error(message);
    },
  });

  const uploadCoverImage = async (file: File) => {
    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "projects");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Falha ao enviar imagem.");
      }

      form.setValue("coverImageUrl", result.fileUrl, { shouldDirty: true });
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      console.error("Cover upload error", error);
      toast.error("Não foi possível enviar a imagem da capa.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const onSubmit = (values: FormValues) => {
    execute({
      ...values,
      id: project?.id,
    });
  };

  return (
    <DialogContent className="max-w-3xl">
      <DialogTitle>{project ? "Editar projeto" : "Novo projeto"}</DialogTitle>
      <DialogDescription>
        {project
          ? "Atualize as informações do projeto."
          : "Cadastre um novo projeto institucional."}
      </DialogDescription>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do projeto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="slug-do-projeto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resumo</FormLabel>
                <FormControl>
                  <Textarea placeholder="Resumo do projeto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição detalhada</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[180px]"
                    placeholder="Descrição completa"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="coverImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagem de capa</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    <input type="hidden" {...field} />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          await uploadCoverImage(file);
                        }
                      }}
                    />
                    {(field.value || isUploadingCover) && (
                      <div className="space-y-2">
                        {isUploadingCover ? (
                          <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Enviando imagem...
                          </div>
                        ) : (
                          <>
                            <div className="relative h-40 w-full overflow-hidden rounded-md border">
                              {field.value && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={field.value}
                                  alt="Prévia da capa"
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                form.setValue("coverImageUrl", "", {
                                  shouldDirty: true,
                                })
                              }
                            >
                              Remover capa
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emphasis"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 rounded-md border p-3">
                <FormControl>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                </FormControl>
                <FormLabel className="m-0">Destacar projeto</FormLabel>
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
              ) : project ? (
                "Atualizar projeto"
              ) : (
                "Criar projeto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertProjectForm;
