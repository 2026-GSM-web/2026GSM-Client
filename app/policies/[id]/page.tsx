'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

export default function PolicyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [issue, setIssue] = useState<Issue | null>(null);

  useEffect(() => {
    const loadIssue = () => {
      const saved = localStorage.getItem('sc_issues');
      if (saved) {
        const issues: Issue[] = JSON.parse(saved);
        // ID가 일치하거나 없는 경우 첫 번째 이슈 매칭
        const found = issues.find((i) => i.id === id) || issues[0];
        setIssue(found);
      }
    };

    loadIssue();
    window.addEventListener('storage', loadIssue);
    return () => window.removeEventListener('storage', loadIssue);
  }, [id]);

  if (!issue) {
    return <main className="max-w-2xl mx-auto px-6 py-12 text-xs opacity-50">불러오는 중...</main>;
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 space-y-6">
      <button
        onClick={() => router.back()}
        className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1"
      >
        ← 목록으로
      </button>

      <div className="space-y-2 border-b border-black/10 dark:border-white/10 pb-4">
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold border inline-block ${
          issue.status === '시행완료' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
          issue.status === '검토중' ? 'bg-navy/10 text-navy border-navy/30' :
          'bg-navy/10 text-navy border-navy/30 dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/30'
        }`}>
          {issue.status}
        </span>
        <h1 className="text-2xl font-bold mt-2">{issue.title}</h1>
        <p className="text-xs opacity-50">
          {issue.dept} · {issue.author} · {issue.date}
        </p>
      </div>

      <p className="text-sm leading-relaxed whitespace-pre-line">{issue.body}</p>

      {/* 답변/댓글 섹션 - 관리자 작성 답변 실시간 반영 */}
      <div className="pt-8 border-t border-black/10 dark:border-white/10 space-y-4">
        <h3 className="font-bold text-sm">
          답변/댓글 ({issue.comments.length})
        </h3>
        {issue.comments.length === 0 ? (
          <p className="text-xs opacity-50">아직 회장단 답변이 없습니다.</p>
        ) : (
          issue.comments.map((c) => (
            <div
              key={c.id}
              className="p-4 border border-black/10 dark:border-white/10 rounded-lg text-xs space-y-1 bg-white/70 dark:bg-white/5"
            >
              <div className="flex justify-between font-bold">
                <span className="text-navy dark:text-blue-400">{c.author}</span>
                <span className="opacity-40">{c.date}</span>
              </div>
              <p className="text-sm opacity-80">{c.text}</p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}