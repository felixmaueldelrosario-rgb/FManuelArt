import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoPath = join(process.cwd(), "public/brand/logo-fmanuel-art.png");
  const logoBase64 = readFileSync(logoPath).toString("base64");
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#100f19",
          fontFamily: "sans-serif",
        }}
      >
        <img src={logoSrc} width={190} height={190} style={{ marginBottom: 36 }} />
        <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: "#efe7d8", letterSpacing: -1 }}>
          FManuel Art
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#b3a89a",
            marginTop: 20,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Diseño · Ilustración · Motion · Branding
        </div>
      </div>
    ),
    { ...size }
  );
}
