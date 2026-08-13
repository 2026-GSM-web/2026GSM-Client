export default function MembersPage() {
  const executives = [
    { role: '회장 (2학년)', studentId: '2216', name: '한의준' },
    { role: '부회장 (2학년)', studentId: '2110', name: '박채은' },
    { role: '부회장 (1학년)', studentId: '1108', name: '김준수' },
  ];

  const departments = [
    {
      dept: '복지부',
      head: { role: '부장 (2학년)', studentId: '2115', name: '정윤서' },
      subHead: { role: '차장 (1학년)', studentId: '1215', name: '이다원' },
    },
    {
      dept: '전공부',
      head: { role: '부장 (2학년)', studentId: '2113', name: '정연돈' },
      subHead: { role: '차장 (1학년)', studentId: '1416', name: '임서하' },
    },
    {
      dept: '행사기획부',
      head: { role: '부장 (2학년)', studentId: '2310', name: '이찬진' },
      subHead: { role: '차장 (1학년)', studentId: '1218', name: '최형지' },
    },
    {
      dept: '정보통신부',
      head: { role: '부장 (2학년)', studentId: '2212', name: '정수진' },
      subHead: { role: '차장 (1학년)', studentId: '1113', name: '이시우' },
    },
    {
      dept: '문화체육부',
      head: { role: '부장 (2학년)', studentId: '2309', name: '이진서' },
      subHead: { role: '차장 (1학년)', studentId: '1205', name: '김민욱' },
    },
    {
      dept: '학생생활안전부',
      head: { role: '부장 (2학년)', studentId: '2208', name: '양은준' },
      subHead: { role: '차장 (1학년)', studentId: '1404', name: '김승우' },
    },
  ];

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold"> 학생회 부서별 명단</h1>
        <p className="text-sm opacity-60 mt-1">각 부서의 부장과 차장 정보입니다.</p>
      </div>

      <div>
        <h2 className="text-lg font-extrabold text-amber-600 dark:text-amber-500 mb-3">
          학생회장단
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {executives.map((e, idx) => (
            <div
              key={idx}
              className="p-5 border border-amber-500/40 rounded-2xl bg-amber-500/5 space-y-3 hover:border-amber-500/70 transition"
            >
              <div className="p-3 bg-white/60 dark:bg-zinc-800/60 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
                  {e.role}
                </span>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>{e.name}</span>
                  <span className="text-xs opacity-50 font-normal">{e.studentId}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((d, idx) => (
          <div
            key={idx}
            className="p-5 border border-black/10 dark:border-white/10 rounded-2xl bg-black/5 dark:bg-white/5 space-y-4 hover:border-amber-500/50 transition"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <h2 className="text-lg font-extrabold text-amber-600 dark:text-amber-500">
                {d.dept}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold">
                2명
              </span>
            </div>

            {/* 부장 (2학년) */}
            <div className="p-3 bg-white/60 dark:bg-zinc-800/60 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
                {d.head.role}
              </span>
              <div className="flex justify-between items-center text-sm font-bold">
                <span>{d.head.name}</span>
                <span className="text-xs opacity-50 font-normal">{d.head.studentId}</span>
              </div>
            </div>

            {/* 차장 (1학년) */}
            <div className="p-3 bg-white/60 dark:bg-zinc-800/60 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block">
                {d.subHead.role}
              </span>
              <div className="flex justify-between items-center text-sm font-bold">
                <span>{d.subHead.name}</span>
                <span className="text-xs opacity-50 font-normal">{d.subHead.studentId}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}