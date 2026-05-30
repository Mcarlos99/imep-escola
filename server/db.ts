import { eq, desc, asc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  categories, InsertCategory, Category,
  courses, InsertCourse, Course,
  siteSettings, InsertSiteSetting, SiteSetting,
  testimonials, InsertTestimonial, Testimonial,
  favorites, InsertFavorite, Favorite,
  enrollments, InsertEnrollment, Enrollment,
  payments, InsertPayment, Payment,
  preEnrollments, InsertPreEnrollment, PreEnrollment,
  curriculum, InsertCurriculum, Curriculum
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER QUERIES ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== CATEGORY QUERIES ====================

export async function getAllCategories(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];

  if (activeOnly) {
    return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name));
  }
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(categories).values(data);
  return result[0].insertId;
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(categories).where(eq(categories.id, id));
}

// ==================== COURSE QUERIES ====================

export async function getAllCourses(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];

  if (activeOnly) {
    return db.select().from(courses).where(eq(courses.isActive, true)).orderBy(asc(courses.order), desc(courses.createdAt));
  }
  return db.select().from(courses).orderBy(asc(courses.order), desc(courses.createdAt));
}

export async function getFeaturedCourses() {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select({
    id: courses.id,
    title: courses.title,
    slug: courses.slug,
    description: courses.description,
    shortDescription: courses.shortDescription,
    categoryId: courses.categoryId,
    duration: courses.duration,
    modality: courses.modality,
    price: courses.price,
    originalPrice: courses.originalPrice,
    image: courses.image,
    videoUrl: courses.videoUrl,
    isActive: courses.isActive,
    isFeatured: courses.isFeatured,
    order: courses.order,
    createdAt: courses.createdAt,
    updatedAt: courses.updatedAt,
    categoryName: categories.name,
  })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .where(and(eq(courses.isActive, true), eq(courses.isFeatured, true)))
    .orderBy(asc(courses.order))
    .limit(8);

  return result;
}

export async function getCoursesByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(courses)
    .where(and(eq(courses.categoryId, categoryId), eq(courses.isActive, true)))
    .orderBy(asc(courses.order));
}

export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCourseBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createCourse(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Converter price e originalPrice para decimal (aceita vírgula ou ponto)
  const courseData: InsertCourse = {
    ...data,
    price: data.price ? data.price.toString().replace(',', '.') : null,
    originalPrice: data.originalPrice ? data.originalPrice.toString().replace(',', '.') : null,
  };

  const result = await db.insert(courses).values(courseData);
  return result[0].insertId;
}

export async function updateCourse(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  console.log("[updateCourse] Received data:", JSON.stringify(data, null, 2));

  // Remover campos undefined, null e strings vazias
  const updateData: any = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    // Incluir apenas valores válidos (não undefined, não null, não string vazia)
    // Mas permitir booleanos false e números 0
    if (value !== undefined && value !== null && value !== "") {
      updateData[key] = value;
    }
  });

  console.log("[updateCourse] Clean data:", JSON.stringify(updateData, null, 2));

  // Converter price e originalPrice para decimal (aceita vírgula ou ponto)
  if (updateData.price !== undefined) {
    updateData.price = updateData.price ? updateData.price.toString().replace(',', '.') : null;
  }
  if (updateData.originalPrice !== undefined) {
    updateData.originalPrice = updateData.originalPrice ? updateData.originalPrice.toString().replace(',', '.') : null;
  }

  // Adicionar updatedAt
  updateData.updatedAt = new Date();

  console.log("[updateCourse] Final data to update:", JSON.stringify(updateData, null, 2));

  await db.update(courses).set(updateData).where(eq(courses.id, id));
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(courses).where(eq(courses.id, id));
}

// ==================== SITE SETTINGS QUERIES ====================

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(siteSettings).orderBy(asc(siteSettings.group), asc(siteSettings.key));
}

export async function getSettingByKey(key: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertSetting(data: InsertSiteSetting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(siteSettings).values(data).onDuplicateKeyUpdate({
    set: { value: data.value, label: data.label, description: data.description, type: data.type, group: data.group }
  });
}

// ==================== TESTIMONIAL QUERIES ====================

export async function getAllTestimonials(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];

  if (activeOnly) {
    return db.select().from(testimonials).where(eq(testimonials.isActive, true)).orderBy(asc(testimonials.order));
  }
  return db.select().from(testimonials).orderBy(asc(testimonials.order));
}

export async function createTestimonial(data: InsertTestimonial) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(testimonials).values(data);
  return result[0].insertId;
}

export async function updateTestimonial(id: number, data: Partial<InsertTestimonial>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(testimonials).set(data).where(eq(testimonials.id, id));
}

export async function deleteTestimonial(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(testimonials).where(eq(testimonials.id, id));
}

// ==================== FAVORITES QUERIES ====================

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Buscar favoritos com informações dos cursos
  const result = await db
    .select({
      id: favorites.id,
      userId: favorites.userId,
      courseId: favorites.courseId,
      createdAt: favorites.createdAt,
      course: courses,
    })
    .from(favorites)
    .leftJoin(courses, eq(favorites.courseId, courses.id))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));

  return result;
}

export async function isFavorite(userId: number, courseId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.courseId, courseId)))
    .limit(1);

  return result.length > 0;
}

export async function addFavorite(userId: number, courseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se já existe
  const exists = await isFavorite(userId, courseId);
  if (exists) {
    return; // Já está favoritado
  }

  await db.insert(favorites).values({ userId, courseId });
}

export async function removeFavorite(userId: number, courseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.courseId, courseId)));
}

export async function toggleFavorite(userId: number, courseId: number): Promise<boolean> {
  const exists = await isFavorite(userId, courseId);
  
  if (exists) {
    await removeFavorite(userId, courseId);
    return false; // Removido
  } else {
    await addFavorite(userId, courseId);
    return true; // Adicionado
  }
}

// ==================== ENROLLMENT QUERIES ====================

export async function createEnrollment(data: {
  userId: number;
  courseId: number;
  stripeCustomerId?: string;
  stripePaymentIntentId?: string;
  stripeCheckoutSessionId?: string;
  status: "pending" | "active" | "completed" | "cancelled";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [enrollment] = await db.insert(enrollments).values(data).$returningId();
  
  // Return the created enrollment
  return await getEnrollmentById(enrollment.id);
}

export async function getEnrollmentById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      id: enrollments.id,
      userId: enrollments.userId,
      courseId: enrollments.courseId,
      stripeCustomerId: enrollments.stripeCustomerId,
      stripePaymentIntentId: enrollments.stripePaymentIntentId,
      stripeCheckoutSessionId: enrollments.stripeCheckoutSessionId,
      status: enrollments.status,
      enrollmentDate: enrollments.enrollmentDate,
      completionDate: enrollments.completionDate,
      certificateIssued: enrollments.certificateIssued,
      certificateUrl: enrollments.certificateUrl,
      notes: enrollments.notes,
      createdAt: enrollments.createdAt,
      updatedAt: enrollments.updatedAt,
      // Join course data
      courseName: courses.title,
      courseSlug: courses.slug,
      courseImage: courses.image,
      coursePrice: courses.price,
      // Join user data
      userName: users.name,
      userEmail: users.email,
    })
    .from(enrollments)
    .leftJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(users, eq(enrollments.userId, users.id))
    .where(eq(enrollments.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getEnrollmentByCheckoutSession(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.stripeCheckoutSessionId, sessionId))
    .limit(1);

  return result[0] || null;
}

export async function getUserEnrollments(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select({
      id: enrollments.id,
      userId: enrollments.userId,
      courseId: enrollments.courseId,
      status: enrollments.status,
      enrollmentDate: enrollments.enrollmentDate,
      completionDate: enrollments.completionDate,
      certificateIssued: enrollments.certificateIssued,
      certificateUrl: enrollments.certificateUrl,
      // Course data
      courseName: courses.title,
      courseSlug: courses.slug,
      courseImage: courses.image,
      coursePrice: courses.price,
      courseDuration: courses.duration,
      courseModality: courses.modality,
    })
    .from(enrollments)
    .leftJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.createdAt));
}

export async function getAllEnrollments(filters?: {
  status?: "pending" | "active" | "completed" | "cancelled";
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db
    .select({
      id: enrollments.id,
      userId: enrollments.userId,
      courseId: enrollments.courseId,
      status: enrollments.status,
      enrollmentDate: enrollments.enrollmentDate,
      completionDate: enrollments.completionDate,
      certificateIssued: enrollments.certificateIssued,
      notes: enrollments.notes,
      createdAt: enrollments.createdAt,
      // Course data
      courseName: courses.title,
      courseSlug: courses.slug,
      courseImage: courses.image,
      coursePrice: courses.price,
      // User data
      userName: users.name,
      userEmail: users.email,
    })
    .from(enrollments)
    .leftJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(users, eq(enrollments.userId, users.id))
    .orderBy(desc(enrollments.createdAt));

  if (filters?.status) {
    query = query.where(eq(enrollments.status, filters.status)) as any;
  }

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }

  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
}

export async function updateEnrollmentStatus(
  id: number,
  status: "pending" | "active" | "completed" | "cancelled",
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { status };
  
  if (notes !== undefined) {
    updateData.notes = notes;
  }
  
  if (status === "completed") {
    updateData.completionDate = new Date();
  }

  await db.update(enrollments).set(updateData).where(eq(enrollments.id, id));

  return await getEnrollmentById(id);
}

export async function issueCertificate(id: number, certificateUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(enrollments)
    .set({
      certificateIssued: true,
      certificateUrl,
      status: "completed",
      completionDate: new Date(),
    })
    .where(eq(enrollments.id, id));

  return await getEnrollmentById(id);
}

// ==================== PAYMENT QUERIES ====================

export async function createPayment(data: {
  enrollmentId: number;
  userId: number;
  stripePaymentIntentId: string;
  stripeChargeId?: string;
  amount: string;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  paymentMethod?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const paymentData: any = {
    ...data,
    paidAt: data.status === "succeeded" ? new Date() : null,
  };

  const [payment] = await db.insert(payments).values(paymentData).$returningId();
  
  return payment;
}

export async function getPaymentsByEnrollment(enrollmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(payments)
    .where(eq(payments.enrollmentId, enrollmentId))
    .orderBy(desc(payments.createdAt));
}

export async function getPaymentsByUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt));
}

export async function updatePaymentStatus(
  paymentIntentId: string,
  status: "pending" | "succeeded" | "failed" | "refunded"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { status };
  
  if (status === "succeeded") {
    updateData.paidAt = new Date();
  } else if (status === "refunded") {
    updateData.refundedAt = new Date();
  }

  await db
    .update(payments)
    .set(updateData)
    .where(eq(payments.stripePaymentIntentId, paymentIntentId));
}

// ==================== PRE-ENROLLMENT QUERIES ====================

export async function createPreEnrollment(data: InsertPreEnrollment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(preEnrollments).values(data);
  return result[0].insertId;
}

export async function getAllPreEnrollments() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select({
      preEnrollment: preEnrollments,
      course: courses,
    })
    .from(preEnrollments)
    .leftJoin(courses, eq(preEnrollments.courseId, courses.id))
    .orderBy(desc(preEnrollments.createdAt));
}

export async function getPreEnrollmentById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      preEnrollment: preEnrollments,
      course: courses,
    })
    .from(preEnrollments)
    .leftJoin(courses, eq(preEnrollments.courseId, courses.id))
    .where(eq(preEnrollments.id, id))
    .limit(1);

  return result[0] || null;
}

export async function updatePreEnrollmentStatus(
  id: number,
  status: "new" | "contacted" | "converted" | "lost",
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { status };
  
  if (status === "contacted") {
    updateData.contactedAt = new Date();
  } else if (status === "converted") {
    updateData.convertedAt = new Date();
  }
  
  if (notes) {
    updateData.notes = notes;
  }

  await db
    .update(preEnrollments)
    .set(updateData)
    .where(eq(preEnrollments.id, id));
}

export async function deletePreEnrollment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(preEnrollments).where(eq(preEnrollments.id, id));
}

// ==================== CURRICULUM QUERIES ====================

export async function getCurriculumByCourse(courseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(curriculum)
    .where(eq(curriculum.courseId, courseId))
    .orderBy(curriculum.order);
}

export async function createCurriculumItem(data: InsertCurriculum) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(curriculum).values(data);
  return result[0].insertId;
}

export async function updateCurriculumItem(id: number, data: Partial<InsertCurriculum>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(curriculum)
    .set(data)
    .where(eq(curriculum.id, id));
}

export async function deleteCurriculumItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(curriculum).where(eq(curriculum.id, id));
}
