import { sql } from "drizzle-orm";

import { db } from "@/db";
import {
  newsDocumentsTable,
  newsTable,
  projectsTable,
  servicesTable,
} from "@/db/schema";

export type NewsRecord = typeof newsTable.$inferSelect;
export type NewsDocumentRecord = typeof newsDocumentsTable.$inferSelect;
export type ProjectRecord = typeof projectsTable.$inferSelect;
export type ServiceRecord = typeof servicesTable.$inferSelect;

export async function getPublishedNews() {
  return db.query.newsTable.findMany({
    where: (news, { eq }) => eq(news.isPublished, true),
    orderBy: (news, { desc }) => [desc(news.publishedAt), desc(news.createdAT)],
  });
}

export async function getNewsBySlug(slug: string) {
  const news = await db.query.newsTable.findFirst({
    where: (news, helpers) =>
      helpers.and(
        helpers.eq(news.slug, slug),
        helpers.eq(news.isPublished, true),
      ),
  });

  if (!news) {
    return null;
  }

  const documents = await db.query.newsDocumentsTable.findMany({
    where: (doc, helpers) => helpers.eq(doc.newsId, news.id),
    orderBy: (doc, { asc }) => [asc(doc.displayOrder), asc(doc.createdAT)],
  });

  return { ...news, documents };
}

export async function getAllProjects() {
  return db.query.projectsTable.findMany({
    orderBy: (project, { desc }) => [desc(project.createdAT)],
  });
}

export async function getProjectBySlug(slug: string) {
  const project = await db.query.projectsTable.findFirst({
    where: (project, { eq }) => eq(project.slug, slug),
  });

  if (!project) {
    return null;
  }

  return project;
}

export async function getActiveServices() {
  return db.query.servicesTable.findMany({
    where: (service, { eq }) => eq(service.isActive, true),
    orderBy: (service, { asc }) => [asc(service.title)],
  });
}

export async function getServiceBySlug(slug: string) {
  const service = await db.query.servicesTable.findFirst({
    where: (service, helpers) =>
      helpers.and(
        helpers.eq(service.slug, slug),
        helpers.eq(service.isActive, true),
      ),
  });

  if (!service) {
    return null;
  }

  return service;
}

export async function searchNews(query: string) {
  if (!query.trim()) {
    return [];
  }

  const searchTerm = `%${query.trim()}%`;

  return db.query.newsTable.findMany({
    where: (news, { and, eq, or }) =>
      and(
        eq(news.isPublished, true),
        or(
          sql`${news.title} ILIKE ${searchTerm}`,
          sql`${news.excerpt} ILIKE ${searchTerm}`,
          sql`${news.content} ILIKE ${searchTerm}`,
        ),
      ),
    orderBy: (news, { desc }) => [desc(news.publishedAt), desc(news.createdAT)],
  });
}

export async function searchProjects(query: string) {
  if (!query.trim()) {
    return [];
  }

  const searchTerm = `%${query.trim()}%`;

  return db.query.projectsTable.findMany({
    where: (project, { or }) =>
      or(
        sql`${project.title} ILIKE ${searchTerm}`,
        sql`${project.summary} ILIKE ${searchTerm}`,
        sql`${project.description} ILIKE ${searchTerm}`,
      ),
    orderBy: (project, { desc }) => [desc(project.createdAT)],
  });
}

export async function searchServices(query: string) {
  if (!query.trim()) {
    return [];
  }

  const searchTerm = `%${query.trim()}%`;

  return db.query.servicesTable.findMany({
    where: (service, { and, eq, or }) =>
      and(
        eq(service.isActive, true),
        or(
          sql`${service.title} ILIKE ${searchTerm}`,
          sql`${service.description} ILIKE ${searchTerm}`,
        ),
      ),
    orderBy: (service, { asc }) => [asc(service.title)],
  });
}
