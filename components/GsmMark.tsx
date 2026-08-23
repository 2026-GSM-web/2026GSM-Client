// 학생회 로고 이미지(각진 2톤 워드마크)를 참고해 만든 "GSM" 심볼.
// 실제 로고 원본 파일이 없어서, 이미지 속 느낌(짙은 네이비 몸통 + 하늘색 포인트 캡,
// 각진 블록 글자)을 SVG 스트로크로 재해석해 만들었음. 폰트가 아니라 벡터 그림이라
// 어느 크기로 써도 깨지지 않음.
export default function GsmMark({ className = '' }: { className?: string }) {
  const NAVY = '#0b3a5b';
  const SKY = '#74c6e8';

  return (
    <svg
      viewBox="0 0 900 260"
      className={className}
      role="img"
      aria-label="GSM"
      fill="none"
    >
      {/* G */}
      <g>
        <path
          d="M240,27 L47,27 L47,233 L233,233 L233,140 L150,140"
          stroke={NAVY}
          strokeWidth="54"
          strokeLinejoin="miter"
          strokeLinecap="butt"
        />
        <path
          d="M130,27 L47,27 L47,110"
          stroke={SKY}
          strokeWidth="54"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>

      {/* S */}
      <g transform="translate(300,0)">
        <path
          d="M40,27 L180,27 L40,233 L180,233"
          stroke={NAVY}
          strokeWidth="54"
          strokeLinejoin="miter"
          strokeLinecap="butt"
        />
        <path
          d="M105,27 L180,27 L180,100"
          stroke={SKY}
          strokeWidth="54"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>

      {/* M */}
      <g transform="translate(560,0)">
        <path
          d="M40,233 L40,27 L170,155 L300,27 L300,233"
          stroke={NAVY}
          strokeWidth="54"
          strokeLinejoin="miter"
          strokeLinecap="butt"
        />
        <path
          d="M40,100 L40,27 L110,100"
          stroke={SKY}
          strokeWidth="54"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M230,100 L300,27 L300,100"
          stroke={SKY}
          strokeWidth="54"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
