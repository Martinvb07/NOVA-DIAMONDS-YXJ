"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { ChevronDown, ChevronRight, CreditCard, Gem, Home, LayoutDashboard, LayoutGrid, LifeBuoy, LogIn, Menu, Radar, Search, ShoppingBag, Users, X } from "lucide-react";
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

/** Categorías del encabezado de escritorio: ícono arriba y nombre abajo; la activa lleva la línea neón arriba. */
const CATEGORIES: Array<{ href: string; label: string; icon: typeof Gem; badge?: string }> = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/recargas", label: "Diamantes", icon: Gem, badge: "Bonus" },
  { href: "/cuentas", label: "Cuentas", icon: Users, badge: "Nuevo" },
  { href: "/pedido", label: "Seguimiento", icon: Radar },
  { href: "/medios-de-pago", label: "Pagos", icon: CreditCard },
  { href: "/ayuda", label: "Ayuda", icon: LifeBuoy },
  { href: "/buscar", label: "Ver todo", icon: LayoutGrid },
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
  const searchRef = useRef<HTMLInputElement>(null);
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
        setSearchOpen(false);
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
        if (window.matchMedia("(min-width: 1280px)").matches) searchRef.current?.focus();
        else {
          setOpen(false);
          setSearchOpen(true);
        }
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
        scrolled || open ? "bg-ink-950/75 shadow-[0_1px_0_0_rgb(255_255_255/0.06),0_16px_40px_-24px_rgb(0_0_0/0.9)] backdrop-blur-xl backdrop-saturate-150" : "bg-transparent",
      )}
    >
      {/* Barra superior (escritorio): moneda y país a la izquierda; cuenta y accesos a la derecha. Se pliega al bajar. */}
      <div className={cn("hidden overflow-hidden border-b border-white/[0.06] transition-[height,opacity] duration-300 lg:block", scrolled ? "h-0 opacity-0" : "h-9 opacity-100")}>
        <div className="mx-auto flex h-9 max-w-[1240px] items-center gap-5 px-8 text-[12px] text-fg-subtle">
          <span className="inline-flex items-center gap-1">COP <ChevronDown className="size-3" /></span>
          <span className="inline-flex items-center gap-1">Español · Colombia <ChevronDown className="size-3" /></span>
          <div className="ml-auto flex items-center gap-5">
            <Link href="/pedido" className="transition-colors hover:text-nova-300">Rastrear pedido</Link>
            <Link href="/ayuda" className="transition-colors hover:text-nova-300">Ayuda</Link>
            {user?.staff && (
              <Link href="/admin" className="inline-flex items-center gap-1 transition-colors hover:text-nova-300">
                <LayoutDashboard className="size-3.5" /> Panel
              </Link>
            )}
            {user ? (
              <Link href="/cuenta" className="inline-flex items-center gap-1.5 text-fg-muted transition-colors hover:text-nova-300">
                <UserAvatar user={user} size={18} ring={false} />
                {user.name && user.name !== "No Name" ? user.name.split(" ")[0] : "Mi cuenta"} <ChevronDown className="size-3" />
              </Link>
            ) : (
              <Link href="/ingresar" className="inline-flex items-center gap-1 text-fg-muted transition-colors hover:text-nova-300">
                Mi cuenta <ChevronDown className="size-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-[60px] max-w-[1240px] items-center gap-3 px-4 sm:h-[72px] sm:px-6 lg:h-[84px] lg:items-stretch lg:gap-0 lg:pl-8 lg:pr-0">
        <Link href="/" className="-ml-1 shrink-0 self-center rounded-lg transition-opacity hover:opacity-90" aria-label={`${storeName} — inicio`}>
          <Logo name={storeName} logoUrl={logoUrl} />
        </Link>

        {/* Categorías (escritorio): ícono + nombre; la activa se marca con una línea neón arriba. */}
        <nav className="ml-6 hidden items-stretch xl:ml-10 lg:flex" aria-label="Principal">
          {categories.map(({ href, label, icon: Icon, badge }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex w-[68px] flex-col items-center justify-center gap-1.5 text-[11.5px] font-medium transition-colors xl:w-[78px]",
                  active ? "text-nova-300" : "text-fg-subtle hover:text-fg",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-2 top-0 h-[3px] rounded-b-full transition-all duration-300",
                    active ? "bg-nova-400 opacity-100 shadow-[0_0_14px_1px_rgb(41_168_255/0.75)]" : "bg-white/40 opacity-0 group-hover:opacity-40",
                  )}
                />
                {badge && (
                  <span className="absolute top-2.5 right-1.5 rounded-[3px] bg-nova-400 px-1 text-[8.5px] font-bold uppercase leading-[13px] tracking-wide text-nova-ink">{badge}</span>
                )}
                <Icon className={cn("size-[22px] transition-transform group-hover:-translate-y-0.5", active && "drop-shadow-[0_0_8px_rgb(41_168_255/0.8)]")} strokeWidth={1.7} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:gap-3">
          {/* Búsqueda escritorio */}
          <SearchBox variant="desktop" inputRef={searchRef} showAccounts={showAccounts} />

          <button
            type="button"
            className="grid size-10 place-items-center rounded-full text-fg-muted transition-colors hover:bg-white/[0.06] hover:text-fg xl:hidden"
            aria-label="Buscar"
            aria-expanded={searchOpen}
            onClick={toggleSearch}
          >
            <Search className="size-[18px]" />
          </button>

          {/* Carrito (celular y tablet): ícono redondo. */}
          <Link
            href="/carrito"
            className={cn(
              "relative grid size-10 place-items-center rounded-full transition-colors lg:hidden",
              isActive("/carrito") ? "bg-white/[0.08] text-fg" : "text-fg-muted hover:bg-white/[0.06] hover:text-fg",
            )}
            aria-label={`Carrito (${count})`}
          >
            <ShoppingBag className="size-[18px]" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-nova-400 px-1 text-[10px] font-bold leading-[18px] text-nova-ink ring-2 ring-ink-900">{count}</span>
            )}
          </Link>

          {!user && (
            <Link
              href="/ingresar"
              className="hidden h-10 items-center gap-2 rounded-full bg-nova-400 px-4 text-[13.5px] font-semibold text-nova-ink shadow-[0_1px_0_0_rgb(255_255_255/0.35)_inset,0_6px_20px_-8px_rgb(41_168_255/0.6)] transition-colors hover:bg-nova-300 sm:inline-flex lg:hidden"
            >
              <LogIn className="size-4" /> Ingresar
            </Link>
          )}
          {user && (
            <Link href="/cuenta" className="ml-1 hidden h-10 items-center gap-2 rounded-full pl-1 pr-3 text-[13px] font-medium ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.06] sm:inline-flex lg:hidden">
              <UserAvatar user={user} size={32} ring={false} />
              <span className="max-w-28 truncate">{user.name && user.name !== "No Name" ? user.name.split(" ")[0] : "Mi cuenta"}</span>
            </Link>
          )}

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

        {/* Carrito (escritorio): bloque neón a toda la altura del encabezado. */}
        <Link
          href="/carrito"
          aria-label={`Carrito (${count})`}
          className="relative ml-4 hidden w-[178px] shrink-0 whitespace-nowrap items-center gap-3 bg-gradient-to-br from-nova-400 to-nova-600 px-5 text-nova-ink shadow-[0_0_30px_-6px_rgb(41_168_255/0.7)] transition-[filter] hover:brightness-110 lg:flex"
        >
          <span className="relative">
            <ShoppingBag className="size-7" strokeWidth={1.8} />
            <span className="absolute -bottom-1 -left-1.5 grid min-w-[18px] place-items-center rounded-full bg-white px-1 text-[10px] font-bold leading-[18px] text-nova-600">{count}</span>
          </span>
          <span className="leading-tight">
            <span className="block text-[11px] font-medium opacity-80">Tu carrito</span>
            <span className="block text-[15px] font-extrabold">{count === 1 ? "1 producto" : `${count} productos`}</span>
          </span>
        </Link>
      </div>

      {/* Franja de aviso bajo el encabezado (escritorio), como "envío gratis" en tiendas clásicas. */}
      <div className={cn("hidden border-y border-white/[0.06] bg-ink-950/60 transition-[height,opacity] duration-300 lg:block", scrolled ? "h-0 overflow-hidden opacity-0" : "opacity-100")}>
        <p className="mx-auto max-w-[1240px] px-8 py-2 text-center text-[11.5px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
          Diamantes al instante con tu ID · paga en pesos con PSE, Nequi o tarjeta ·{" "}
          <Link href="/medios-de-pago" className="text-nova-300 underline underline-offset-2 hover:text-nova-200">
            Ver medios de pago
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
        <div className="px-4 pb-3 xl:hidden">
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
