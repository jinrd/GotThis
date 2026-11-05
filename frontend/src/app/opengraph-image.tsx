import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";
import { BrandMark } from "@/components/ui/brand-mark";

// 링크를 공유할 때 보이는 미리보기 카드. 빌드할 때 한 번 만들어지는 정적 이미지다.
export const alt = `${brand.name} — ${brand.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 기본 글꼴에는 한글이 없어서 Pretendard를 넣는다 (woff2는 지원하지 않아 otf를 쓴다)
// 모듈을 불러올 때(빌드 시점) 읽어야 이미지가 정적으로 만들어진다. 요청마다 읽으면 운영 서버에 글꼴 파일이 필요해진다.
const fontDir = join(process.cwd(), "node_modules/pretendard/dist/public/static");
const [bold, medium] = await Promise.all([
  readFile(join(fontDir, "Pretendard-Bold.otf")),
  readFile(join(fontDir, "Pretendard-Medium.otf")),
]);

export default function OpengraphImage() {

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#f6f6f7",
          fontFamily: "Pretendard",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <BrandMark size={112} />
          <span style={{ fontSize: 104, fontWeight: 700, color: "#1a1a1e", letterSpacing: -2 }}>{brand.name}</span>
        </div>
        <span style={{ marginTop: 40, fontSize: 52, fontWeight: 700, color: "#2f5bd3" }}>{brand.tagline}</span>
        <span style={{ marginTop: 16, fontSize: 34, fontWeight: 500, color: "#55555f" }}>{brand.description}</span>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: bold, weight: 700, style: "normal" },
        { name: "Pretendard", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
