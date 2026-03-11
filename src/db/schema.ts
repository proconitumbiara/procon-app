import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  cpf: text("cpf").unique(),
  phoneNumber: text("phone_number").unique(),
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
    index("operations_user_id_status_idx").on(table.userId, table.status),
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
  }),
);

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
