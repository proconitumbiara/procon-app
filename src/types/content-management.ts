import {
  categoriesTable,
  newsDocumentsTable,
  newsTable,
  priceSearchesTable,
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

export type PriceSearchProduct = typeof productsTable.$inferSelect & {
  supplier: typeof suppliersTable.$inferSelect;
  category: typeof categoriesTable.$inferSelect;
};

export type PriceSearchWithRelations =
  typeof priceSearchesTable.$inferSelect & {
    products: PriceSearchProduct[];
  };
