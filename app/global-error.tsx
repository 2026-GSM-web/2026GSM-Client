'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    // global-error는 루트 레이아웃 전체를 대체하므로 html/body 태그를 직접 포함해야 함
    <html lang="ko">
      <body className="bg-white text-black dark:bg-zinc-900">
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-sm p-8 border border-black/10 dark:border-white/10 rounded-2xl space-y-4 text-center bg-white/70 dark:bg-white/5">
            <span className="text-3xl block">⚠️</span>
            <h1 className="text-lg font-bold">사이트에 문제가 발생했습니다</h1>
            <p className="text-sm opacity-60">불편을 드려 죄송합니다. 다시 시도해 주세요.</p>
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="w-full py-2.5 bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition"
            >
              다시 시도
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
