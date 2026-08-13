'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useOAuth } from '@themoment-team/datagsm-oauth-react';

export default function CallbackError({
  error,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const { login } = useOAuth();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm p-8 border border-black/10 dark:border-white/10 rounded-2xl space-y-4 text-center bg-white/70 dark:bg-white/5">
        <span className="text-3xl block">🔑</span>
        <h1 className="text-lg font-bold">로그인 처리 중 문제가 발생했습니다</h1>
        <p className="text-sm opacity-60">다시 로그인을 시도해 주세요.</p>
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={() => login()}
            className="w-full py-2.5 bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition"
          >
            다시 로그인하기
          </button>
          <Link href="/" className="text-xs opacity-60 hover:opacity-100 transition">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
