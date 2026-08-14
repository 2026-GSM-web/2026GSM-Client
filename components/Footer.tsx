export default function Footer() {
  return (
    <footer className="border-t border-black/10 dark:border-white/10 mt-24">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 py-10">
        <span className="font-bold text-base">GSM 학생회</span>
        <p className="text-sm opacity-60 mt-2 max-w-md">
          학생들의 목소리를 듣고 행동으로 답하는 학생 자치를 실현합니다.
        </p>
        <p className="text-xs opacity-40 mt-6">
          © {new Date().getFullYear()} GSM 학생회. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
