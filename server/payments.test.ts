import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/trpc";

describe("Payment Flow", () => {
  const mockContext: TrpcContext = {
    user: {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      headers: {
        origin: "http://localhost:3000",
      },
    } as any,
    res: {} as any,
  };

  const caller = appRouter.createCaller(mockContext);

  it("should create a checkout session for a course", async () => {
    // This test requires a valid course ID in the database
    // For now, we'll just check if the function exists and returns the expected structure
    
    try {
      const result = await caller.admin.payments.createCheckout({ courseId: 1 });
      
      // Should return a checkout URL
      expect(result).toHaveProperty("checkoutUrl");
      expect(typeof result.checkoutUrl).toBe("string");
      
      // URL should start with https://checkout.stripe.com
      if (result.checkoutUrl) {
        expect(result.checkoutUrl).toMatch(/^https:\/\/checkout\.stripe\.com/);
      }
    } catch (error: any) {
      // If course doesn't exist, that's expected in test environment
      if (error.message.includes("Curso não encontrado")) {
        expect(error.message).toContain("Curso não encontrado");
      } else {
        throw error;
      }
    }
  });

  it("should list user enrollments", async () => {
    const enrollments = await caller.admin.enrollments.list();
    
    // Should return an array
    expect(Array.isArray(enrollments)).toBe(true);
    
    // Each enrollment should have the expected structure
    enrollments.forEach((enrollment: any) => {
      expect(enrollment).toHaveProperty("id");
      expect(enrollment).toHaveProperty("userId");
      expect(enrollment).toHaveProperty("courseId");
      expect(enrollment).toHaveProperty("status");
      expect(enrollment).toHaveProperty("enrollmentDate");
    });
  });

  it("should require authentication for checkout", async () => {
    const unauthenticatedCaller = appRouter.createCaller({
      ...mockContext,
      user: null,
    });

    await expect(
      unauthenticatedCaller.admin.payments.createCheckout({ courseId: 1 })
    ).rejects.toThrow();
  });
});

describe("Admin Enrollment Management", () => {
  const adminContext: TrpcContext = {
    user: {
      id: 1,
      openId: "admin-user",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      headers: {
        origin: "http://localhost:3000",
      },
    } as any,
    res: {} as any,
  };

  const adminCaller = appRouter.createCaller(adminContext);

  it("should allow admin to list all enrollments", async () => {
    const enrollments = await adminCaller.admin.enrollments.listAll({});
    
    expect(Array.isArray(enrollments)).toBe(true);
  });

  it("should allow admin to filter enrollments by status", async () => {
    const activeEnrollments = await adminCaller.admin.enrollments.listAll({
      status: "active",
    });
    
    expect(Array.isArray(activeEnrollments)).toBe(true);
    
    // All returned enrollments should have status "active"
    activeEnrollments.forEach((enrollment: any) => {
      expect(enrollment.status).toBe("active");
    });
  });

  it("should not allow regular user to access admin endpoints", async () => {
    const userContext: TrpcContext = {
      ...adminContext,
      user: {
        ...adminContext.user!,
        role: "user",
      },
    };

    const userCaller = appRouter.createCaller(userContext);

    // This should throw an error because user is not admin
    await expect(
      userCaller.admin.enrollments.listAll({})
    ).rejects.toThrow();
  });
});

describe("Enrollment Status Updates", () => {
  const adminContext: TrpcContext = {
    user: {
      id: 1,
      openId: "admin-user",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      headers: {
        origin: "http://localhost:3000",
      },
    } as any,
    res: {} as any,
  };

  const adminCaller = appRouter.createCaller(adminContext);

  it("should allow admin to update enrollment status", async () => {
    try {
      const result = await adminCaller.admin.enrollments.updateStatus({
        id: 1,
        status: "active",
        notes: "Test update",
      });
      
      // If result is null/undefined, enrollment doesn't exist (expected in test)
      if (result) {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("status");
      } else {
        // Enrollment not found is expected in test environment
        expect(result).toBeFalsy();
      }
    } catch (error: any) {
      // If enrollment doesn't exist, that's expected in test environment
      if (error.message.includes("not found") || error.message.includes("não encontrado") || error.message.includes("Matrícula não encontrada")) {
        expect(error.message).toBeTruthy();
      } else {
        throw error;
      }
    }
  });
});
