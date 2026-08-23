'use client';
import dynamic from 'next/dynamic';
// OAuthProvider 내부의 script 태그 렌더링으로 인한 SSR 오류를 완전히 차단합니다.
const OAuthProviderInner = dynamic(
  () =>
    import('@themoment-team/datagsm-oauth-react').then(
      (mod) => mod.OAuthProvider
    ),
  { ssr: false }
);
export function ClientOAuthProvider({ children }: { children: React.ReactNode }) {
  // 백엔드가 리다이렉트를 받는 구조에서, 프론트가 직접 DataGSM 인증 URL로 리다이렉트되고
  // 자기 자신의 /callback 라우트로 authCode를 돌려받는 구조로 변경됨.
  // (DataGSM OAuth 앱 설정에 이 origin의 /callback이 허용 redirect_uri로 등록되어 있어야 함)
  const redirectUri =
    typeof window !== 'undefined' ? `${window.location.origin}/callback` : '';
  return (
    <OAuthProviderInner
      clientId="cd56665d-0a20-4e8e-966d-fac6875da82b"
      redirectUri={redirectUri}
      authMode="PKCE"
    >
      {children}
    </OAuthProviderInner>
  );
}
