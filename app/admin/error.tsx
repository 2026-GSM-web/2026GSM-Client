'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
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
        <h1 className="text-lg font-bold">관리자 대시보드를 불러오지 못했습니다</h1>
        <p className="text-sm opacity-60">일시적인 오류가 발생했어요. 다시 시도해 주세요.</p>
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="w-full py-2.5 navy-surface dark:bg-blue-500 dark:bg-none text-white font-semibold text-sm rounded-lg hover:brightness-110 dark:hover:bg-blue-400 transition"
          >
            다시 시도
          </button>
          <Link href="/" className="text-xs opacity-60 hover:opacity-100 transition">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
