'use client';

import { useEffect } from 'react';

export default function HomeError({
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
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm p-8 border border-black/10 dark:border-white/10 rounded-2xl space-y-4 text-center bg-white/70 dark:bg-white/5">
        <span className="text-3xl block">📊</span>
        <h1 className="text-lg font-bold">공약 정보를 불러오지 못했습니다</h1>
        <p className="text-sm opacity-60">일시적인 오류가 발생했어요. 다시 시도해 주세요.</p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="w-full py-2.5 bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition"
        >
          다시 시도
        </button>
      </div>
    </main>
  );
}
