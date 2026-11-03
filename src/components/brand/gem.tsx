import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Diamante suelto de Nova (íconos, avisos, fondos): el arte oficial del diamante con los bordes desvanecidos
 * para que se funda con el fondo oscuro. `hue="nova"` lo vuelve violeta. Se usa con un ancho (w-…).
 */
export function Gem({ className, hue = "ice" }: { className?: string; hue?: "ice" | "nova" }) {
  return (
    <Image
      src="/brand/diamante-nova.webp"
      alt=""
      aria-hidden
      width={256}
      height={256}
      className={cn("aspect-square h-auto select-none object-cover [mask-image:radial-gradient(closest-side,#000_62%,transparent)]", hue === "nova" && "hue-rotate-[35deg]", className)}
    />
  );
}
