"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { newsTable } from "@/db/schema";

interface UpsertNewsFormProps {
  news?: typeof newsTable.$inferSelect;
  onSuccess?: () => void;
}

const formSchema = upsertNewsSchema.omit({ id: true });

type FormValues = z.infer<typeof formSchema>;

const getDefaultValues = (news?: typeof newsTable.$inferSelect) => ({
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
});

const UpsertNewsForm = ({ news, onSuccess }: UpsertNewsFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(news),
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
