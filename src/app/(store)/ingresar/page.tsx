import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert, Container } from "@/components/ui/primitives";
import { getCurrentUser } from "@/lib/auth";
import { LoginPanel } from "./login-panel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ingresar", robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  deshabilitada: "Esta cuenta está deshabilitada. Escríbenos desde el Centro de ayuda.",
  demasiados: "Demasiados intentos. Espera unos minutos.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; restablecida?: string; error?: string; eliminada?: string }> }) {
  const { next, restablecida, error, eliminada } = await searchParams;
  if (await getCurrentUser()) redirect("/cuenta");
  return (
    <Container className="grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-[420px]">
        <h1 className="font-display text-3xl font-semibold">Ingresar</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Ve tus compras y entregas en un solo lugar. ¿Solo quieres comprar? No necesitas cuenta:{" "}
          <Link href="/recargas" className="text-nova-300 underline underline-offset-4">
            compra como invitado
          </Link>
          .
        </p>
        {eliminada && (
          <Alert tone="success" className="mt-6">
            Tu cuenta fue eliminada. Gracias por haber comprado con nosotros.
          </Alert>
        )}
        {restablecida && (
          <Alert tone="success" className="mt-6">
            Contraseña actualizada. Ingresa con la nueva.
          </Alert>
        )}
        {error && ERRORS[error] && (
          <Alert tone="warning" className="mt-6">
            {ERRORS[error]}
          </Alert>
        )}
        <div className="surface mt-6 p-6">
          <LoginPanel next={next} />
          <p className="mt-4 text-center text-[13px]">
            <Link href="/recuperar" className="text-fg-muted underline-offset-4 hover:text-fg hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </div>
        <p className="mt-5 text-center text-sm text-fg-muted">
          ¿No tienes cuenta?{" "}
          <Link href={`/registro${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-fg underline underline-offset-4">
            Crear una
          </Link>
        </p>
      </div>
    </Container>
  );
}
