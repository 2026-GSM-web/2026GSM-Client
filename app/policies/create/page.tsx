'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useOAuth } from '@themoment-team/datagsm-oauth-react';

export default function CreatePolicyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useOAuth();

  // URL 파라미터 또는 localStorage를 통한 로그인 상태 확인
  const isLogged = searchParams.get('isLoggedIn') === 'true';

  const [form, setForm] = useState({
    author: '',
    dept: '회장단',
    title: '',
    body: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author || !form.title || !form.body) {
      return alert('모든 항목을 입력해주세요.');
    }

    const saved = localStorage.getItem('sc_issues');
    const currentIssues = saved ? JSON.parse(saved) : [];

    const newIssue = {
      id: `issue_${Date.now()}`,
      title: form.title,
      author: form.author,
      dept: form.dept,
      status: '검토중',
      date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      body: form.body,
      comments: [],
    };

    const updatedIssues = [newIssue, ...currentIssues];
    localStorage.setItem('sc_issues', JSON.stringify(updatedIssues));

    alert('정책 제안이 성공적으로 등록되었습니다.');
    router.push('/policies');
  };

  // ------------------------------------------------------------- //
  // 1. 로그인 전: 콜백 에러 화면과 동일하게 화면 중앙에 로그인 유도 카드만 표시
  // ------------------------------------------------------------- //
  if (!isLogged) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="p-8 border border-black/10 dark:border-white/10 rounded-2xl space-y-5 bg-white/70 dark:bg-white/5">
            <h1 className="text-2xl font-bold mb-3">정책 제안하기</h1>
            <p className="text-sm text-zinc-500 mb-8">
              학생회 정책 제안을 작성하려면 DataGSM 계정 로그인이 필요합니다.
            </p>
            <button
              type="button"
              onClick={() => login()}
              className="w-full py-3.5 navy-surface dark:bg-blue-500 dark:bg-none text-white font-semibold text-sm rounded-xl hover:brightness-110 dark:hover:bg-blue-400 transition"
            >
              DataGSM 계정으로 로그인하기
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ------------------------------------------------------------- //
  // 2. 로그인 후: 정책 제안 작성 폼 표시
  // ------------------------------------------------------------- //
  return (
    <main className="max-w-xl mx-auto px-6 py-12">
      <button
        onClick={() => router.back()}
        className="text-xs opacity-60 mb-6 hover:opacity-100"
      >
        ← 목록으로
      </button>

      <h1 className="text-2xl font-bold mb-6">정책 제안</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1">
                작성자 이름
              </label>
              <input
                type="text"
                placeholder="예: 2학년 3반 학생"
                className="w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 focus:outline-navy dark:focus:outline-blue-400"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">
                관련 부서
              </label>
              <select
                className="w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 focus:outline-navy dark:focus:outline-blue-400"
                value={form.dept}
                onChange={(e) => setForm({ ...form, dept: e.target.value })}
              >
                {[
                  '회장단',
                  '학생생활안전부',
                  '전공부',
                  '복지부',
                  '문화체육부',
                  '정보통신부',
                  '방송부',
                  '행가기획부',
                ].map((d) => (
                  <option key={d} value={d} className="dark:bg-zinc-800">
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">제목</label>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                className="w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 focus:outline-navy dark:focus:outline-blue-400"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">내용</label>
              <textarea
                rows={5}
                placeholder="내용을 자세히 작성해 주세요"
                className="w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 focus:outline-navy dark:focus:outline-blue-400"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 navy-surface dark:bg-blue-500 dark:bg-none text-white font-semibold text-sm rounded-lg hover:brightness-110 dark:hover:bg-blue-400 transition"
            >
              제안 등록하기
            </button>
      </form>
    </main>
  );
}