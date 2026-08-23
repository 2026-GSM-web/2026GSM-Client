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
  return (
    <OAuthProviderInner
      clientId="cd56665d-0a20-4e8e-966d-fac6875da82b"
      redirectUri="http://service.gsmsv.site:35493/login/oauth2/code/school"
      authMode="PKCE"
    >
      {children}
    </OAuthProviderInner>
  );
}
