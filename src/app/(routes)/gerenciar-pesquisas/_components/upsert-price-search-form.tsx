"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertCategory } from "@/actions/upsert-category";
import { upsertPriceSearch } from "@/actions/upsert-price-search";
import { upsertProduct } from "@/actions/upsert-product";
import { upsertSupplier } from "@/actions/upsert-supplier";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categoriesTable, productsTable, suppliersTable } from "@/db/schema";
import { centavosToReaisNumber, reaisToCentavos } from "@/lib/formatters";
import { PriceSearchWithRelations } from "@/types/content-management";

type Supplier = typeof suppliersTable.$inferSelect;
type Category = typeof categoriesTable.$inferSelect;
type Product = typeof productsTable.$inferSelect & {
  category: Category;
};

interface UpsertPriceSearchFormProps {
  priceSearch?: PriceSearchWithRelations;
  suppliers: Supplier[];
  categories: Category[];
  products: Product[];
  onSuccess?: () => void;
}

const itemFormSchema = z.object({
  productId: z.string().uuid({ message: "Selecione um produto." }),
  supplierId: z.string().uuid({ message: "Selecione um fornecedor." }),
  price: z.string().trim().min(1, { message: "Informe o preço." }),
});

const formSchema = z.object({
  title: z.string().trim().min(1, { message: "Informe o título." }),
  slug: z.string().trim().min(1, { message: "Informe o slug." }),
  summary: z.string().trim().optional(),
  description: z.string().trim().optional(),
  coverImageUrl: z.string().trim().optional(),
  year: z.coerce
    .number({ invalid_type_error: "Ano inválido." })
    .int()
    .min(2000, { message: "Ano mínimo 2000." })
    .max(2100, { message: "Ano máximo 2100." }),
  emphasis: z.boolean().optional(),
  collectionDate: z.string().trim().optional(),
  observation: z.string().trim().optional(),
  items: z
    .array(itemFormSchema)
    .min(1, { message: "Adicione ao menos um item." }),
});

type FormValues = z.infer<typeof formSchema>;

const createEmptyItem = (productId?: string, supplierId?: string) => ({
  productId: productId ?? "",
  supplierId: supplierId ?? "",
  price: "",
});

const getDefaultValues = (
  priceSearch?: PriceSearchWithRelations,
  productId?: string,
  supplierId?: string,
) => ({
  title: priceSearch?.title ?? "",
  slug: priceSearch?.slug ?? "",
  summary: priceSearch?.summary ?? "",
  description: priceSearch?.description ?? "",
  coverImageUrl: priceSearch?.coverImageUrl ?? "",
  year: priceSearch?.year ?? new Date().getFullYear(),
  emphasis: priceSearch?.emphasis ?? false,
  collectionDate: priceSearch?.collectionDate
    ? new Date(priceSearch.collectionDate).toISOString().split("T")[0]
    : "",
  observation: priceSearch?.observation ?? "",
  items: priceSearch?.items.map((item) => ({
    productId: item.productId,
    supplierId: item.supplierId,
    price: centavosToReaisNumber(item.price).toFixed(2).replace(".", ","),
  })) ?? [createEmptyItem(productId, supplierId)],
});

const sortByName = <T extends { name: string }>(items: T[]) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name));

const UpsertPriceSearchForm = ({
  priceSearch,
  suppliers: initialSuppliers,
  categories: initialCategories,
  products: initialProducts,
  onSuccess,
}: UpsertPriceSearchFormProps) => {
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [productForm, setProductForm] = useState({
    name: "",
    categoryId: "",
  });
  const [suppliers, setSuppliers] = useState(() =>
    sortByName(initialSuppliers),
  );
  const [categories, setCategories] = useState(() =>
    sortByName(initialCategories),
  );
  const [products, setProducts] = useState(() => sortByName(initialProducts));
  const [productSearchTerms, setProductSearchTerms] = useState<
    Record<number, string>
  >({});
  const [supplierSearchTerms, setSupplierSearchTerms] = useState<
    Record<number, string>
  >({});
  const productSearchInputRefs = useRef<
    Record<number, HTMLInputElement | null>
  >({});
  const supplierSearchInputRefs = useRef<
    Record<number, HTMLInputElement | null>
  >({});

  const initialProductId = products[0]?.id;
  const initialSupplierId = suppliers[0]?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(
      priceSearch,
      initialProductId,
      initialSupplierId,
    ),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { execute, status } = useAction(upsertPriceSearch, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        return;
      }

      toast.success(
        priceSearch
          ? "Pesquisa atualizada com sucesso!"
          : "Pesquisa criada com sucesso!",
      );
      onSuccess?.();
      form.reset(
        getDefaultValues(undefined, initialProductId, initialSupplierId),
      );
    },
    onError: (error) => {
      const message =
        error.error?.serverError ??
        error.error?.validationErrors?.title?._errors?.[0] ??
        "Erro ao salvar pesquisa.";
      toast.error(message);
    },
  });

  const { execute: saveSupplier, status: supplierStatus } = useAction(
    upsertSupplier,
    {
      onSuccess: (result) => {
        if (result.data?.error) {
          toast.error(result.data.error.message);
          return;
        }

        if (result.data?.supplier) {
          const newSupplier = result.data.supplier;
          setSuppliers((prev) =>
            sortByName([
              ...prev,
              { ...newSupplier, createdAT: new Date(), updatedAt: new Date() },
            ]),
          );
          toast.success("Fornecedor salvo com sucesso!");
          setSupplierForm({ name: "", address: "", phone: "" });
          setSupplierDialogOpen(false);
        }
      },
      onError: () => {
        toast.error("Erro ao salvar fornecedor.");
      },
    },
  );

  const { execute: saveCategory, status: categoryStatus } = useAction(
    upsertCategory,
    {
      onSuccess: (result) => {
        if (result.data?.error) {
          toast.error(result.data.error.message);
          return;
        }

        if (result.data?.category) {
          const newCategory = result.data.category;
          setCategories((prev) =>
            sortByName([
              ...prev,
              { ...newCategory, createdAT: new Date(), updatedAt: new Date() },
            ]),
          );
          toast.success("Categoria salva com sucesso!");
          setCategoryForm({ name: "" });
          setCategoryDialogOpen(false);
        }
      },
      onError: () => {
        toast.error("Erro ao salvar categoria.");
      },
    },
  );

  const { execute: saveProduct, status: productStatus } = useAction(
    upsertProduct,
    {
      onSuccess: (result) => {
        if (result.data?.error) {
          toast.error(result.data.error.message);
          return;
        }

        if (result.data?.product) {
          const newProduct = result.data.product;
          const category = categories.find(
            (cat) => cat.id === newProduct.categoryId,
          );
          if (category) {
            setProducts((prev) =>
              sortByName([
                ...prev,
                {
                  ...newProduct,
                  category,
                  createdAT: new Date(),
                  updatedAt: new Date(),
                },
              ]),
            );
            toast.success("Produto salvo com sucesso!");
            setProductForm({ name: "", categoryId: "" });
            setProductDialogOpen(false);
          }
        }
      },
      onError: () => {
        toast.error("Erro ao salvar produto.");
      },
    },
  );

  const onSubmit = (values: FormValues) => {
    execute({
      ...values,
      id: priceSearch?.id,
      summary: values.summary || undefined,
      description: values.description || undefined,
      coverImageUrl: values.coverImageUrl || undefined,
      collectionDate: values.collectionDate || undefined,
      observation: values.observation || undefined,
      items: values.items.map((item) => ({
        productId: item.productId,
        supplierId: item.supplierId,
        price: reaisToCentavos(item.price),
      })),
    });
  };

  const itemErrorMessage = useMemo(() => {
    const error = form.formState.errors.items;
    if (!error) return null;
    if (Array.isArray(error)) {
      return null;
    }
    return "Revise os itens adicionados.";
  }, [form.formState.errors.items]);

  return (
    <>
      <DialogContent className="flex h-[95vh] w-[95vw] max-w-[95vw] flex-col p-0 md:w-[98vw] md:max-w-[98vw] lg:w-[80] lg:max-w-[80]">
        <div className="border-b px-6 pt-6 pb-4">
          <DialogTitle>
            {priceSearch ? "Editar pesquisa" : "Nova pesquisa"}
          </DialogTitle>
          <DialogDescription>
            {priceSearch
              ? "Atualize os dados e itens desta pesquisa."
              : "Cadastre uma nova pesquisa de preços."}
          </DialogDescription>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da pesquisa" {...field} />
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
                        <Input placeholder="pesquisa-2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resumo</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[100px]"
                          placeholder="Resumo curto para o card"
                          {...field}
                        />
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
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[100px]"
                          placeholder="Descrição detalhada"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="coverImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da imagem (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano da pesquisa</FormLabel>
                      <FormControl>
                        <Input type="number" min={2000} max={2100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="collectionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da coleta</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emphasis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destacar pesquisa</FormLabel>
                      <FormControl>
                        <div className="border-input bg-background flex h-10 items-center gap-2 rounded-md border px-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={field.value}
                            onChange={(event) =>
                              field.onChange(event.target.checked)
                            }
                          />
                          <span className="text-muted-foreground text-sm">
                            Marque para destacar esta pesquisa
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="observation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[100px]"
                        placeholder="Observações sobre a pesquisa de preços"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">Itens da pesquisa</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        append(
                          createEmptyItem(initialProductId, initialSupplierId),
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar item
                    </Button>
                    <Dialog
                      open={supplierDialogOpen}
                      onOpenChange={setSupplierDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          Novo fornecedor
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogTitle>Novo fornecedor</DialogTitle>
                        <DialogDescription>
                          Cadastre rapidamente um fornecedor sem sair do
                          formulário.
                        </DialogDescription>
                        <div className="space-y-3">
                          <Input
                            placeholder="Nome"
                            value={supplierForm.name}
                            onChange={(event) =>
                              setSupplierForm((prev) => ({
                                ...prev,
                                name: event.target.value,
                              }))
                            }
                          />
                          <Input
                            placeholder="Telefone"
                            value={supplierForm.phone}
                            onChange={(event) =>
                              setSupplierForm((prev) => ({
                                ...prev,
                                phone: event.target.value,
                              }))
                            }
                          />
                          <Textarea
                            placeholder="Endereço"
                            value={supplierForm.address}
                            onChange={(event) =>
                              setSupplierForm((prev) => ({
                                ...prev,
                                address: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            onClick={() => saveSupplier(supplierForm)}
                            disabled={supplierStatus === "executing"}
                          >
                            {supplierStatus === "executing" ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              "Salvar fornecedor"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={categoryDialogOpen}
                      onOpenChange={setCategoryDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          Nova categoria
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogTitle>Nova categoria</DialogTitle>
                        <DialogDescription>
                          Crie uma categoria para organizar os produtos.
                        </DialogDescription>
                        <Input
                          placeholder="Nome da categoria"
                          value={categoryForm.name}
                          onChange={(event) =>
                            setCategoryForm({ name: event.target.value })
                          }
                        />
                        <DialogFooter>
                          <Button
                            type="button"
                            onClick={() => saveCategory(categoryForm)}
                            disabled={categoryStatus === "executing"}
                          >
                            {categoryStatus === "executing" ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              "Salvar categoria"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={productDialogOpen}
                      onOpenChange={setProductDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          Novo produto
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogTitle>Novo produto</DialogTitle>
                        <DialogDescription>
                          Cadastre rapidamente um produto sem sair do
                          formulário.
                        </DialogDescription>
                        <div className="space-y-3">
                          <Input
                            placeholder="Nome do produto"
                            value={productForm.name}
                            onChange={(event) =>
                              setProductForm((prev) => ({
                                ...prev,
                                name: event.target.value,
                              }))
                            }
                          />
                          <Select
                            value={productForm.categoryId}
                            onValueChange={(value) =>
                              setProductForm((prev) => ({
                                ...prev,
                                categoryId: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            onClick={() => saveProduct(productForm)}
                            disabled={
                              productStatus === "executing" ||
                              !productForm.name.trim() ||
                              !productForm.categoryId
                            }
                          >
                            {productStatus === "executing" ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              "Salvar produto"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {fields.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Nenhum item adicionado ainda.
                  </p>
                )}

                <div className="space-y-4">
                  {fields.map((fieldItem, index) => (
                    <div
                      key={fieldItem.id}
                      className="space-y-4 rounded-md border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Item {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            remove(index);
                            setProductSearchTerms((prev) => {
                              const newTerms = { ...prev };
                              delete newTerms[index];
                              // Reindexar os termos após a remoção
                              const reindexed: Record<number, string> = {};
                              Object.entries(newTerms).forEach(
                                ([key, value]) => {
                                  const oldIndex = Number(key);
                                  if (oldIndex > index) {
                                    reindexed[oldIndex - 1] = value;
                                  } else if (oldIndex < index) {
                                    reindexed[oldIndex] = value;
                                  }
                                },
                              );
                              return reindexed;
                            });
                            setSupplierSearchTerms((prev) => {
                              const newTerms = { ...prev };
                              delete newTerms[index];
                              // Reindexar os termos após a remoção
                              const reindexed: Record<number, string> = {};
                              Object.entries(newTerms).forEach(
                                ([key, value]) => {
                                  const oldIndex = Number(key);
                                  if (oldIndex > index) {
                                    reindexed[oldIndex - 1] = value;
                                  } else if (oldIndex < index) {
                                    reindexed[oldIndex] = value;
                                  }
                                },
                              );
                              return reindexed;
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.productId`}
                          render={({ field }) => {
                            const searchTerm = productSearchTerms[index] || "";

                            // Filtrar produtos
                            let filteredProducts = products;
                            if (searchTerm.trim()) {
                              const term = searchTerm.toLowerCase();
                              filteredProducts = products.filter(
                                (p) =>
                                  p.name.toLowerCase().includes(term) ||
                                  p.category.name.toLowerCase().includes(term),
                              );
                            }

                            // Agrupar produtos por categoria
                            const productsByCategory: Record<
                              string,
                              typeof filteredProducts
                            > = {};
                            filteredProducts.forEach((product) => {
                              const catName = product.category.name;
                              if (!productsByCategory[catName]) {
                                productsByCategory[catName] = [];
                              }
                              productsByCategory[catName].push(product);
                            });

                            // Limitar a 20 itens mantendo organização por categoria
                            const limitedProducts: Record<
                              string,
                              typeof filteredProducts
                            > = {};
                            let count = 0;
                            for (const [catName, prods] of Object.entries(
                              productsByCategory,
                            )) {
                              if (count >= 20) break;
                              const remaining = 20 - count;
                              const toTake = Math.min(remaining, prods.length);
                              if (toTake > 0) {
                                limitedProducts[catName] = prods.slice(
                                  0,
                                  toTake,
                                );
                                count += toTake;
                              }
                            }

                            const totalShown = Object.values(
                              limitedProducts,
                            ).reduce((sum, prods) => sum + prods.length, 0);
                            const hasMore =
                              filteredProducts.length > totalShown;

                            return (
                              <FormItem>
                                <FormLabel>Produto</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    setProductSearchTerms((prev) => ({
                                      ...prev,
                                      [index]: "",
                                    }));
                                  }}
                                  value={field.value}
                                  disabled={!products.length}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione um produto" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="max-h-[300px]">
                                    <div className="bg-popover sticky top-0 z-10 border-b p-2">
                                      <div className="relative">
                                        <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                        <Input
                                          ref={(input) => {
                                            productSearchInputRefs.current[
                                              index
                                            ] = input;
                                            if (input) {
                                              setTimeout(
                                                () => input.focus(),
                                                0,
                                              );
                                            }
                                          }}
                                          placeholder="Buscar produto..."
                                          value={searchTerm}
                                          onChange={(e) => {
                                            setProductSearchTerms((prev) => ({
                                              ...prev,
                                              [index]: e.target.value,
                                            }));
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                          }}
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                          }}
                                          onPointerDown={(e) => {
                                            e.stopPropagation();
                                          }}
                                          onKeyDown={(e) => {
                                            e.stopPropagation();
                                            // Permitir Escape para fechar o select
                                            if (e.key === "Escape") {
                                              return;
                                            }
                                            // Permitir Enter apenas se houver um item selecionado
                                            if (e.key === "Enter") {
                                              const firstItem =
                                                Object.values(
                                                  limitedProducts,
                                                )[0]?.[0];
                                              if (firstItem) {
                                                field.onChange(firstItem.id);
                                                setProductSearchTerms(
                                                  (prev) => ({
                                                    ...prev,
                                                    [index]: "",
                                                  }),
                                                );
                                              }
                                              e.preventDefault();
                                              return;
                                            }
                                            // Para todas as outras teclas, apenas impedir que o Select as capture
                                            // mas permitir que o input as processe normalmente
                                          }}
                                          onFocus={(e) => {
                                            e.stopPropagation();
                                          }}
                                          className="h-8 pl-8"
                                        />
                                      </div>
                                    </div>
                                    <div className="max-h-[240px] overflow-y-auto">
                                      {Object.keys(limitedProducts).length ===
                                      0 ? (
                                        <div className="text-muted-foreground px-2 py-6 text-center text-sm">
                                          Nenhum produto encontrado
                                        </div>
                                      ) : (
                                        Object.entries(limitedProducts).map(
                                          ([catName, prods]) => (
                                            <SelectGroup key={catName}>
                                              <SelectLabel>
                                                {catName}
                                              </SelectLabel>
                                              {prods.map((product) => (
                                                <SelectItem
                                                  key={product.id}
                                                  value={product.id}
                                                >
                                                  {product.name}
                                                </SelectItem>
                                              ))}
                                            </SelectGroup>
                                          ),
                                        )
                                      )}
                                      {hasMore && (
                                        <div className="text-muted-foreground border-t px-2 py-2 text-center text-xs">
                                          Mostrando {totalShown} de{" "}
                                          {filteredProducts.length} produtos
                                        </div>
                                      )}
                                    </div>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.supplierId`}
                          render={({ field }) => {
                            const searchTerm = supplierSearchTerms[index] || "";

                            // Filtrar fornecedores
                            let filteredSuppliers = suppliers;
                            if (searchTerm.trim()) {
                              const term = searchTerm.toLowerCase();
                              filteredSuppliers = suppliers.filter((s) =>
                                s.name.toLowerCase().includes(term),
                              );
                            }

                            // Limitar a 20 itens
                            const limitedSuppliers = filteredSuppliers.slice(
                              0,
                              20,
                            );
                            const hasMore = filteredSuppliers.length > 20;

                            return (
                              <FormItem>
                                <FormLabel>Fornecedor</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    setSupplierSearchTerms((prev) => ({
                                      ...prev,
                                      [index]: "",
                                    }));
                                  }}
                                  value={field.value}
                                  disabled={!suppliers.length}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="max-h-[300px]">
                                    <div className="bg-popover sticky top-0 z-10 border-b p-2">
                                      <div className="relative">
                                        <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                        <Input
                                          ref={(input) => {
                                            supplierSearchInputRefs.current[
                                              index
                                            ] = input;
                                            if (input) {
                                              setTimeout(
                                                () => input.focus(),
                                                0,
                                              );
                                            }
                                          }}
                                          placeholder="Buscar fornecedor..."
                                          value={searchTerm}
                                          onChange={(e) => {
                                            setSupplierSearchTerms((prev) => ({
                                              ...prev,
                                              [index]: e.target.value,
                                            }));
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                          }}
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                          }}
                                          onPointerDown={(e) => {
                                            e.stopPropagation();
                                          }}
                                          onKeyDown={(e) => {
                                            e.stopPropagation();
                                            // Permitir Escape para fechar o select
                                            if (e.key === "Escape") {
                                              return;
                                            }
                                            // Permitir Enter apenas se houver um item selecionado
                                            if (e.key === "Enter") {
                                              const firstItem =
                                                limitedSuppliers[0];
                                              if (firstItem) {
                                                field.onChange(firstItem.id);
                                                setSupplierSearchTerms(
                                                  (prev) => ({
                                                    ...prev,
                                                    [index]: "",
                                                  }),
                                                );
                                              }
                                              e.preventDefault();
                                              return;
                                            }
                                            // Para todas as outras teclas, apenas impedir que o Select as capture
                                            // mas permitir que o input as processe normalmente
                                          }}
                                          onFocus={(e) => {
                                            e.stopPropagation();
                                          }}
                                          className="h-8 pl-8"
                                        />
                                      </div>
                                    </div>
                                    <div className="max-h-[240px] overflow-y-auto">
                                      {limitedSuppliers.length === 0 ? (
                                        <div className="text-muted-foreground px-2 py-6 text-center text-sm">
                                          Nenhum fornecedor encontrado
                                        </div>
                                      ) : (
                                        limitedSuppliers.map((supplier) => (
                                          <SelectItem
                                            key={supplier.id}
                                            value={supplier.id}
                                          >
                                            {supplier.name}
                                          </SelectItem>
                                        ))
                                      )}
                                      {hasMore && (
                                        <div className="text-muted-foreground border-t px-2 py-2 text-center text-xs">
                                          Mostrando {limitedSuppliers.length} de{" "}
                                          {filteredSuppliers.length}{" "}
                                          fornecedores
                                        </div>
                                      )}
                                    </div>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preço (R$)</FormLabel>
                              <FormControl>
                                <Input placeholder="0,00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {itemErrorMessage && (
                  <p className="text-destructive text-sm">{itemErrorMessage}</p>
                )}
              </div>
            </form>
          </Form>
        </div>
        <div className="border-t px-6 pt-4 pb-6">
          <DialogFooter>
            <Button
              type="submit"
              disabled={status === "executing"}
              onClick={form.handleSubmit(onSubmit)}
            >
              {status === "executing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : priceSearch ? (
                "Atualizar pesquisa"
              ) : (
                "Criar pesquisa"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </>
  );
};

export default UpsertPriceSearchForm;
