/** Se vuelve a montar en cada navegación de la tienda: el contenido entra subiendo con un leve desenfoque. */
export default function StoreTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
