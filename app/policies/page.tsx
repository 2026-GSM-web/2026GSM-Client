'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Comment {
  id: number;
  author: string;
  date: string;
  text: string;
}

interface Issue {
  id: string;
  title: string;
  author: string;
  dept: string;
  status: string;
  date: string;
  body: string;
  comments: Comment[];
}

export default function PoliciesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    // 1. 페이지 진입 시 localStorage 데이터 읽어오기
    const loadIssues = () => {
      const saved = localStorage.getItem('sc_issues');
      if (saved) {
        setIssues(JSON.parse(saved));
      }
    };

    loadIssues();

    // 2. 다른 탭이나 창에서 변경사항이 생길 때 실시간 동기화
    window.addEventListener('storage', loadIssues);
    return () => window.removeEventListener('storage', loadIssues);
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 space-y-6">
      <div className="flex justify-between items-end border-b border-black/10 dark:border-white/10 pb-4">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider">VOICE</span>
          <h1 className="text-2xl font-bold mt-1">정책 제안 게시판</h1>
        </div>
        <Link
          href="/policies/create"
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition"
        >
          + 정책 제안하기
        </Link>
      </div>

      <div className="space-y-4">
        {issues.length === 0 ? (
          <div className="text-center py-12 text-sm opacity-50">등록된 정책 제안이 없습니다.</div>
        ) : (
          issues.map((issue) => (
            <Link
              key={issue.id}
              href={`/policies/${issue.id}`}
              className="block p-5 border border-black/10 dark:border-white/10 rounded-xl hover:border-blue-600/50 dark:hover:border-blue-400/50 transition bg-white/70 dark:bg-white/5 space-y-2"
            >
              <div className="flex justify-between items-start">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    issue.status === '시행완료'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                      : issue.status === '검토중'
                      ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                      : 'bg-blue-600/10 text-blue-600 border-blue-600/30 dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/30'
                  }`}
                >
                  {issue.status}
                </span>
                <span className="text-xs opacity-40">{issue.date}</span>
              </div>
              <h2 className="font-bold text-base">{issue.title}</h2>
              <p className="text-xs opacity-60 line-clamp-2">{issue.body}</p>
              <div className="text-xs opacity-40 pt-2 flex justify-between">
                <span>{issue.dept} · {issue.author}</span>
                <span>답변 {issue.comments?.length || 0}개</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}