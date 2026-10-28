"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { ChevronDown, ChevronRight, CreditCard, Gem, Home, LayoutDashboard, LifeBuoy, LogIn, Menu, Radar, Search, ShoppingBag, Users, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useCart } from "@/components/cart/cart-context";
import { cn } from "@/lib/utils";
import { SearchBox } from "./search-box";
import { UserAvatar } from "@/components/account/user-avatar";

const NAV = [
  { href: "/recargas", label: "Diamantes", icon: Gem },
  { href: "/cuentas", label: "Cuentas", icon: Users },
  { href: "/pedido", label: "Seguimiento", icon: Radar },
  { href: "/ayuda", label: "Ayuda", icon: LifeBuoy },
];

/** Menú principal de escritorio (centrado). Una píldora neón se desliza hasta el enlace activo o el que tiene el mouse. */
const CATEGORIES: Array<{ href: string; label: string; icon: typeof Gem }> = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/recargas", label: "Diamantes", icon: Gem },
  { href: "/cuentas", label: "Cuentas", icon: Users },
  { href: "/pedido", label: "Seguimiento", icon: Radar },
  { href: "/medios-de-pago", label: "Pagos", icon: CreditCard },
  { href: "/ayuda", label: "Ayuda", icon: LifeBuoy },
];

type Props = {
  storeName: string;
  logoUrl?: string;
  user: { name: string | null; email: string; staff: boolean; avatarUrl: string | null; avatarPreset: string | null } | null;
  /** false: la sección de cuentas está oculta (sin cuentas publicadas o desactivada). */
  showAccounts?: boolean;
};

export function SiteHeader({ storeName, logoUrl, user, showAccounts = true }: Props) {
  const nav = showAccounts ? NAV : NAV.filter((n) => n.href !== "/cuentas");
  const categories = showAccounts ? CATEGORIES : CATEGORIES.filter((n) => n.href !== "/cuentas");
  const pathname = usePathname();
  const { items, ready } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [menuTop, setMenuTop] = useState(68);

  useEffect(() => {
    // Las barras de arriba se pliegan con histéresis: se esconden pasados 100 px y vuelven por debajo de 10.
    // El margen (90 px) es mayor que lo que miden (64 px); así, en páginas cortas, plegarlas no devuelve
    // la página bajo el umbral y la navbar no entra en un bucle de abrir/cerrar (parpadeo).
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      setCompact((c) => (c ? y > 10 : y > 100));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Menú abierto: la página de atrás no se mueve. En iPhone `overflow: hidden` en el body no basta
  // (Safari deja deslizar igual), así que también se bloquea el gesto fuera del menú y el panel
  // se recoloca bajo el encabezado si el navegador cambia de tamaño (barras de Safari).
  useEffect(() => {
    if (!open) return;
    const place = () => headerRef.current && setMenuTop(Math.max(0, headerRef.current.getBoundingClientRect().bottom));
    place();
    const root = document.documentElement;
    // Solo en <html>: si el body también lleva overflow, se vuelve su propio contenedor de scroll y el
    // encabezado fijo (sticky) se va hacia arriba, dejando ver la página entre él y el menú.
    root.style.overflow = "hidden";
    const blockTouch = (e: TouchEvent) => {
      if (!(e.target as HTMLElement | null)?.closest("#mobile-menu")) e.preventDefault();
    };
    document.addEventListener("touchmove", blockTouch, { passive: false });
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, { passive: true });
    return () => {
      root.style.overflow = "";
      document.removeEventListener("touchmove", blockTouch);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place);
    };
  }, [open]);

  // Búsqueda del celular: se enfoca al abrir y se cierra al tocar fuera del encabezado.
  useEffect(() => {
    if (!searchOpen) return;
    mobileSearchRef.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (headerRef.current?.contains(e.target as Node)) return;
      (document.activeElement as HTMLElement | null)?.blur();
      setSearchOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [searchOpen]);

  // Si la pantalla pasa a tamaño escritorio (girar la tablet), se cierran el menú y la búsqueda móviles.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) {
        setOpen(false);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearchOpen(false);
      }
      if (e.key === "/" && !(e.target as HTMLElement)?.closest("input,textarea,select")) {
        e.preventDefault();
        setOpen(false);
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // En iPhone, si el campo enfocado desaparece el teclado se queda abierto encima del menú: se suelta antes.
  const releaseKeyboard = () => {
    const el = document.activeElement as HTMLElement | null;
    if (el?.closest("input,textarea")) el.blur();
  };
  // Abrir la búsqueda y enfocar dentro del mismo toque: Safari solo saca el teclado si el foco
  // llega durante el gesto, no después en un efecto.
  const toggleSearch = () => {
    if (searchOpen) {
      releaseKeyboard();
      setSearchOpen(false);
      return;
    }
    flushSync(() => {
      setOpen(false);
      setSearchOpen(true);
    });
    mobileSearchRef.current?.focus();
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const count = ready ? items.length : 0;

  // Píldora deslizante del menú de escritorio.
  const navRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number; on: boolean; hover: boolean }>({ left: 0, width: 0, on: false, hover: false });
  const moveTo = useCallback((el: HTMLElement | null | undefined, hover = false) => {
    if (!el) return setPill((p) => ({ ...p, on: false, hover: false }));
    setPill({ left: el.offsetLeft, width: el.offsetWidth, on: true, hover });
  }, []);
  const toActive = useCallback(() => moveTo(navRef.current?.querySelector<HTMLElement>('[aria-current="page"]')), [moveTo]);
  useLayoutEffect(() => {
    toActive();
    window.addEventListener("resize", toActive);
    // Las fuentes cambian el ancho de los enlaces al terminar de cargar.
    document.fonts?.ready.then(toActive).catch(() => {});
    return () => window.removeEventListener("resize", toActive);
  }, [pathname, toActive]);

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-40 transition-[background,box-shadow,backdrop-filter] duration-300",
        scrolled || open ? "bg-ink-950/75 shadow-[0_1px_0_0_rgb(255_255_255/0.06),0_16px_40px_-24px_rgb(0_0_0/0.9)] backdrop-blur-xl backdrop-saturate-150" : "bg-transparent",
      )}
    >
      {/* Barra superior (escritorio): moneda y país a la izquierda; accesos rápidos a la derecha. Se pliega al bajar. */}
      <div className={cn("hidden overflow-hidden border-b border-white/[0.05] transition-[height,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:block", compact ? "h-0 opacity-0" : "h-8 opacity-100")}>
        <div className="mx-auto flex h-8 max-w-[1240px] items-center gap-5 px-8 text-[11.5px] font-medium text-fg-subtle">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-ok-400 shadow-[0_0_8px_rgb(69_217_155/0.9)]" aria-hidden />
            Entregas activas · COP · Colombia
          </span>
          <div className="ml-auto flex items-center gap-5">
            <Link href="/pedido" className="transition-colors duration-300 hover:text-nova-300">Rastrear pedido</Link>
            <Link href="/medios-de-pago" className="transition-colors duration-300 hover:text-nova-300">Medios de pago</Link>
            <Link href="/ayuda" className="transition-colors duration-300 hover:text-nova-300">Ayuda</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-[64px] max-w-[1240px] items-center gap-3 px-4 sm:h-[72px] sm:px-6 lg:h-[76px] lg:gap-5 lg:px-8">
        <Link href="/" className="-ml-1 shrink-0 rounded-xl lg:mr-auto" aria-label={`${storeName} — inicio`}>
          <Logo name={storeName} logoUrl={logoUrl} />
        </Link>

        {/* Menú principal (escritorio), centrado. */}
        <nav
          ref={navRef}
          aria-label="Principal"
          onMouseLeave={toActive}
          className="chamfer relative mx-auto hidden shrink-0 items-center gap-0.5 bg-gradient-to-r from-nova-400/[0.06] via-white/[0.02] to-plasma-400/[0.06] p-1 backdrop-blur lg:flex"
        >
          <span
            aria-hidden
            className={cn(
              "chamfer-sm absolute inset-y-1 transition-[left,width,opacity,background,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              pill.hover ? "bg-white/[0.08]" : "bg-gradient-to-r from-nova-400/35 to-plasma-400/25",
              pill.on ? "opacity-100" : "opacity-0",
            )}
            style={{ left: pill.left, width: pill.width }}
          />
          {categories.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                onMouseEnter={(e) => moveTo(e.currentTarget, !active)}
                onFocus={(e) => moveTo(e.currentTarget, !active)}
                onBlur={toActive}
                className={cn(
                  "group relative z-10 inline-flex h-9 items-center gap-2 px-3 text-[13px] font-semibold transition-colors duration-300 xl:px-3.5",
                  active ? "text-white" : "text-fg-muted hover:text-fg",
                )}
              >
                <Icon className={cn("hidden size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:scale-110", active && "drop-shadow-[0_0_6px_rgb(41_168_255/0.9)]")} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-2 lg:ml-0">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full text-fg-muted ring-1 ring-white/[0.08] transition-[color,background,box-shadow] duration-300 hover:bg-white/[0.06] hover:text-fg hover:ring-nova-400/40"
            aria-label="Buscar"
            aria-expanded={searchOpen}
            onClick={toggleSearch}
          >
            <Search className="size-[18px]" />
          </button>

          {user?.staff && (
            <Link
              href="/admin"
              title="Panel de administración"
              className="hidden size-10 place-items-center rounded-full text-fg-muted ring-1 ring-white/[0.08] transition-[color,background,box-shadow] duration-300 hover:bg-white/[0.06] hover:text-fg hover:ring-nova-400/40 sm:grid"
            >
              <LayoutDashboard className="size-[18px]" />
            </Link>
          )}

          {user ? (
            <Link
              href="/cuenta"
              title="Mi cuenta"
              className="hidden h-10 items-center gap-2 rounded-full pl-1 pr-3 text-[13px] font-semibold ring-1 ring-white/[0.08] transition-[background,box-shadow] duration-300 hover:bg-white/[0.06] hover:ring-nova-400/40 sm:inline-flex"
            >
              <UserAvatar user={user} size={32} ring={false} />
              <span className="max-w-24 truncate lg:hidden xl:inline">{user.name && user.name !== "No Name" ? user.name.split(" ")[0] : "Mi cuenta"}</span>
            </Link>
          ) : (
            <Link
              href="/ingresar"
              className="hidden h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-fg ring-1 lg:px-3 xl:px-4 ring-white/[0.12] transition-[background,box-shadow,color] duration-300 hover:bg-white/[0.06] hover:text-nova-200 hover:ring-nova-400/50 sm:inline-flex"
            >
              <LogIn className="size-4" /> <span className="lg:hidden xl:inline">Ingresar</span>
            </Link>
          )}

          {/* Carrito: botón neón con contador que rebota al cambiar. */}
          <Link
            href="/carrito"
            aria-label={`Carrito (${count})`}
            className={cn(
              "btn-nova btn-shine relative inline-flex h-10 items-center gap-2",
              "w-10 justify-center lg:w-auto lg:pl-3.5 lg:pr-2",
            )}
          >
            <ShoppingBag className="size-[18px]" strokeWidth={2.2} />
            <span className="hidden text-[13px] font-bold lg:inline">Carrito</span>
            <span
              key={count}
              className={cn(
                "grid min-w-[20px] place-items-center rounded-full bg-ink-950 px-1.5 text-[11px] font-bold leading-[20px] text-nova-200 animate-bump",
                "absolute right-0.5 top-0.5 lg:static",
                count === 0 && "max-lg:hidden",
              )}
            >
              {count}
            </span>
          </Link>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-full text-fg ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.06] lg:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => {
              releaseKeyboard();
              setSearchOpen(false);
              setOpen((v) => !v);
            }}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Franja de aviso bajo el encabezado (escritorio). */}
      <div className={cn("hidden overflow-hidden border-t border-white/[0.05] bg-gradient-to-r from-transparent via-nova-500/[0.07] to-transparent transition-[height,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:block", compact ? "h-0 opacity-0" : "h-8 opacity-100")}>
        <p className="mx-auto flex h-8 max-w-[1240px] items-center justify-center gap-2 px-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted">
          <Gem className="size-3.5 text-nova-300" aria-hidden />
          Diamantes al instante con tu ID · paga en pesos con PSE, Nequi o tarjeta
          <Link href="/medios-de-pago" className="ml-1 text-nova-300 underline decoration-nova-400/40 underline-offset-4 transition-colors hover:text-nova-200 hover:decoration-nova-300">
            Ver medios
          </Link>
        </p>
      </div>

      {/* Secciones en celular y tablet: fila fija bajo el logo, se desliza de lado; la actual queda marcada. */}
      <nav className="lg:hidden" aria-label="Secciones">
        <div className="mx-auto flex max-w-[1240px] gap-1.5 overflow-x-auto px-4 pb-2.5 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
          {[{ href: "/", label: "Inicio", icon: Home }, ...nav].map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  releaseKeyboard();
                  setOpen(false);
                  setSearchOpen(false);
                }}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium ring-1 transition-colors",
                  active ? "bg-nova-400/12 text-nova-300 ring-nova-400/35" : "text-fg-muted ring-white/[0.08] active:bg-white/[0.06]",
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Búsqueda móvil */}
      {searchOpen && (
        <div className="mx-auto max-w-2xl animate-fade-up px-4 pb-3">
          <SearchBox variant="mobile" inputRef={mobileSearchRef} onNavigate={() => setSearchOpen(false)} showAccounts={showAccounts} />
        </div>
      )}

      {/* Menú móvil */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
        <div id="mobile-menu" style={{ top: menuTop }} className="fixed inset-x-0 bottom-0 z-50 overflow-y-auto overscroll-contain border-t border-white/[0.06] bg-ink-900 pb-[env(safe-area-inset-bottom)] lg:hidden">
          <nav className="flex flex-col gap-1.5 px-4 py-4" aria-label="Menú móvil">
            {[{ href: "/", label: "Inicio", icon: Home }, ...nav].map(({ href, label, icon: Icon }, i) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  style={{ animationDelay: `${i * 30}ms` }}
                  className={cn(
                    "flex animate-fade-up items-center gap-3.5 rounded-[14px] px-4 py-3.5 text-[16px] font-semibold ring-1 transition-colors",
                    active ? "bg-white/[0.07] ring-white/12" : "ring-white/[0.05] hover:bg-white/[0.04]",
                  )}
                >
                  <span className={cn("grid size-9 place-items-center rounded-xl", active ? "bg-nova-400/15 text-nova-300" : "bg-white/[0.05] text-fg-muted")}>
                    <Icon className="size-[18px]" />
                  </span>
                  {label}
                  <ChevronRight className="ml-auto size-4 text-fg-subtle" />
                </Link>
              );
            })}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {user ? (
                <Link href="/cuenta" className="flex h-12 items-center justify-center gap-2 rounded-full bg-white/[0.06] text-sm font-semibold ring-1 ring-white/10">
                  <UserAvatar user={user} size={26} ring={false} /> Mi cuenta
                </Link>
              ) : (
                <Link href="/ingresar" className="flex h-12 items-center justify-center gap-2 rounded-full bg-nova-400 text-sm font-semibold text-nova-ink">
                  <LogIn className="size-4" /> Ingresar
                </Link>
              )}
              {user?.staff ? (
                <Link href="/admin" className="flex h-12 items-center justify-center gap-2 rounded-full bg-white/[0.06] text-sm font-semibold ring-1 ring-white/10">
                  <LayoutDashboard className="size-4" /> Panel
                </Link>
              ) : (
                <Link href="/carrito" className="flex h-12 items-center justify-center gap-2 rounded-full bg-white/[0.06] text-sm font-semibold ring-1 ring-white/10">
                  <ShoppingBag className="size-4" /> Carrito{count ? ` (${count})` : ""}
                </Link>
              )}
            </div>
          </nav>
        </div>,
          document.body,
        )}
    </header>
  );
}
