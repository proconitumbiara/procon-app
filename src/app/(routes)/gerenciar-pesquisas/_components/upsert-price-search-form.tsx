"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertCategory } from "@/actions/upsert-category";
import { upsertPriceSearch } from "@/actions/upsert-price-search";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categoriesTable, suppliersTable } from "@/db/schema";
import { centavosToReaisNumber, reaisToCentavos } from "@/lib/formatters";
import { PriceSearchWithRelations } from "@/types/content-management";

type Supplier = typeof suppliersTable.$inferSelect;
type Category = typeof categoriesTable.$inferSelect;

interface UpsertPriceSearchFormProps {
  priceSearch?: PriceSearchWithRelations;
  suppliers: Supplier[];
  categories: Category[];
  onSuccess?: () => void;
}

const productFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Informe o nome do produto." }),
  price: z.string().trim().min(1, { message: "Informe o preço do produto." }),
  priceVariation: z
    .string()
    .trim()
    .min(1, { message: "Informe a variação de preço." }),
  unit: z.string().trim().optional(),
  weight: z.string().trim().optional(),
  supplierId: z.string().uuid({ message: "Selecione um fornecedor." }),
  categoryId: z.string().uuid({ message: "Selecione uma categoria." }),
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
  products: z
    .array(productFormSchema)
    .min(1, { message: "Adicione ao menos um produto." }),
});

type FormValues = z.infer<typeof formSchema>;

const createEmptyProduct = (supplierId?: string, categoryId?: string) => ({
  name: "",
  price: "",
  priceVariation: "",
  unit: "",
  weight: "",
  supplierId: supplierId ?? "",
  categoryId: categoryId ?? "",
});

const getDefaultValues = (
  priceSearch?: PriceSearchWithRelations,
  supplierId?: string,
  categoryId?: string,
) => ({
  title: priceSearch?.title ?? "",
  slug: priceSearch?.slug ?? "",
  summary: priceSearch?.summary ?? "",
  description: priceSearch?.description ?? "",
  coverImageUrl: priceSearch?.coverImageUrl ?? "",
  year: priceSearch?.year ?? new Date().getFullYear(),
  emphasis: priceSearch?.emphasis ?? false,
  products: priceSearch?.products.map((product) => ({
    name: product.name,
    price: centavosToReaisNumber(product.price).toFixed(2).replace(".", ","),
    priceVariation: product.priceVariation,
    unit: product.unit ?? "",
    weight: product.weight?.toString() ?? "",
    supplierId: product.supplierId,
    categoryId: product.categoryId,
  })) ?? [createEmptyProduct(supplierId, categoryId)],
});

const sortByName = <T extends { name: string }>(items: T[]) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name));

const UpsertPriceSearchForm = ({
  priceSearch,
  suppliers: initialSuppliers,
  categories: initialCategories,
  onSuccess,
}: UpsertPriceSearchFormProps) => {
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [suppliers, setSuppliers] = useState(() =>
    sortByName(initialSuppliers),
  );
  const [categories, setCategories] = useState(() =>
    sortByName(initialCategories),
  );

  const initialSupplierId = suppliers[0]?.id;
  const initialCategoryId = categories[0]?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(
      priceSearch,
      initialSupplierId,
      initialCategoryId,
    ),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
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
        getDefaultValues(undefined, initialSupplierId, initialCategoryId),
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

  const onSubmit = (values: FormValues) => {
    execute({
      ...values,
      id: priceSearch?.id,
      summary: values.summary || undefined,
      description: values.description || undefined,
      coverImageUrl: values.coverImageUrl || undefined,
      products: values.products.map((product) => ({
        name: product.name,
        price: reaisToCentavos(product.price),
        priceVariation: product.priceVariation,
        unit: product.unit || undefined,
        weight: product.weight ? Number(product.weight) : undefined,
        supplierId: product.supplierId,
        categoryId: product.categoryId,
      })),
    });
  };

  const productErrorMessage = useMemo(() => {
    const error = form.formState.errors.products;
    if (!error) return null;
    if (Array.isArray(error)) {
      return null;
    }
    return "Revise os produtos adicionados.";
  }, [form.formState.errors.products]);

  return (
    <>
      <DialogContent className="max-w-5xl">
        <DialogTitle>
          {priceSearch ? "Editar pesquisa" : "Nova pesquisa"}
        </DialogTitle>
        <DialogDescription>
          {priceSearch
            ? "Atualize os dados e itens desta pesquisa."
            : "Cadastre uma nova pesquisa de preços."}
        </DialogDescription>
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
                name="emphasis"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 rounded-md border p-3">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={field.value}
                        onChange={(event) =>
                          field.onChange(event.target.checked)
                        }
                      />
                    </FormControl>
                    <FormLabel className="m-0">Destacar pesquisa</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Itens da pesquisa</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append(
                        createEmptyProduct(
                          initialSupplierId,
                          initialCategoryId,
                        ),
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
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name={`products.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Produto</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex.: Arroz 5kg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`products.${index}.price`}
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
                      <FormField
                        control={form.control}
                        name={`products.${index}.priceVariation`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Variação</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex.: +3% vs mês anterior"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name={`products.${index}.unit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidade</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Pacote, kg, unidade..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`products.${index}.weight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso (g)</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid flex-wrap gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`products.${index}.supplierId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fornecedor</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={!suppliers.length}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {suppliers.map((supplier) => (
                                    <SelectItem
                                      key={supplier.id}
                                      value={supplier.id}
                                    >
                                      {supplier.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`products.${index}.categoryId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categoria</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={!categories.length}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {productErrorMessage && (
                <p className="text-destructive text-sm">
                  {productErrorMessage}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={status === "executing"}>
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
          </form>
        </Form>
      </DialogContent>
    </>
  );
};

export default UpsertPriceSearchForm;
