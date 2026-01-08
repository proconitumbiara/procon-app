import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCentavosToBRL } from "@/lib/formatters";
import type { PriceSearchItem } from "@/types/content-management";

interface PriceComparisonTableProps {
  items: PriceSearchItem[];
}

interface GroupedProduct {
  productId: string;
  productName: string;
  categoryName: string;
  prices: Array<{
    supplierId: string;
    supplierName: string;
    price: number;
  }>;
  minPrice: number;
  maxPrice: number;
}

export default function PriceComparisonTable({
  items,
}: PriceComparisonTableProps) {
  if (items.length === 0) {
    return (
      <div className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center">
        Nenhum item de preço disponível nesta pesquisa.
      </div>
    );
  }

  // Agrupar itens por produto
  const groupedByProduct = new Map<string, GroupedProduct>();

  items.forEach((item) => {
    const productId = item.product.id;
    const productName = item.product.name;
    const categoryName = item.product.category.name;

    if (!groupedByProduct.has(productId)) {
      groupedByProduct.set(productId, {
        productId,
        productName,
        categoryName,
        prices: [],
        minPrice: item.price,
        maxPrice: item.price,
      });
    }

    const product = groupedByProduct.get(productId)!;
    product.prices.push({
      supplierId: item.supplier.id,
      supplierName: item.supplier.name,
      price: item.price,
    });

    // Atualizar min e max
    if (item.price < product.minPrice) {
      product.minPrice = item.price;
    }
    if (item.price > product.maxPrice) {
      product.maxPrice = item.price;
    }
  });

  const groupedProducts = Array.from(groupedByProduct.values());

  // Ordenar por categoria e depois por nome do produto
  groupedProducts.sort((a, b) => {
    if (a.categoryName !== b.categoryName) {
      return a.categoryName.localeCompare(b.categoryName);
    }
    return a.productName.localeCompare(b.productName);
  });

  // Obter todos os fornecedores únicos
  const allSuppliers = new Set<string>();
  groupedProducts.forEach((product) => {
    product.prices.forEach((price) => {
      allSuppliers.add(price.supplierId);
    });
  });

  const supplierMap = new Map<string, string>();
  items.forEach((item) => {
    if (!supplierMap.has(item.supplier.id)) {
      supplierMap.set(item.supplier.id, item.supplier.name);
    }
  });

  const suppliers = Array.from(allSuppliers).map((id) => ({
    id,
    name: supplierMap.get(id) || "Fornecedor",
  }));

  // Ordenar fornecedores por nome
  suppliers.sort((a, b) => a.name.localeCompare(b.name));

  // Criar mapa de preços: fornecedor -> produto -> preço
  const supplierProductPriceMap = new Map<string, Map<string, number>>();

  items.forEach((item) => {
    if (!supplierProductPriceMap.has(item.supplier.id)) {
      supplierProductPriceMap.set(item.supplier.id, new Map());
    }
    const supplierPrices = supplierProductPriceMap.get(item.supplier.id)!;
    supplierPrices.set(item.product.id, item.price);
  });

  // Calcular variação para cada produto
  const productVariations = groupedProducts.map((product) => {
    const variation =
      product.minPrice > 0
        ? ((product.maxPrice - product.minPrice) / product.minPrice) * 100
        : 0;
    return {
      productId: product.productId,
      variation,
    };
  });

  return (
    <div className="space-y-6">
      <div className="max-w-full overflow-x-auto">
        <div className="inline-block min-w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-background sticky left-0 z-10 min-w-[200px]">
                  Fornecedor
                </TableHead>
                {groupedProducts.map((product) => (
                  <TableHead
                    key={product.productId}
                    className="min-w-[150px] text-center"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{product.productName}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => {
                const supplierPrices =
                  supplierProductPriceMap.get(supplier.id) || new Map();

                return (
                  <TableRow key={supplier.id}>
                    <TableCell className="bg-background sticky left-0 z-10 font-medium">
                      {supplier.name}
                    </TableCell>
                    {groupedProducts.map((product) => {
                      const price = supplierPrices.get(product.productId);
                      const isMinPrice = price === product.minPrice;
                      const isMaxPrice = price === product.maxPrice;

                      return (
                        <TableCell
                          key={product.productId}
                          className="text-center"
                        >
                          {price !== undefined ? (
                            <div className="flex flex-col gap-1">
                              <span
                                className={
                                  isMinPrice
                                    ? "font-semibold text-green-600 dark:text-green-400"
                                    : isMaxPrice
                                      ? "font-semibold text-red-600 dark:text-red-400"
                                      : ""
                                }
                              >
                                {formatCentavosToBRL(price)}
                              </span>
                              {isMinPrice && (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  Menor
                                </span>
                              )}
                              {isMaxPrice && (
                                <span className="text-xs text-red-600 dark:text-red-400">
                                  Maior
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
              {/* Linha com variação de cada produto */}
              <TableRow className="bg-muted/25">
                <TableCell className="sticky left-0 z-10 flex flex-col gap-1 font-medium">
                  <p className="text-muted-foreground text-xs font-semibold">
                    Variação
                    <span className="text-muted-foreground ml-2 text-xs font-extralight">
                      *Diferença entre o menor e o maior preço
                    </span>
                  </p>
                </TableCell>
                {groupedProducts.map((product) => {
                  const variationData = productVariations.find(
                    (v) => v.productId === product.productId,
                  );
                  const variation = variationData?.variation ?? 0;

                  return (
                    <TableCell key={product.productId} className="text-center">
                      <span className="text-primary font-semibold">
                        {variation.toFixed(2)}%
                      </span>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
