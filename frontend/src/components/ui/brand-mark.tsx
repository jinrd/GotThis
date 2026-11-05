// GotThis 로고: 강조색 둥근 사각형 + 흰 체크. 화면과 이미지 생성(next/og) 양쪽에서 쓰므로
// Tailwind 클래스 없이 순수 SVG 속성만 쓴다.
export const brandColor = "#2f5bd3";

export function BrandMark({ size = 32, title }: { size?: number; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect width="32" height="32" rx="8" fill={brandColor} />
      <path
        d="M9 16.5l4.6 4.5L23 11.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
