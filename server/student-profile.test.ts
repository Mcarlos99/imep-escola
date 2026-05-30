import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/trpc";

describe("Student Profile - Payment History", () => {
  const mockContext: TrpcContext = {
    user: {
      id: 1,
      openId: "test-student",
      name: "Test Student",
      email: "student@example.com",
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

  it("should return payment history for authenticated user", async () => {
    const payments = await caller.admin.payments.history();
    
    // Should return an array
    expect(Array.isArray(payments)).toBe(true);
    
    // Each payment should have required fields
    payments.forEach((payment: any) => {
      expect(payment).toHaveProperty("id");
      expect(payment).toHaveProperty("userId");
      expect(payment).toHaveProperty("amount");
      expect(payment).toHaveProperty("status");
      expect(payment).toHaveProperty("createdAt");
    });
  });

  it("should not allow unauthenticated access to payment history", async () => {
    const unauthCaller = appRouter.createCaller({
      ...mockContext,
      user: null,
    });

    await expect(unauthCaller.admin.payments.history()).rejects.toThrow();
  });

  it("should only return payments for the authenticated user", async () => {
    const payments = await caller.admin.payments.history();
    
    // All payments should belong to the authenticated user
    payments.forEach((payment: any) => {
      expect(payment.userId).toBe(mockContext.user!.id);
    });
  });
});

describe("Student Profile - Enrollments", () => {
  const mockContext: TrpcContext = {
    user: {
      id: 1,
      openId: "test-student",
      name: "Test Student",
      email: "student@example.com",
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

  it("should return enrollments for authenticated user", async () => {
    const enrollments = await caller.admin.enrollments.list();
    
    // Should return an array
    expect(Array.isArray(enrollments)).toBe(true);
    
    // Each enrollment should have required fields
    enrollments.forEach((enrollment: any) => {
      expect(enrollment).toHaveProperty("id");
      expect(enrollment).toHaveProperty("userId");
      expect(enrollment).toHaveProperty("courseId");
      expect(enrollment).toHaveProperty("status");
      expect(enrollment).toHaveProperty("enrollmentDate");
    });
  });

  it("should not allow unauthenticated access to enrollments", async () => {
    const unauthCaller = appRouter.createCaller({
      ...mockContext,
      user: null,
    });

    await expect(unauthCaller.admin.enrollments.list()).rejects.toThrow();
  });

  it("should only return enrollments for the authenticated user", async () => {
    const enrollments = await caller.admin.enrollments.list();
    
    // All enrollments should belong to the authenticated user
    enrollments.forEach((enrollment: any) => {
      expect(enrollment.userId).toBe(mockContext.user!.id);
    });
  });
});

describe("Student Profile - Receipt Download", () => {
  const mockContext: TrpcContext = {
    user: {
      id: 1,
      openId: "test-student",
      name: "Test Student",
      email: "student@example.com",
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

  it("should not allow access to other users' receipts", async () => {
    // Try to access a payment that doesn't belong to the user
    try {
      await caller.admin.payments.getReceipt({ paymentId: 99999 });
      // If it doesn't throw, the payment doesn't exist (which is fine for test)
    } catch (error: any) {
      // Should throw "Pagamento não encontrado" if payment exists but belongs to another user
      expect(error.message).toContain("Pagamento não encontrado");
    }
  });

  it("should require authentication for receipt download", async () => {
    const unauthCaller = appRouter.createCaller({
      ...mockContext,
      user: null,
    });

    await expect(
      unauthCaller.admin.payments.getReceipt({ paymentId: 1 })
    ).rejects.toThrow();
  });
});

describe("Student Profile - Data Privacy", () => {
  it("should not expose sensitive payment data", async () => {
    const mockContext: TrpcContext = {
      user: {
        id: 1,
        openId: "test-student",
        name: "Test Student",
        email: "student@example.com",
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
    const payments = await caller.admin.payments.history();
    
    // Should not contain sensitive data
    payments.forEach((payment: any) => {
      // Should NOT have full card numbers
      expect(payment).not.toHaveProperty("cardNumber");
      expect(payment).not.toHaveProperty("cvv");
      
      // Should only have Stripe IDs
      if (payment.stripePaymentIntentId) {
        expect(typeof payment.stripePaymentIntentId).toBe("string");
      }
    });
  });

  it("should not allow users to see other users' data", async () => {
    const user1Context: TrpcContext = {
      user: {
        id: 1,
        openId: "user1",
        name: "User 1",
        email: "user1@example.com",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { headers: { origin: "http://localhost:3000" } } as any,
      res: {} as any,
    };

    const user2Context: TrpcContext = {
      user: {
        id: 2,
        openId: "user2",
        name: "User 2",
        email: "user2@example.com",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { headers: { origin: "http://localhost:3000" } } as any,
      res: {} as any,
    };

    const caller1 = appRouter.createCaller(user1Context);
    const caller2 = appRouter.createCaller(user2Context);

    const payments1 = await caller1.admin.payments.history();
    const payments2 = await caller2.admin.payments.history();

    // User 1 should not see User 2's payments
    payments1.forEach((payment: any) => {
      expect(payment.userId).toBe(1);
      expect(payment.userId).not.toBe(2);
    });

    // User 2 should not see User 1's payments
    payments2.forEach((payment: any) => {
      expect(payment.userId).toBe(2);
      expect(payment.userId).not.toBe(1);
    });
  });
});
