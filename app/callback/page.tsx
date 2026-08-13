'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // 로그인 성공 시 작성 페이지로 로그인 상태값과 함께 이동
    router.replace('/policies/create?isLoggedIn=true');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-sm font-medium">로그인 처리 중입니다...</p>
    </div>
  );
}