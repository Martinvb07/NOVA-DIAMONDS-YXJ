"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

/** Menú principal de escritorio. */
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
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [menuTop, setMenuTop] = useState(68);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-40 transition-[background,box-shadow,backdrop-filter] duration-300",
        "border-b",
        scrolled || open ? "border-white/[0.08] bg-ink-950/85 backdrop-blur-lg" : "border-transparent bg-ink-950",
      )}
    >
      <div className="mx-auto flex h-[64px] max-w-[1240px] items-center gap-3 px-4 sm:h-[68px] sm:px-6 lg:gap-8 lg:px-8">
        <Link href="/" className="-ml-1 shrink-0 rounded-xl" aria-label={`${storeName} — inicio`}>
          <Logo name={storeName} logoUrl={logoUrl} />
        </Link>

        {/* Menú principal (escritorio). */}
        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {categories.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center rounded-lg px-3 text-[14px] font-medium transition-colors",
                  active ? "bg-white/[0.07] text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
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
              className="hidden size-10 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-white/[0.06] hover:text-fg sm:grid"
            >
              <LayoutDashboard className="size-[18px]" />
            </Link>
          )}

          {user ? (
            <Link
              href="/cuenta"
              title="Mi cuenta"
              className="hidden h-10 items-center gap-2 rounded-lg pl-1 pr-3 text-[14px] font-medium transition-colors hover:bg-white/[0.06] sm:inline-flex"
            >
              <UserAvatar user={user} size={32} ring={false} />
              <span className="max-w-24 truncate lg:hidden xl:inline">{user.name && user.name !== "No Name" ? user.name.split(" ")[0] : "Mi cuenta"}</span>
            </Link>
          ) : (
            <Link
              href="/ingresar"
              className="hidden h-10 items-center gap-2 rounded-lg px-3 text-[14px] font-medium text-fg transition-colors hover:bg-white/[0.06] sm:inline-flex"
            >
              <LogIn className="size-4" /> <span>Ingresar</span>
            </Link>
          )}

          {/* Carrito con contador. */}
          <Link
            href="/carrito"
            aria-label={`Carrito (${count})`}
            className="relative grid size-10 place-items-center rounded-lg text-fg transition-colors hover:bg-white/[0.06]"
          >
            <ShoppingBag className="size-[19px]" />
            {count > 0 && (
              <span key={count} className="absolute right-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full bg-nova-600 px-1 text-[10.5px] font-semibold leading-[18px] text-white animate-bump">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg text-fg transition-colors hover:bg-white/[0.06] lg:hidden"
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

      {/* Secciones en celular y tablet: fila fija bajo el logo, se desliza de lado; la actual queda marcada. */}
      <nav className="lg:hidden" aria-label="Secciones">
        <div className="mx-auto flex max-w-[1240px] gap-1.5 overflow-x-auto px-4 pb-2.5 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
          {[{ href: "/", label: "Inicio", icon: Home }, ...nav].map(({ href, label }) => {
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
                  "inline-flex h-8 shrink-0 items-center rounded-lg px-3 text-[13.5px] font-medium transition-colors",
                  active ? "bg-white/[0.08] text-fg" : "text-fg-muted active:bg-white/[0.06]",
                )}
              >
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
                  <span className={cn("grid size-9 place-items-center rounded-xl", active ? "bg-white/[0.08] text-fg" : "bg-white/[0.04] text-fg-muted")}>
                    <Icon className="size-[18px]" />
                  </span>
                  {label}
                  <ChevronRight className="ml-auto size-4 text-fg-subtle" />
                </Link>
              );
            })}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {user ? (
                <Link href="/cuenta" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white/[0.06] text-sm font-semibold ring-1 ring-white/10">
                  <UserAvatar user={user} size={26} ring={false} /> Mi cuenta
                </Link>
              ) : (
                <Link href="/ingresar" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-nova-600 text-sm font-semibold text-white">
                  <LogIn className="size-4" /> Ingresar
                </Link>
              )}
              {user?.staff ? (
                <Link href="/admin" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white/[0.06] text-sm font-semibold ring-1 ring-white/10">
                  <LayoutDashboard className="size-4" /> Panel
                </Link>
              ) : (
                <Link href="/carrito" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white/[0.06] text-sm font-semibold ring-1 ring-white/10">
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
