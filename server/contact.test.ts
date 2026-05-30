import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the notifyOwner function
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

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

describe("Contact Form", () => {
  it("sends contact message successfully with all fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.send({
      name: "João Silva",
      email: "joao@example.com",
      phone: "(94) 99999-9999",
      subject: "Dúvida sobre cursos",
      message: "Gostaria de saber mais sobre o curso de enfermagem.",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Mensagem enviada com sucesso!");
  });

  it("sends contact message successfully without phone", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.send({
      name: "Maria Santos",
      email: "maria@example.com",
      subject: "Informações sobre matrícula",
      message: "Quero me matricular no curso técnico de administração.",
    });

    expect(result.success).toBe(true);
  });

  it("rejects message with invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.send({
        name: "Test User",
        email: "invalid-email",
        subject: "Test Subject",
        message: "Test message content here.",
      })
    ).rejects.toThrow();
  });

  it("rejects message with short name", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.send({
        name: "A",
        email: "test@example.com",
        subject: "Test Subject",
        message: "Test message content here.",
      })
    ).rejects.toThrow();
  });

  it("rejects message with short subject", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.send({
        name: "Test User",
        email: "test@example.com",
        subject: "AB",
        message: "Test message content here.",
      })
    ).rejects.toThrow();
  });

  it("rejects message with short message content", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.send({
        name: "Test User",
        email: "test@example.com",
        subject: "Test Subject",
        message: "Short",
      })
    ).rejects.toThrow();
  });
});
