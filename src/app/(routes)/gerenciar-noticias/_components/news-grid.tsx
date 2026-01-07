"use client";

import { ExternalLink, Pencil } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { NewsWithDocuments } from "@/types/content-management";

import UpsertNewsForm from "./upsert-news-form";

const DEFAULT_NEWS_IMAGE = "/LogoHorizontal.png";

interface NewsGridProps {
  news: NewsWithDocuments[];
}

const formatDate = (value?: Date | string | null) => {
  if (!value) return "Sem data";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("pt-BR");
};

const sortDocuments = (documents: NewsWithDocuments["documents"]) => {
  return [...documents].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );
};

const truncateTitle = (title: string, maxWords: number = 6) => {
  const words = title.trim().split(/\s+/);
  if (words.length <= maxWords) {
    return title;
  }
  return words.slice(0, maxWords).join(" ") + "...";
};

const NewsGrid = ({ news }: NewsGridProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  if (!news.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhuma notícia cadastrada até o momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {news.map((item) => (
        <Card key={item.id} className="h-full border">
          <CardHeader className="space-y-4 border-b pb-4">
            <div className="relative h-48 w-full overflow-hidden rounded-md border">
              {item.coverImageUrl && !imageErrors.has(item.id) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.coverImageUrl}
                  alt=""
                  className="hidden"
                  onError={() => {
                    setImageErrors((prev) => new Set(prev).add(item.id));
                  }}
                  aria-hidden="true"
                />
              )}
              <Image
                src={
                  imageErrors.has(item.id) || !item.coverImageUrl
                    ? DEFAULT_NEWS_IMAGE
                    : item.coverImageUrl
                }
                alt={`Capa da notícia ${item.title}`}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex w-full items-center gap-2">
                  <CardTitle className="text-lg">
                    {truncateTitle(item.title)}
                  </CardTitle>
                  <Badge variant={item.isPublished ? "default" : "secondary"}>
                    {item.isPublished ? "Publicado" : "Rascunho"}
                  </Badge>
                  {item.emphasis && (
                    <Badge variant="secondary">Em destaque</Badge>
                  )}
                </div>
                <Dialog
                  open={editingId === item.id}
                  onOpenChange={(open) => setEditingId(open ? item.id : null)}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <UpsertNewsForm
                    news={item}
                    onSuccess={() => setEditingId(null)}
                  />
                </Dialog>
              </div>
              <CardDescription>{item.slug}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">
                {item.excerpt || "Sem resumo disponível."}
              </p>
              <p className="text-sm">
                {item.content || "Sem conteúdo cadastrado."}
              </p>
            </div>
            <Separator />
            <div className="grid gap-1 text-sm">
              <div className="text-muted-foreground flex justify-between">
                <span>Publicado em</span>
                <span>{formatDate(item.publishedAt)}</span>
              </div>
              <div className="text-muted-foreground flex justify-between">
                <span>Atualizado em</span>
                <span>{formatDate(item.updatedAt)}</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Documentos</h4>
              {item.documents.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum documento cadastrado.
                </p>
              ) : (
                <ul className="space-y-2">
                  {sortDocuments(item.documents).map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{doc.label}</span>
                      <Button variant="link" size="sm" asChild>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1"
                        >
                          Abrir
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NewsGrid;
