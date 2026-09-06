import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// 브라우저에서 직접 호출하는 백엔드 오리진(연결 허용 목록에 넣어야 함).
// NEXT_PUBLIC_AUTH_API_URL 예: https://school.https.gsmsv.site
let apiOrigin = "";
try {
  if (process.env.NEXT_PUBLIC_AUTH_API_URL) {
    apiOrigin = new URL(process.env.NEXT_PUBLIC_AUTH_API_URL).origin;
  }
} catch {
  // 잘못된 값이면 그냥 비움 - 빌드는 계속 진행
}

// nonce 방식 CSP는 모든 페이지를 동적 렌더링으로 강제하고 CDN 캐시를 못 쓰게 됨.
// 이 사이트는 정적 프리렌더 + nginx 캐시로 서비스하므로, next-themes/Next 부트스트랩이
// 넣는 인라인 스크립트·스타일을 위해 'unsafe-inline'을 허용하는 정적 CSP를 쓴다.
// script-src에 'unsafe-inline'이 있어도 외부 스크립트 주입 차단, object-src 'none',
// base-uri, frame-ancestors, form-action 제한은 그대로 유효하다.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ""}${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  // 응답에서 X-Powered-By: Next.js 제거 (기술 스택 노출 최소화)
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
