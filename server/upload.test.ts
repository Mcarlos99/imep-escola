import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    key: "courses/test-123.jpg",
    url: "https://storage.example.com/courses/test-123.jpg",
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("admin.upload.image", () => {
  it("allows admin to upload images", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create a small test image (1x1 pixel PNG in base64)
    const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const result = await caller.admin.upload.image({
      base64: base64Image,
      fileName: "test.png",
      mimeType: "image/png",
      folder: "courses",
    });

    expect(result.success).toBe(true);
    expect(result.url).toBeDefined();
    expect(result.key).toBeDefined();
  });

  it("denies non-admin users from uploading", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    await expect(
      caller.admin.upload.image({
        base64: base64Image,
        fileName: "test.png",
        mimeType: "image/png",
        folder: "courses",
      })
    ).rejects.toThrow();
  });
});

describe("admin.courses", () => {
  it("denies non-admin users from listing courses", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.courses.list()).rejects.toThrow();
  });
});
