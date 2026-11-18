import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Encabezado de sección de la tienda: etiqueta corta en cian, título y descripción, y un enlace opcional a la
 * derecha. Todas las secciones del inicio usan el mismo, así la página se lee ordenada de arriba abajo.
 */
export function SectionHead({ eyebrow, title, sub, href, cta }: { eyebrow?: string; title: string; sub?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 sm:mb-6">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-nova-300">
            <span aria-hidden className="h-[2px] w-5 rounded-full bg-gradient-to-r from-nova-400 to-plasma-400" />
            {eyebrow}
          </p>
        )}
        <h2 className="xmas-title text-[21px] font-extrabold leading-tight tracking-tight sm:text-[27px]">{title}</h2>
        {sub && <p className="mt-1 text-[13px] text-fg-subtle sm:text-[13.5px]">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-white/[0.05] pl-3.5 pr-2.5 text-[13px] font-medium text-fg-muted ring-1 ring-white/[0.08] transition hover:bg-white/10 hover:text-fg">
          {cta ?? "Ver todo"} <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
