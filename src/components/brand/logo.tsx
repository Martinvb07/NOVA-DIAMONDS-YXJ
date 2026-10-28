import Image from "next/image";
import { cn } from "@/lib/utils";

/** Isotipo: las letras YXJ en azul neón (public/brand/nova-yxj.png, fondo transparente). */
export function LogoMark({ className }: { className?: string }) {
  return <Image src="/brand/nova-yxj.png" alt="" width={512} height={414} aria-hidden className={cn("h-8 w-auto object-contain", className)} />;
}

/**
 * Logo completo: isotipo YXJ + "NOVA DIAMONDS" en letra cromada (Orbitron, como el logo original).
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
    <span className={cn("group/logo inline-flex items-center gap-2.5", className)}>
      <Image
        src="/brand/nova-yxj.png"
        alt=""
        aria-hidden
        width={512}
        height={414}
        priority
        className="h-8 w-auto sm:h-9"
      />
      <span className="flex flex-col justify-center leading-none">
        <span className="whitespace-nowrap font-brand text-[15px] font-bold uppercase tracking-[0.04em] text-fg sm:text-[16px]">Nova Diamonds</span>
        <span className="mt-1 whitespace-nowrap text-[11px] font-medium text-fg-subtle">Free Fire · YXJ</span>
      </span>
      <span className="sr-only">{name}</span>
    </span>
  );
}
