import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Recargas de diamantes y cuentas Free Fire en Colombia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const asset = async (f: string) => `data:image/png;base64,${(await readFile(path.join(process.cwd(), "public", "brand", f))).toString("base64")}`;

export default async function OgImage() {
  const logo = await asset("nova-diamonds.png");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(900px 500px at 15% 0%, #0d2a5c 0%, #05070d 70%)",
          color: "#eef3fb",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={480} height={121} alt="NOVA DIAMONDS YXJ" />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>Diamantes a tu ID,</div>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: "#7fd4ff" }}>sin vueltas.</div>
          <div style={{ marginTop: 28, fontSize: 28, color: "#7fd4ff" }}>Recargas y cuentas Free Fire · Pagos en pesos colombianos · Seguimiento de cada pedido</div>
        </div>
      </div>
    ),
    size,
  );
}
