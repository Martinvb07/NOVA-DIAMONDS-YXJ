"use client";

import { Children, isValidElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Opt = { value: string; label: string; disabled: boolean };

function text(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(text).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return text(node.props.children);
  return "";
}

/** Lee los <option> hijos (también dentro de arreglos de .map) como lista de opciones. */
function readOptions(children: ReactNode): Opt[] {
  const out: Opt[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const el = child as ReactElement<{ value?: string | number; children?: ReactNode; disabled?: boolean }>;
    if (el.type === "option") {
      const label = text(el.props.children);
      out.push({ value: String(el.props.value ?? label), label, disabled: !!el.props.disabled });
    } else if (el.props.children) out.push(...readOptions(el.props.children));
  });
  return out;
}

/**
 * Reemplazo del <select> nativo con el estilo de la tienda: el menú del navegador no se puede estilizar.
 * Se usa igual que un select sin control (name + defaultValue + <option>) y envía el valor en formularios
 * con un input oculto. Teclado: flechas, Inicio/Fin, Enter, Escape y búsqueda por letra.
 */
export function Select({
  name,
  defaultValue,
  children,
  className,
  disabled,
  required,
  "aria-label": ariaLabel,
  id,
}: {
  name?: string;
  defaultValue?: string | number | null;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  "aria-label"?: string;
  id?: string;
}) {
  const options = readOptions(children);
  const initial = defaultValue != null && options.some((o) => o.value === String(defaultValue)) ? String(defaultValue) : (options[0]?.value ?? "");
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; up: boolean } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ q: "", t: 0 });
  const listId = useId();
  const current = options.find((o) => o.value === value);

  const place = useCallback(() => {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom;
    const up = below < 260 && r.top > below;
    setPos({ top: up ? r.top - 6 : r.bottom + 6, left: r.left, width: r.width, up });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!btn.current?.contains(t) && !list.current?.contains(t)) setOpen(false);
    };
    const onScroll = (e: Event) => {
      if (!list.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const choose = (i: number) => {
    const o = options[i];
    if (!o || o.disabled) return;
    setValue(o.value);
    setOpen(false);
    btn.current?.focus();
  };
  const step = (from: number, d: number) => {
    for (let i = from + d; i >= 0 && i < options.length; i += d) if (!options[i].disabled) return i;
    return from;
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "Escape" || e.key === "Tab") return setOpen(false);
    if (e.key === "ArrowDown") (e.preventDefault(), setActive((a) => step(a, 1)));
    else if (e.key === "ArrowUp") (e.preventDefault(), setActive((a) => step(a, -1)));
    else if (e.key === "Home") (e.preventDefault(), setActive(step(-1, 1)));
    else if (e.key === "End") (e.preventDefault(), setActive(step(options.length, -1)));
    else if (e.key === "Enter" || e.key === " ") (e.preventDefault(), choose(active));
    else if (e.key.length === 1) {
      const now = Date.now();
      typed.current = { q: (now - typed.current.t < 700 ? typed.current.q : "") + e.key.toLowerCase(), t: now };
      const i = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(typed.current.q));
      if (i >= 0) setActive(i);
    }
  };

  return (
    <>
      {name && <input type="hidden" name={name} value={value} required={required} />}
      <button
        ref={btn}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKey}
        className={cn(
          "field flex items-center justify-between gap-2 text-left disabled:opacity-50",
          open && "border-nova-400/60 shadow-[0_0_0_3px_rgb(41_168_255/0.14)]",
          className,
        )}
      >
        <span className="truncate">{current?.label ?? "—"}</span>
        <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-fg-subtle transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", open && "rotate-180 text-nova-300")} />
      </button>
      {open &&
        pos &&
        createPortal(
          <ul
            ref={list}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            onKeyDown={onKey}
            style={{ left: pos.left, minWidth: pos.width, ...(pos.up ? { bottom: window.innerHeight - pos.top } : { top: pos.top }) }}
            className={cn(
              "fixed z-[200] max-h-[min(320px,60vh)] max-w-[calc(100vw-16px)] overflow-y-auto overscroll-contain rounded-[12px] border border-white/12 bg-ink-850/95 p-1 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.9),0_0_0_1px_rgb(41_168_255/0.08)] backdrop-blur-xl animate-pop-in",
              pos.up ? "origin-bottom" : "origin-top",
            )}
          >
            {options.map((o, i) => {
              const selected = o.value === value;
              return (
                <li
                  key={`${o.value}-${i}`}
                  data-i={i}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={o.disabled || undefined}
                  onPointerEnter={() => !o.disabled && setActive(i)}
                  onClick={() => choose(i)}
                  style={{ animationDelay: `${Math.min(i, 10) * 18}ms` }}
                  className={cn(
                    "flex animate-fade-in cursor-pointer items-center justify-between gap-6 whitespace-nowrap rounded-[8px] px-2.5 py-2 text-[13.5px] transition-colors",
                    o.disabled ? "cursor-not-allowed opacity-40" : i === active ? "bg-nova-400/12 text-fg" : "text-fg-muted",
                    selected && "font-semibold text-nova-200",
                  )}
                >
                  {o.label}
                  {selected && <Check aria-hidden className="size-3.5 text-nova-300" />}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </>
  );
}
