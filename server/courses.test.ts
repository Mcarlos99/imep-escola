import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@imepedu.com.br",
    name: "Admin IMEP",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Public Routes", () => {
  it("allows public access to courses list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Should not throw - public route
    const result = await caller.courses.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows public access to featured courses", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.courses.featured();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows public access to categories list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.categories.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows public access to testimonials list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.testimonials.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Admin Routes - Access Control", () => {
  it("denies admin courses list to unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.courses.list()).rejects.toThrow();
  });

  it("denies admin courses list to regular users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.courses.list()).rejects.toThrow();
  });

  it("allows admin courses list to admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.courses.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin categories list to admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.categories.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin testimonials list to admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.testimonials.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin settings list to admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.settings.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Auth Routes", () => {
  it("returns null for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user data for authenticated user", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Admin IMEP");
    expect(result?.role).toBe("admin");
  });
});
