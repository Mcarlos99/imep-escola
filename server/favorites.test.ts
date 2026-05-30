import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("favorites", () => {
  it("should toggle favorite status", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // Adicionar favorito
    const addResult = await caller.admin.favorites.toggle({ courseId: 1 });
    expect(addResult.success).toBe(true);
    expect(addResult.isFavorited).toBe(true);

    // Remover favorito
    const removeResult = await caller.admin.favorites.toggle({ courseId: 1 });
    expect(removeResult.success).toBe(true);
    expect(removeResult.isFavorited).toBe(false);
  });

  it("should check if course is favorited", async () => {
    const { ctx } = createAuthContext(2);
    const caller = appRouter.createCaller(ctx);

    // Verificar antes de adicionar
    const checkBefore = await caller.admin.favorites.check({ courseId: 2 });
    expect(checkBefore.isFavorited).toBe(false);

    // Adicionar favorito
    await caller.admin.favorites.toggle({ courseId: 2 });

    // Verificar depois de adicionar
    const checkAfter = await caller.admin.favorites.check({ courseId: 2 });
    expect(checkAfter.isFavorited).toBe(true);

    // Limpar
    await caller.admin.favorites.toggle({ courseId: 2 });
  });

  it("should list user favorites", async () => {
    const { ctx } = createAuthContext(3);
    const caller = appRouter.createCaller(ctx);

    // Adicionar alguns favoritos
    await caller.admin.favorites.toggle({ courseId: 1 });
    await caller.admin.favorites.toggle({ courseId: 2 });

    // Listar favoritos
    const favorites = await caller.admin.favorites.list();
    expect(favorites.length).toBeGreaterThanOrEqual(2);

    // Limpar
    await caller.admin.favorites.toggle({ courseId: 1 });
    await caller.admin.favorites.toggle({ courseId: 2 });
  });
});
