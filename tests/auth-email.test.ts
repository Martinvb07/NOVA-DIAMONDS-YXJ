import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const T = await import("@/server/email-templates");
const { safeNext } = await import("@/lib/safe-next");


describe("Redirecciones seguras", () => {
  it("solo permite rutas internas", () => {
    expect(safeNext("/cuenta", "/")).toBe("/cuenta");
    expect(safeNext("//evil.example", "/")).toBe("/");
    expect(safeNext("/\\evil.example", "/")).toBe("/");
    expect(safeNext("https://evil.example", "/")).toBe("/");
  });
});

describe("Plantillas de correo", () => {
  const brand = { storeName: "NOVA DIAMONDS", appUrl: "https://tienda.example", supportEmail: "soporte@tienda.example" };
  it("escapan el contenido variable (sin HTML inyectado)", () => {
    const e = T.orderEmail(brand, "payment_confirmed", { number: "VX-1", type: "TOPUP", item: '<img src=x onerror="alert(1)">', total: "$ 1", link: "https://tienda.example/pedido/VX-1?t=a&b=c", isTest: false });
    expect(e.html).not.toContain("<img src=x");
    expect(e.html).toContain("&lt;img src=x");
    expect(e.html).toContain("t=a&amp;b=c");
  });
  it("incluyen versión de texto y el código visible", () => {
    const e = T.codeEmail(brand, { code: "123456", purpose: "LOGIN", minutes: 10 });
    expect(e.subject).toContain("123456");
    expect(e.text).toContain("123456");
    expect(e.html).toContain("123456");
  });
  it("el aviso de chat nunca incluye el contenido del mensaje", () => {
    const e = T.chatMessageEmail(brand, { number: "VX-1", link: "https://tienda.example/pedido/VX-1?t=x" });
    expect(e.html).toContain("#chat");
    expect(e.text).not.toMatch(/contraseña:/i);
  });
});
