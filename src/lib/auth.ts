import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { usersTable } from "@/db/schema";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  basePath: "/api/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users: schema.usersTable,
      sessions: schema.sessionsTable,
      accounts: schema.accountsTable,
      verifications: schema.verificationsTable,
    },
  }),
  trustedOrigins: ["http://localhost:3000", "http://192.168.1.12:3000"],
  plugins: [
    customSession(async ({ user, session }) => {
      const [userData] = await Promise.all([
        db.query.usersTable.findFirst({
          where: eq(usersTable.id, user.id),
        }),
      ]);
      return {
        user: {
          ...user,
          phoneNumber: userData?.phoneNumber,
          cpf: userData?.cpf,
          role: userData?.role,
        },
        session,
      };
    }),
  ],
  user: {
    modelName: "users",
    additionalFields: {
      phoneNumber: {
        type: "string",
        fieldName: "phone_number",
        required: false,
      },
      cpf: {
        type: "string",
        cpfFieldName: "cpf",
        required: false,
      },
      role: {
        type: "string",
        fieldName: "role",
        required: false,
      },
    },
  },
  session: {
    modelName: "sessions",
  },
  account: {
    modelName: "accounts",
  },
  verification: {
    modelName: "verifications",
  },
  emailAndPassword: {
    enabled: true,
  },
});
