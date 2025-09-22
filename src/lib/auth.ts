import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";

import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  trustedOrigins: ["http://localhost:3000", "http://192.168.1.12:3000"],
  plugins: [
    customSession(async ({ user, session }) => {
      return {
        user: {
          ...user,
        },
        session,
      };
    }),
  ],
  user: {
    modelName: "usersTable",
  },
  session: {
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
  emailAndPassword: {
    enabled: true,
  },
});
