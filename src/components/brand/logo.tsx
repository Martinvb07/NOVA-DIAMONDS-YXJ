import Image from "next/image";
import { cn } from "@/lib/utils";

/** Isotipo: las letras YXJ en azul neón (public/brand/nova-yxj.png, fondo transparente). */
export function LogoMark({ className }: { className?: string }) {
  return <Image src="/brand/nova-yxj.png" alt="" width={512} height={414} aria-hidden className={cn("h-8 w-auto object-contain", className)} />;
}

/**
 * Logo completo (misma estructura del logo de VANTA): isotipo YXJ con brillo suave + "NOVA DIAMONDS" en Orbitron.
 * Texto real en vez de imagen para que se lea nítido a cualquier tamaño. Con logotipo propio en Ajustes (logoUrl) se usa ese.
 */
export function Logo({ name, logoUrl, className }: { name: string; logoUrl?: string; className?: string }) {
  if (logoUrl) {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <Image src={logoUrl} alt={name} width={140} height={32} className="h-8 w-auto" priority unoptimized={/\.svg($|\?)/i.test(logoUrl)} />
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className="h-9 drop-shadow-[0_0_10px_rgb(41_168_255/0.3)] sm:h-10" />
      <span className="whitespace-nowrap font-brand text-[16px] font-black uppercase tracking-[0.04em] text-fg sm:text-[18px]">Nova Diamonds</span>
      <span className="sr-only">{name}</span>
    </span>
  );
}
