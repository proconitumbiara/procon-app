"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { categoriesTable, productsTable } from "@/db/schema";

import { productsTableColumns } from "./products-table-columns";

type Product = typeof productsTable.$inferSelect & {
  category: typeof categoriesTable.$inferSelect;
};
type Category = typeof categoriesTable.$inferSelect;

interface ProductsFiltersProps {
  products: Product[];
  categories: Category[];
}

export default function ProductsFilters({
  products,
  categories,
}: ProductsFiltersProps) {
  const [nameFilter, setNameFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
        (categoryFilter ? product.categoryId === categoryFilter : true),
    );
    // Se não há filtros, ordena por createdAT do mais novo para o mais antigo
    if (!nameFilter && !categoryFilter) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.createdAT).getTime();
        const dateB = new Date(b.createdAT).getTime();
        return dateB - dateA; // mais novo primeiro
      });
    }
    return filtered;
  }, [products, nameFilter, categoryFilter]);

  const columns = useMemo(
    () => productsTableColumns(categories),
    [categories],
  );

  return (
    <>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Buscar por nome"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="rounded border p-2 text-sm"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded border p-2 text-sm"
        >
          <option value="" className="bg-background">
            Todas as categorias
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id} className="bg-background">
              {category.name}
            </option>
          ))}
        </select>
        <Button
          onClick={() => {
            setNameFilter("");
            setCategoryFilter("");
          }}
          variant="link"
        >
          Resetar filtros
        </Button>
      </div>
      {/* Contador de registros */}
      <div className="text-muted-foreground mb-2 text-sm">
        {filteredProducts.length} registro
        {filteredProducts.length === 1 ? "" : "s"} encontrado
        {filteredProducts.length === 1 ? "" : "s"}
      </div>
      <DataTable data={filteredProducts} columns={columns} />
    </>
  );
}

