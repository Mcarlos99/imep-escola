import { COOKIE_NAME } from "@shared/const";
import { notifyOwner } from "./_core/notification";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// ==================== VALIDATION SCHEMAS ====================

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
});

const courseSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  categoryId: z.number(),
  duration: z.string().max(50).optional(),
  modality: z.enum(["presencial", "ead", "hibrido"]).optional(),
  price: z.string().optional(),
  originalPrice: z.string().optional(),
  image: z.string().max(500).optional(),
  videoUrl: z.string().max(500).optional(), // URL do vídeo (YouTube, Vimeo, etc.)
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  order: z.number().optional(),
});

const testimonialSchema = z.object({
  name: z.string().min(1).max(100),
  course: z.string().max(200).optional(),
  content: z.string().min(1),
  image: z.string().max(500).optional(),
  rating: z.number().min(1).max(5).optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
});

const settingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().optional(),
  type: z.enum(["text", "number", "boolean", "json", "html"]).optional(),
  label: z.string().max(200).optional(),
  description: z.string().optional(),
  group: z.string().max(50).optional(),
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== PUBLIC ROUTES ====================
  
  categories: router({
    list: publicProcedure.query(async () => {
      return db.getAllCategories(true);
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCategoryById(input.id);
      }),
  }),

  courses: router({
    list: publicProcedure.query(async () => {
      return db.getAllCourses(true);
    }),
    featured: publicProcedure.query(async () => {
      return db.getFeaturedCourses();
    }),
    byCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return db.getCoursesByCategory(input.categoryId);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCourseById(input.id);
      }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getCourseBySlug(input.slug);
      }),
  }),

  testimonials: router({
    list: publicProcedure.query(async () => {
      return db.getAllTestimonials(true);
    }),
  }),

  settings: router({
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return db.getSettingByKey(input.key);
      }),
  }),

  curriculum: router({
    getByCourse: publicProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ input }) => {
        return db.getCurriculumByCourse(input.courseId);
      }),
  }),

  // Contact Form
  contact: router({
    send: publicProcedure
      .input(z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: z.string().email("E-mail inválido"),
        phone: z.string().optional(),
        subject: z.string().min(3, "Assunto deve ter pelo menos 3 caracteres"),
        message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
      }))
      .mutation(async ({ input }) => {
        const { name, email, phone, subject, message } = input;
        
        const title = `[IMEP Contato] ${subject}`;
        const content = `
**Nova mensagem de contato recebida**

**Nome:** ${name}
**E-mail:** ${email}
**Telefone:** ${phone || "Não informado"}
**Assunto:** ${subject}

**Mensagem:**
${message}

---
_Enviado pelo formulário de contato do site IMEP_
        `.trim();
        
        const sent = await notifyOwner({ title, content });
        
        if (!sent) {
          console.warn("[Contact] Failed to send notification, but returning success to user");
        }
        
        return { success: true, message: "Mensagem enviada com sucesso!" };
      }),
  }),

  // ==================== ADMIN ROUTES ====================
  
  admin: router({
    // Categories Management
    categories: router({
      list: adminProcedure.query(async () => {
        return db.getAllCategories(false);
      }),
      create: adminProcedure
        .input(categorySchema)
        .mutation(async ({ input }) => {
          const id = await db.createCategory(input);
          return { id, success: true };
        }),
      update: adminProcedure
        .input(z.object({ id: z.number(), data: categorySchema.partial() }))
        .mutation(async ({ input }) => {
          await db.updateCategory(input.id, input.data);
          return { success: true };
        }),
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteCategory(input.id);
          return { success: true };
        }),
    }),

    // Courses Management
    courses: router({
      list: adminProcedure.query(async () => {
        return db.getAllCourses(false);
      }),
      create: adminProcedure
        .input(courseSchema)
        .mutation(async ({ input }) => {
          const id = await db.createCourse(input);
          return { id, success: true };
        }),
      update: adminProcedure
        .input(z.object({ id: z.number(), data: courseSchema.partial() }))
        .mutation(async ({ input }) => {
          await db.updateCourse(input.id, input.data);
          return { success: true };
        }),
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteCourse(input.id);
          return { success: true };
        }),
    }),

    // Testimonials Management
    testimonials: router({
      list: adminProcedure.query(async () => {
        return db.getAllTestimonials(false);
      }),
      create: adminProcedure
        .input(testimonialSchema)
        .mutation(async ({ input }) => {
          const id = await db.createTestimonial(input);
          return { id, success: true };
        }),
      update: adminProcedure
        .input(z.object({ id: z.number(), data: testimonialSchema.partial() }))
        .mutation(async ({ input }) => {
          await db.updateTestimonial(input.id, input.data);
          return { success: true };
        }),
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteTestimonial(input.id);
          return { success: true };
        }),
    }),

    // Site Settings Management
    settings: router({
      list: adminProcedure.query(async () => {
        return db.getAllSettings();
      }),
      upsert: adminProcedure
        .input(settingSchema)
        .mutation(async ({ input }) => {
          await db.upsertSetting(input);
          return { success: true };
        }),
    }),

    // Favorites Management
    favorites: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return db.getUserFavorites(ctx.user.id);
      }),
      toggle: protectedProcedure
        .input(z.object({ courseId: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const isFavorited = await db.toggleFavorite(ctx.user.id, input.courseId);
          return { success: true, isFavorited };
        }),
      check: protectedProcedure
        .input(z.object({ courseId: z.number() }))
        .query(async ({ ctx, input }) => {
          const isFavorited = await db.isFavorite(ctx.user.id, input.courseId);
          return { isFavorited };
        }),
    }),

    // Image Upload
    upload: router({
      image: adminProcedure
        .input(z.object({
          base64: z.string(),
          fileName: z.string(),
          mimeType: z.string(),
          folder: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const { base64, fileName, mimeType, folder = "images" } = input;
          
          // Decode base64 to buffer
          const buffer = Buffer.from(base64, "base64");
          
          // Generate unique filename
          const ext = fileName.split(".").pop() || "jpg";
          const uniqueFileName = `${folder}/${nanoid()}-${Date.now()}.${ext}`;
          
          // Upload to S3
          const { url } = await storagePut(uniqueFileName, buffer, mimeType);
          
          return { success: true, url, key: uniqueFileName };
        }),
    }),

    // Payments & Enrollments
    payments: router({
      createCheckout: protectedProcedure
        .input(z.object({ courseId: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);
          
          // Get course details
          const course = await db.getCourseById(input.courseId);
          if (!course) {
            throw new Error("Curso não encontrado");
          }
          
          if (!course.price) {
            throw new Error("Curso sem preço definido");
          }
          
          // Convert price to cents
          const priceInCents = Math.round(parseFloat(course.price) * 100);
          
          // Create checkout session
          const origin = ctx.req.headers.origin || "http://localhost:3000";
          
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card", "boleto"],
            payment_method_options: {
              boleto: {
                expires_after_days: 3,
              },
            },
            line_items: [
              {
                price_data: {
                  currency: "brl",
                  product_data: {
                    name: course.title,
                    description: course.shortDescription || course.description || "",
                    images: course.image ? [course.image] : [],
                  },
                  unit_amount: priceInCents,
                },
                quantity: 1,
              },
            ],
            mode: "payment",
            success_url: `${origin}/matricula/sucesso?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/cursos/${course.slug}?checkout=cancelled`,
            customer_email: ctx.user.email || undefined,
            client_reference_id: ctx.user.id.toString(),
            metadata: {
              userId: ctx.user.id.toString(),
              courseId: input.courseId.toString(),
              courseName: course.title,
              customerEmail: ctx.user.email || "",
              customerName: ctx.user.name || "",
            },
            allow_promotion_codes: true,
          });
          
          return { checkoutUrl: session.url };
        }),
      
      verifySession: protectedProcedure
        .input(z.object({ sessionId: z.string() }))
        .query(async ({ ctx, input }) => {
          const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);
          
          const session = await stripe.checkout.sessions.retrieve(input.sessionId);
          
          if (session.payment_status === "paid") {
            // Check if enrollment already exists
            const existingEnrollment = await db.getEnrollmentByCheckoutSession(input.sessionId);
            
            if (existingEnrollment) {
              return { success: true, enrollment: existingEnrollment };
            }
            
            // Create enrollment
            const courseId = parseInt(session.metadata?.courseId || "0");
            const enrollment = await db.createEnrollment({
              userId: ctx.user.id,
              courseId,
              stripeCustomerId: session.customer as string,
              stripePaymentIntentId: session.payment_intent as string,
              stripeCheckoutSessionId: input.sessionId,
              status: "active",
            });
            
            // Create payment record
            await db.createPayment({
              enrollmentId: enrollment.id,
              userId: ctx.user.id,
              stripePaymentIntentId: session.payment_intent as string,
              amount: (session.amount_total! / 100).toString(),
              currency: "brl",
              status: "succeeded",
              paymentMethod: session.payment_method_types?.[0] || "card",
            });
            
            return { success: true, enrollment };
          }
          
          return { success: false, status: session.payment_status };
        }),
      
      history: protectedProcedure.query(async ({ ctx }) => {
        return db.getPaymentsByUser(ctx.user.id);
      }),
      
      getReceipt: protectedProcedure
        .input(z.object({ paymentId: z.number() }))
        .query(async ({ ctx, input }) => {
          const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);
          
          // Get payment from database
          const payments = await db.getPaymentsByUser(ctx.user.id);
          const payment = payments.find((p: any) => p.id === input.paymentId);
          
          if (!payment) {
            throw new Error("Pagamento n\u00e3o encontrado");
          }
          
          // Get payment intent from Stripe for receipt details
          const paymentIntent = await stripe.paymentIntents.retrieve(
            payment.stripePaymentIntentId
          );
          
          // Get charge for receipt URL
          let receiptUrl = null;
          if (paymentIntent.latest_charge) {
            const charge = await stripe.charges.retrieve(
              paymentIntent.latest_charge as string
            );
            receiptUrl = charge.receipt_url;
          }
          
          return {
            payment,
            receiptUrl,
            paymentIntent: {
              id: paymentIntent.id,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              status: paymentIntent.status,
              created: paymentIntent.created,
            },
          };
        }),
    }),
    
    enrollments: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return db.getUserEnrollments(ctx.user.id);
      }),
      
      listAll: adminProcedure
        .input(z.object({
          status: z.enum(["pending", "active", "completed", "cancelled"]).optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        }))
        .query(async ({ input }) => {
          return db.getAllEnrollments(input);
        }),
      
      getById: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }) => {
          const enrollment = await db.getEnrollmentById(input.id);
          
          // Verify ownership (admin can see all, users only their own)
          if (enrollment && enrollment.userId !== ctx.user.id && ctx.user.role !== "admin") {
            throw new Error("Acesso negado");
          }
          
          return enrollment;
        }),
      
      updateStatus: adminProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(["pending", "active", "completed", "cancelled"]),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          return db.updateEnrollmentStatus(input.id, input.status, input.notes);
        }),
      
      issueCertificate: adminProcedure
        .input(z.object({
          id: z.number(),
          certificateUrl: z.string(),
        }))
        .mutation(async ({ input }) => {
          return db.issueCertificate(input.id, input.certificateUrl);
        }),
    }),
    
    preEnrollments: router({
      create: publicProcedure
        .input(z.object({
          fullName: z.string().min(1).max(255),
          email: z.string().email().max(320),
          phone: z.string().min(10).max(20),
          cpf: z.string().max(14).optional(),
          birthDate: z.string().optional(),
          courseId: z.number(),
          message: z.string().optional(),
          preferredShift: z.enum(["morning", "afternoon", "evening", "flexible"]).optional(),
          howDidYouHear: z.string().max(100).optional(),
        }))
        .mutation(async ({ input }) => {
          const id = await db.createPreEnrollment(input as any);
          
          // Buscar informações do curso
          const course = await db.getCourseById(input.courseId);
          
          // Enviar notificação para o proprietário
          await notifyOwner({
            title: "Nova Pré-Matrícula Recebida",
            content: `**Nome:** ${input.fullName}\n**E-mail:** ${input.email}\n**Telefone:** ${input.phone}\n**Curso:** ${course?.title || "N/A"}\n**Mensagem:** ${input.message || "Nenhuma mensagem"}`,
          });
          
          return { id, success: true };
        }),
      
      list: adminProcedure.query(async () => {
        return db.getAllPreEnrollments();
      }),
      
      getById: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return db.getPreEnrollmentById(input.id);
        }),
      
      updateStatus: adminProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(["new", "contacted", "converted", "lost"]),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          return db.updatePreEnrollmentStatus(input.id, input.status, input.notes);
        }),
      
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          return db.deletePreEnrollment(input.id);
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
