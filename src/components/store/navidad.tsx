/* eslint-disable @next/next/no-img-element */

/**
 * Navidad de cristal (solo en temporada; ver src/domain/season.ts y Panel → Ajustes → Temporada):
 *  - aurora azul y violeta de fondo;
 *  - cable de luces bajo el encabezado, con bombillos de los colores de la marca en 3 capas que titilan por turnos;
 *  - copos de nieve como cristales que caen despacio y se mecen (dos capas que solo se desplazan);
 *  - paisaje de invierno con pinos de hielo y la estrella nova antes del pie de página (ChristmasLandscape).
 * Las imágenes son fondos de globals.css que solo existen dentro de [data-season="navidad"]: fuera de temporada no se
 * descargan. Las animaciones son de transform u opacity. Con «reducir movimiento» no hay animaciones ni nieve.
 */
export function ChristmasDecor() {
  return (
    <>
      <div aria-hidden className="xmas-aurora pointer-events-none fixed inset-0 -z-10" />
      <div aria-hidden className="xmas-lights-row pointer-events-none relative z-[5] -mb-3 h-[38px] sm:h-[46px]">
        <span className="xmas-bulbs xmas-bulbs-1" />
        <span className="xmas-bulbs xmas-bulbs-2" />
        <span className="xmas-bulbs xmas-bulbs-3" />
      </div>
      <div aria-hidden className="xmas-snow pointer-events-none fixed inset-0 z-[5] overflow-hidden">
        <div className="xmas-sway xmas-sway-a">
          <div className="xmas-snow-a" />
        </div>
        <div className="xmas-sway xmas-sway-b">
          <div className="xmas-snow-b" />
        </div>
      </div>
    </>
  );
}

/** Paisaje de invierno (aurora, colinas nevadas, pinos de hielo con luces y la estrella nova) encima del pie de página. */
export function ChristmasLandscape() {
  return (
    <div aria-hidden className="pointer-events-none relative z-[1] mt-6 -mb-10 sm:mt-8 sm:-mb-16">
      <img src="/temporada/paisaje.svg" alt="" loading="lazy" decoding="async" draggable={false} className="block h-[90px] w-full object-cover object-bottom sm:h-[150px]" />
    </div>
  );
}
