"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertNews } from "@/actions/upsert-news";
import { upsertNewsSchema } from "@/actions/upsert-news/schema";
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
import { NewsWithDocuments } from "@/types/content-management";

interface UpsertNewsFormProps {
  news?: NewsWithDocuments;
  onSuccess?: () => void;
}

const formSchema = upsertNewsSchema.omit({ id: true });

type FormValues = z.infer<typeof formSchema>;

const getDefaultValues = (news?: NewsWithDocuments) => ({
  title: news?.title ?? "",
  slug: news?.slug ?? "",
  excerpt: news?.excerpt ?? "",
  content: news?.content ?? "",
  coverImageUrl: news?.coverImageUrl ?? "",
  publishedAt: news?.publishedAt
    ? new Date(news.publishedAt).toISOString().slice(0, 10)
    : "",
  isPublished: news?.isPublished ?? false,
  emphasis: news?.emphasis ?? false,
  documents:
    news?.documents?.map((doc, index) => ({
      id: doc.id,
      label: doc.label,
      fileUrl: doc.fileUrl,
      displayOrder: doc.displayOrder ?? index,
    })) ?? [],
});

const UpsertNewsForm = ({ news, onSuccess }: UpsertNewsFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(news),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "documents",
  });

  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const { execute, status } = useAction(upsertNews, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        return;
      }
      toast.success(
        news
          ? "Notícia atualizada com sucesso!"
          : "Notícia criada com sucesso!",
      );
      onSuccess?.();
      form.reset(getDefaultValues(news));
    },
    onError: (error) => {
      const message =
        error.error?.serverError ??
        error.error?.validationErrors?.title?._errors?.[0] ??
        "Erro ao salvar notícia.";
      toast.error(message);
    },
  });

  const uploadCoverImage = async (file: File) => {
    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "news");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Falha ao enviar imagem.");
      }

      form.setValue("coverImageUrl", result.fileUrl, { shouldDirty: true });
      toast.success("Imagem da capa enviada com sucesso!");
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
      id: news?.id,
      publishedAt: values.publishedAt || undefined,
      documents: values.documents?.map((doc, index) => ({
        ...doc,
        displayOrder: doc.displayOrder ?? index,
      })),
    });
  };

  return (
    <DialogContent className="max-w-3xl">
      <DialogTitle>{news ? "Editar notícia" : "Nova notícia"}</DialogTitle>
      <DialogDescription>
        {news
          ? "Atualize os dados desta notícia."
          : "Cadastre uma nova notícia para o portal."}
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
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título da notícia" {...field} />
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
                    <Input placeholder="slug-da-noticia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resumo</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Resumo curto sobre a notícia"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conteúdo</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[180px]"
                    placeholder="Conteúdo completo"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
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
              name="publishedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de publicação</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="isPublished"
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
                  <FormLabel className="m-0">Publicar notícia</FormLabel>
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
                  <FormLabel className="m-0">Destacar notícia</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Documentos</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    label: "",
                    fileUrl: "",
                    displayOrder: fields.length,
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
            <div className="space-y-3">
              {fields.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Nenhum documento adicionado.
                </p>
              )}
              {fields.map((fieldItem, index) => (
                <div
                  key={fieldItem.id}
                  className="space-y-3 rounded-md border p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Documento {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name={`documents.${index}.label`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Documento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`documents.${index}.fileUrl`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`documents.${index}.displayOrder`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordem de exibição</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={status === "executing"}>
              {status === "executing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : news ? (
                "Atualizar notícia"
              ) : (
                "Criar notícia"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertNewsForm;
