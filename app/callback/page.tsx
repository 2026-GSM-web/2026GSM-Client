'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OAUTH_RETURN_TO_KEY, startDataGsmLogin } from '@/lib/auth';

// 백엔드가 로그인 실패 시 쿼리스트링으로 돌려줄 수 있는 error 코드별 안내 문구
const ERROR_MESSAGES: Record<string, string> = {};

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const oauthError = searchParams.get('error');

  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    if (oauthError) return;

    // 백엔드가 school SSO 로그인을 끝낸 뒤 이 페이지로 `#token=<JWT>` 형태로 되돌려줌
    // (해시는 서버로 전송되지 않으므로 클라이언트에서 직접 읽어야 함)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = hashParams.get('token');

    if (!token) {
      // ESLint react-hooks/set-state-in-effect 경고를 회피하기 위해 한 스텝 지연
      const timer = setTimeout(() => {
        setTokenError('로그인 응답에서 인증 정보를 찾지 못했습니다. 다시 로그인해 주세요.');
      }, 0);
      return () => clearTimeout(timer);
    }

    localStorage.setItem('sc_jwt', token);

    // 로그인을 어디서 시작했는지에 따라 되돌아갈 위치가 달라짐(정책 제안 작성 / 관리자
    // 페이지 등). 로그인 시작 시 sessionStorage에 남겨둔 값을 읽고, 없으면 기존 기본
    // 동작(정책 제안 작성 페이지)으로 이동
    const returnTo = sessionStorage.getItem(OAUTH_RETURN_TO_KEY) || '/policies/create';
    sessionStorage.removeItem(OAUTH_RETURN_TO_KEY);
    router.replace(`${returnTo}?isLoggedIn=true`);
  }, [oauthError, router]);

  const error = oauthError ?? tokenError;

  if (error) {
    const message = oauthError
      ? ERROR_MESSAGES[oauthError] || `로그인 중 오류가 발생했습니다. (${oauthError})`
      : error;

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
              onClick={() => startDataGsmLogin('/policies/create')}
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
