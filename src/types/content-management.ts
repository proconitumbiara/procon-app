import {
  categoriesTable,
  newsDocumentsTable,
  newsTable,
  priceSearchesTable,
  priceSearchItemsTable,
  productsTable,
  projectsTable,
  servicesTable,
  suppliersTable,
} from "@/db/schema";

export type NewsWithDocuments = typeof newsTable.$inferSelect & {
  documents: (typeof newsDocumentsTable.$inferSelect)[];
};

export type ProjectWithDocuments = typeof projectsTable.$inferSelect;

export type ServiceWithDocuments = typeof servicesTable.$inferSelect;

export type PriceSearchItem = typeof priceSearchItemsTable.$inferSelect & {
  product: typeof productsTable.$inferSelect & {
    category: typeof categoriesTable.$inferSelect;
  };
  supplier: typeof suppliersTable.$inferSelect;
};

export type PriceSearchWithRelations =
  typeof priceSearchesTable.$inferSelect & {
    items: PriceSearchItem[];
  };
