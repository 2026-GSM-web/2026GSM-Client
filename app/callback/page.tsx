'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOAuth } from '@themoment-team/datagsm-oauth-react';

// DataGSM OAuth 서버가 돌려주는 error 코드별 안내 문구
const ERROR_MESSAGES: Record<string, string> = {
  FRONTEND_OAUTH2_ERROR_REDIRECT_URI:
    '로그인 연동 설정(redirect_uri)이 올바르지 않아 로그인을 완료할 수 없습니다. 관리자에게 문의해 주세요.',
};

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, redirectUri, getCodeVerifier, clearVerifier } = useOAuth();

  const oauthError = searchParams.get('error');
  const code = searchParams.get('code');

  const [exchangeError, setExchangeError] = useState<string | null>(null);

  useEffect(() => {
    if (oauthError) return;

    const exchangeCode = async () => {
      if (!code) {
        setExchangeError('인증 코드를 받지 못했습니다. 다시 로그인해 주세요.');
        return;
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
      if (!apiBaseUrl) {
        // 백엔드 주소가 아직 설정되지 않음 - .env.example 참고
        setExchangeError('로그인 서버 주소가 설정되지 않았습니다. 관리자에게 문의해 주세요.');
        return;
      }

      try {
        const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authCode: code,
            redirectUri,
            codeVerifier: getCodeVerifier(),
          }),
        });

        if (!res.ok) {
          throw new Error(`서버 응답 오류 (${res.status})`);
        }

        const data = await res.json();
        const token = data.jwt ?? data.token ?? data.accessToken;
        if (!token) {
          throw new Error('응답에서 JWT를 찾을 수 없습니다.');
        }

        localStorage.setItem('sc_jwt', token);
        clearVerifier();

        // 로그인을 어디서 시작했는지에 따라 되돌아갈 위치가 달라짐(정책 제안 작성 / 관리자
        // 페이지 등). 로그인 시작 시 sessionStorage에 남겨둔 값을 읽고, 없으면 기존 기본
        // 동작(정책 제안 작성 페이지)으로 이동
        const returnTo = sessionStorage.getItem('sc_oauth_return_to') || '/policies/create';
        sessionStorage.removeItem('sc_oauth_return_to');
        router.replace(`${returnTo}?isLoggedIn=true`);
      } catch (err) {
        setExchangeError(
          err instanceof Error ? err.message : '로그인 처리 중 알 수 없는 오류가 발생했습니다.'
        );
      }
    };

    exchangeCode();
  }, [oauthError, code, redirectUri, getCodeVerifier, clearVerifier, router]);

  const error = oauthError ?? (exchangeError ? 'EXCHANGE_FAILED' : null);

  if (error) {
    const message = oauthError
      ? ERROR_MESSAGES[oauthError] || `로그인 중 오류가 발생했습니다. (${oauthError})`
      : exchangeError!;

    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm p-8 border border-black/10 dark:border-white/10 rounded-2xl space-y-5 bg-white/70 dark:bg-white/5 text-center">
          <span className="text-xs font-bold text-red-500 tracking-wider">LOGIN FAILED</span>
          <h1 className="text-xl font-bold">로그인에 실패했습니다</h1>
          <p className="text-sm opacity-70 leading-relaxed">{message}</p>
          {oauthError && <p className="text-[11px] opacity-40 font-mono break-all">{oauthError}</p>}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => login()}
              className="w-full py-2.5 navy-surface dark:bg-blue-500 dark:bg-none text-white font-semibold text-sm rounded-lg hover:brightness-110 dark:hover:bg-blue-400 transition"
            >
              다시 로그인하기
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full py-2.5 text-sm opacity-60 hover:opacity-100 transition"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-sm font-medium">로그인 처리 중입니다...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-sm font-medium">로그인 처리 중입니다...</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
