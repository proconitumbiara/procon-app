import { db } from "@/db";
import {
  newsTable,
  projectsTable,
  servicesTable,
} from "@/db/schema";

export type NewsRecord = typeof newsTable.$inferSelect;
export type ProjectRecord = typeof projectsTable.$inferSelect;
export type ServiceRecord = typeof servicesTable.$inferSelect;

export async function getIndexPublishedNews() {
  return db.query.newsTable.findMany({
    where: (news, { and, eq }) =>
      and(eq(news.isPublished, true), eq(news.emphasis, true)),
    orderBy: (news, { desc }) => [desc(news.publishedAt), desc(news.createdAT)],
  });
}

export async function getIndexProjects() {
  return db.query.projectsTable.findMany({
    where: (project, { eq }) => eq(project.emphasis, true),
    orderBy: (project, { desc }) => [desc(project.createdAT)],
  });
}

export async function getIndexServices() {
  return db.query.servicesTable.findMany({
    where: (service, { and, eq }) =>
      and(eq(service.isActive, true), eq(service.emphasis, true)),
    orderBy: (service, { asc }) => [asc(service.title)],
  });
}
