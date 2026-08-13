'use client';

import { Suspense, useEffect } from 'react';
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
  const { login } = useOAuth();

  const error = searchParams.get('error');

  useEffect(() => {
    if (error) return;
    // 로그인 성공 시 작성 페이지로 로그인 상태값과 함께 이동
    router.replace('/policies/create?isLoggedIn=true');
  }, [error, router]);

  if (error) {
    const message = ERROR_MESSAGES[error] || `로그인 중 오류가 발생했습니다. (${error})`;

    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm p-8 border border-black/10 dark:border-white/10 rounded-2xl space-y-5 bg-black/5 dark:bg-white/5 text-center">
          <span className="text-xs font-bold text-red-500 tracking-wider">LOGIN FAILED</span>
          <h1 className="text-xl font-bold">로그인에 실패했습니다</h1>
          <p className="text-sm opacity-70 leading-relaxed">{message}</p>
          <p className="text-[11px] opacity-40 font-mono break-all">{error}</p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => login()}
              className="w-full py-2.5 bg-amber-600 text-white font-semibold text-sm rounded-lg hover:bg-amber-700 transition"
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
