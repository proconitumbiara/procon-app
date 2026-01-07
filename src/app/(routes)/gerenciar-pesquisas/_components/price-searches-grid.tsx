"use client";

import { Pencil } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCentavosToBRL } from "@/lib/formatters";
import { PriceSearchWithRelations } from "@/types/content-management";

import UpsertPriceSearchForm from "./upsert-price-search-form";

type Supplier = Parameters<typeof UpsertPriceSearchForm>[0]["suppliers"];
type Category = Parameters<typeof UpsertPriceSearchForm>[0]["categories"];

interface PriceSearchesGridProps {
  priceSearches: PriceSearchWithRelations[];
  suppliers: Supplier;
  categories: Category;
}

const formatDate = (value?: Date | string | null) => {
  if (!value) return "Sem registro";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("pt-BR");
};

const PriceSearchesGrid = ({
  priceSearches,
  suppliers,
  categories,
}: PriceSearchesGridProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!priceSearches.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhuma pesquisa cadastrada até o momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {priceSearches.map((search) => (
        <Card key={search.id} className="border">
          <CardHeader className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl">{search.title}</CardTitle>
                <Badge variant="outline">{search.year}</Badge>
                {search.emphasis && (
                  <Badge variant="secondary">Em destaque</Badge>
                )}
              </div>
              <CardDescription>{search.slug}</CardDescription>
              {search.summary && (
                <p className="text-muted-foreground text-sm">{search.summary}</p>
              )}
            </div>
            <Dialog
              open={editingId === search.id}
              onOpenChange={(open) => setEditingId(open ? search.id : null)}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
              </DialogTrigger>
              <UpsertPriceSearchForm
                priceSearch={search}
                suppliers={suppliers}
                categories={categories}
                onSuccess={() => setEditingId(null)}
              />
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="grid gap-2 text-sm">
              <div className="text-muted-foreground flex justify-between">
                <span>Itens cadastrados</span>
                <span className="text-foreground font-medium">
                  {search.products.length}
                </span>
              </div>
              <div className="text-muted-foreground flex justify-between">
                <span>Criada em</span>
                <span>{formatDate(search.createdAT)}</span>
              </div>
              <div className="text-muted-foreground flex justify-between">
                <span>Atualizada em</span>
                <span>{formatDate(search.updatedAt)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Produtos e preços</h4>
              </div>
              {search.products.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum produto vinculado.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Peso</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Variação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {search.products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>{product.supplier?.name}</TableCell>
                          <TableCell>{product.category?.name}</TableCell>
                          <TableCell>{product.unit ?? "-"}</TableCell>
                          <TableCell>
                            {product.weight ? `${product.weight}g` : "-"}
                          </TableCell>
                          <TableCell>
                            {formatCentavosToBRL(product.price)}
                          </TableCell>
                          <TableCell>{product.priceVariation}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PriceSearchesGrid;


