import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categorias de cursos (ex: Saúde, Tecnologia, Indústria)
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Cursos oferecidos pela escola
 */
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 500 }),
  categoryId: int("categoryId").notNull(),
  duration: varchar("duration", { length: 50 }),
  modality: mysqlEnum("modality", ["presencial", "ead", "hibrido"]).default("presencial").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }),
  image: varchar("image", { length: 500 }),
  videoUrl: varchar("videoUrl", { length: 500 }), // URL do vídeo (YouTube, Vimeo, etc.)
  isActive: boolean("isActive").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Grade curricular dos cursos (módulos/disciplinas)
 */
export const curriculum = mysqlTable("curriculum", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 200 }).notNull(), // Nome do módulo/disciplina
  description: text("description"), // Descrição do conteúdo
  duration: varchar("duration", { length: 50 }), // Duração (ex: "40 horas")
  order: int("order").default(0), // Ordem de exibição
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Curriculum = typeof curriculum.$inferSelect;
export type InsertCurriculum = typeof curriculum.$inferInsert;

/**
 * Configurações gerais do site (textos, informações de contato, etc.)
 */
export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  type: mysqlEnum("type", ["text", "number", "boolean", "json", "html"]).default("text").notNull(),
  label: varchar("label", { length: 200 }),
  description: text("description"),
  group: varchar("group", { length: 50 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

/**
 * Depoimentos de alunos
 */
export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  course: varchar("course", { length: 200 }),
  content: text("content").notNull(),
  image: varchar("image", { length: 500 }),
  rating: int("rating").default(5),
  isActive: boolean("isActive").default(true).notNull(),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

/**
 * Favoritos de cursos dos usuários (lista de desejos)
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * Matrículas de alunos em cursos
 * Armazena apenas IDs do Stripe e metadados essenciais
 */
export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  
  // Stripe IDs - essenciais para referência
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }),
  
  // Status da matrícula (gerenciado localmente)
  status: mysqlEnum("status", ["pending", "active", "completed", "cancelled"]).default("pending").notNull(),
  
  // Dados essenciais para o negócio (não duplicados do Stripe)
  enrollmentDate: timestamp("enrollmentDate").defaultNow().notNull(),
  completionDate: timestamp("completionDate"),
  certificateIssued: boolean("certificateIssued").default(false).notNull(),
  certificateUrl: varchar("certificateUrl", { length: 500 }),
  
  // Metadados
  notes: text("notes"), // Notas administrativas
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

/**
 * Registro de transações de pagamento
 * Armazena apenas IDs do Stripe e informações essenciais para auditoria
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  enrollmentId: int("enrollmentId").notNull(),
  userId: int("userId").notNull(),
  
  // Stripe IDs
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull(),
  stripeChargeId: varchar("stripeChargeId", { length: 255 }),
  
  // Dados essenciais (cachê para performance - justificado para relatórios)
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("brl").notNull(),
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "refunded"]).default("pending").notNull(),
  
  // Método de pagamento (para relatórios locais)
  paymentMethod: varchar("paymentMethod", { length: 50 }), // pix, card, boleto
  
  // Auditoria
  paidAt: timestamp("paidAt"),
  refundedAt: timestamp("refundedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Pré-matrículas (leads de interessados em cursos)
 */
export const preEnrollments = mysqlTable("preEnrollments", {
  id: int("id").autoincrement().primaryKey(),
  
  // Dados do interessado
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  cpf: varchar("cpf", { length: 14 }),
  birthDate: date("birthDate"),
  
  // Curso de interesse
  courseId: int("courseId").notNull(),
  
  // Informações adicionais
  message: text("message"),
  preferredShift: mysqlEnum("preferredShift", ["morning", "afternoon", "evening", "flexible"]),
  howDidYouHear: varchar("howDidYouHear", { length: 100 }), // Google, Instagram, Indicação, etc
  
  // Status do lead
  status: mysqlEnum("status", ["new", "contacted", "converted", "lost"]).default("new").notNull(),
  
  // Metadados
  contactedAt: timestamp("contactedAt"),
  convertedAt: timestamp("convertedAt"),
  notes: text("notes"), // Notas do atendimento
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PreEnrollment = typeof preEnrollments.$inferSelect;
export type InsertPreEnrollment = typeof preEnrollments.$inferInsert;
