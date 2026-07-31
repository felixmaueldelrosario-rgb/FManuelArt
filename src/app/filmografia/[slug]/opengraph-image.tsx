import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { PROJECTS } from "@/data/projects";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);

  if (!project) {
    return new ImageResponse(
      (<div style={{ width: "100%", height: "100%", display: "flex", background: "#100f19" }} />),
      { ...size }
    );
  }

  const imgPath = join(process.cwd(), "public", project.image);
  const imgBuffer = readFileSync(imgPath);
  const imgBase64 = imgBuffer.toString("base64");
  const imgSrc = `data:image/png;base64,${imgBase64}`;

  // PNG IHDR: width at bytes 16-19, height at bytes 20-23 (big-endian).
  const naturalWidth = imgBuffer.readUInt32BE(16);
  const naturalHeight = imgBuffer.readUInt32BE(20);
  const scale = Math.max(size.width / naturalWidth, size.height / naturalHeight);
  const coverWidth = Math.ceil(naturalWidth * scale);
  const coverHeight = Math.ceil(naturalHeight * scale);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#100f19" }}>
        <img
          src={imgSrc}
          width={coverWidth}
          height={coverHeight}
          style={{
            position: "absolute",
            top: (size.height - coverHeight) / 2,
            left: (size.width - coverWidth) / 2,
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: 64,
            background: "linear-gradient(to top, rgba(16,15,25,0.96), rgba(16,15,25,0.15))",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#e8604f",
              textTransform: "uppercase",
              letterSpacing: 3,
              marginBottom: 14,
              fontFamily: "sans-serif",
            }}
          >
            {project.deptLabel}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 700,
              color: "#efe7d8",
              fontFamily: "sans-serif",
              maxWidth: 1000,
            }}
          >
            {project.title}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
