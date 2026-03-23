import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Enum para meios de prova (seção 6)
export const evidenceTypeEnum = pgEnum("evidence_type", [
  "documentary",
  "photo_video",
  "none",
]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  cpf: text("cpf").unique(),
  phoneNumber: text("phone_number").unique(),
  profile: text("profile").notNull().default("tecnico-atendimento"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const sectorsTable = pgTable("sectors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  key_name: text("key_name").notNull().default("sector"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const servicePointsTable = pgTable("service_points", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  availability: text("availability").default("free"),
  preferredPriority: integer("preferred_priority").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  sectorId: uuid("sector_id")
    .notNull()
    .references(() => sectorsTable.id, { onDelete: "cascade" }),
});

export const operationsTable = pgTable(
  "operations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    finishedAt: timestamp("finished_at"),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    servicePointId: uuid("service_point_id")
      .notNull()
      .references(() => servicePointsTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("operations_user_id_status_idx").on(
      table.userId,
      table.status,
      table.finishedAt,
    ),
  ],
);

export const clientsTable = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  register: text("register").unique().notNull(),
  dateOfBirth: date("date_of_birth"),
  phoneNumber: text("phone_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const ticketsTable = pgTable(
  "tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    status: text("status").notNull().default("pending"),
    priority: integer("priority").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    calledAt: timestamp("called_at"),
    finishedAt: timestamp("finished_at"),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    sectorId: uuid("sector_id")
      .notNull()
      .references(() => sectorsTable.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clientsTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("tickets_status_sector_id_priority_idx").on(
      table.status,
      table.sectorId,
      table.calledAt,
      table.finishedAt,
      table.priority,
    ),
    index("tickets_status_idx").on(table.status),
  ],
);

export const treatmentsTable = pgTable(
  "treatments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    status: text("status").notNull().default("in_service"),
    duration: integer("duration"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    finishedAt: timestamp("finished_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => ticketsTable.id, { onDelete: "cascade" }),
    operationId: uuid("operation_id")
      .notNull()
      .references(() => operationsTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("treatments_operation_id_status_idx").on(
      table.operationId,
      table.status,
      table.finishedAt,
      table.startedAt,
    ),
  ],
);

export const registrationCodesTable = pgTable("registration_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
});

export const resetCodesTable = pgTable("reset_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
});

export const pausesTable = pgTable(
  "pauses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reason: text("reason").notNull(),
    operationId: uuid("operation_id")
      .notNull()
      .references(() => operationsTable.id, { onDelete: "cascade" }),
    duration: integer("duration").notNull(),
    status: text("status").notNull().default("in_progress"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    finishedAt: timestamp("finished_at"),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("pauses_operation_id_duration_idx").on(
      table.operationId,
      table.duration,
    ),
  ],
);

export const complaintsTable = pgTable("complaints", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Seção 1 - Solicitação Anônima
  isAnonymous: boolean("is_anonymous").notNull(),

  // Seção 2 - Qualificação do Denunciante (Consumidor)
  complainantName: text("complainant_name"),
  complainantProfession: text("complainant_profession"),
  complainantCpf: text("complainant_cpf"),
  complainantPhone: text("complainant_phone"),
  complainantEmail: text("complainant_email"),
  complainantAddress: text("complainant_address"),
  complainantZipCode: text("complainant_zip_code"),

  // Seção 3 - Qualificação do Denunciado (Fornecedor)
  respondentCompanyName: text("respondent_company_name").notNull(),
  respondentCnpj: text("respondent_cnpj"),
  respondentAddress: text("respondent_address"),
  respondentAdditionalInfo: text("respondent_additional_info"),

  // Seção 4 - Relato dos Fatos
  factsDescription: text("facts_description").notNull(),

  // Seção 5 - Do Pedido
  request: text("request").notNull(),

  // Seção 6 - Meios de Prova
  evidenceType: text("evidence_type"),

  // Metadados
  filingDate: timestamp("filing_date").notNull(),
  viewingStatus: text("viewing_status").notNull(),
  viewingDate: timestamp("viewing_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersTableRelations = relations(usersTable, ({ many }) => ({
  operations: many(operationsTable),
}));

export const sectorsTableRelations = relations(sectorsTable, ({ many }) => ({
  servicePoints: many(servicePointsTable),
}));

export const operationsTableRelations = relations(
  operationsTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [operationsTable.userId],
      references: [usersTable.id],
    }),
    servicePoint: one(servicePointsTable, {
      fields: [operationsTable.servicePointId],
      references: [servicePointsTable.id],
    }),
    treatments: many(treatmentsTable),
    pauses: many(pausesTable),
  }),
);

export const pausesTableRelations = relations(pausesTable, ({ one }) => ({
  operation: one(operationsTable, {
    fields: [pausesTable.operationId],
    references: [operationsTable.id],
  }),
}));

export const clientsTableRelations = relations(clientsTable, ({ many }) => ({
  tickets: many(ticketsTable),
  treatments: many(treatmentsTable),
}));

export const servicePointsTableRelations = relations(
  servicePointsTable,
  ({ one, many }) => ({
    sector: one(sectorsTable, {
      fields: [servicePointsTable.sectorId],
      references: [sectorsTable.id],
    }),
    operations: many(operationsTable),
  }),
);

export const ticketsTableRelations = relations(ticketsTable, ({ one }) => ({
  client: one(clientsTable, {
    fields: [ticketsTable.clientId],
    references: [clientsTable.id],
  }),
  sector: one(sectorsTable, {
    fields: [ticketsTable.sectorId],
    references: [sectorsTable.id],
  }),
  treatment: one(treatmentsTable),
}));

export const treatmentsTableRelations = relations(
  treatmentsTable,
  ({ one }) => ({
    ticket: one(ticketsTable, {
      fields: [treatmentsTable.ticketId],
      references: [ticketsTable.id],
    }),
    operation: one(operationsTable, {
      fields: [treatmentsTable.operationId],
      references: [operationsTable.id],
    }),
  }),
);
