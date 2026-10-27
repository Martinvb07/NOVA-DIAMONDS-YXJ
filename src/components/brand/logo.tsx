import Image from "next/image";
import { cn } from "@/lib/utils";

/** Isotipo: las letras YXJ en azul neón (public/brand/nova-yxj.png, fondo transparente). */
export function LogoMark({ className }: { className?: string }) {
  return <Image src="/brand/nova-yxj.png" alt="" width={512} height={414} aria-hidden className={cn("h-8 w-auto object-contain", className)} />;
}

/** Logo completo: YXJ + NOVA DIAMONDS cromado. Si en Ajustes hay un logotipo propio (logoUrl), se usa ese. */
export function Logo({ name, logoUrl, className }: { name: string; logoUrl?: string; className?: string }) {
  if (logoUrl) {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <Image src={logoUrl} alt={name} width={140} height={32} className="h-8 w-auto" priority unoptimized={/\.svg($|\?)/i.test(logoUrl)} />
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image src="/brand/nova-diamonds.png" alt={name} width={1400} height={351} priority className="h-9 w-auto drop-shadow-[0_0_14px_rgb(41_168_255/0.25)] sm:h-11" />
    </span>
  );
}
