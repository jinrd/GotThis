import { ImageResponse } from "next/og";
import { brandColor } from "@/components/ui/brand-mark";

// 휴대폰 홈 화면에 추가할 때 쓰는 아이콘. iOS가 모서리를 알아서 둥글게 깎으므로 꽉 채운 사각형으로 그린다.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: brandColor }}>
        <svg width="120" height="120" viewBox="0 0 32 32">
          <path d="M9 16.5l4.6 4.5L23 11.5" fill="none" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size,
  );
}
