// 목록·태그 색상 선택지. 사용자가 고른 색은 점이나 띠로만 쓰고 글자 배경으로는 쓰지 않는다
// (어떤 색이든 글자 대비를 보장할 수 없기 때문).
export const palette = [
  { value: "#4c6ef5", name: "파랑" },
  { value: "#12b886", name: "초록" },
  { value: "#fab005", name: "노랑" },
  { value: "#fd7e14", name: "주황" },
  { value: "#fa5252", name: "빨강" },
  { value: "#e64980", name: "분홍" },
  { value: "#7950f2", name: "보라" },
  { value: "#868e96", name: "회색" },
] as const;

export const defaultColor = palette[0].value;
