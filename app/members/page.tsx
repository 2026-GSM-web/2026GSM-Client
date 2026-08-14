export default function MembersPage() {
  const executives = [
    { role: '회장', studentId: '2216', name: '한의준' },
    { role: '부회장', studentId: '2110', name: '박채은' },
    { role: '부회장', studentId: '1108', name: '김준수' },
  ];

  const departments = [
    {
      dept: '복지부',
      color: 'text-amber-800/70 dark:text-amber-400/80',
      head: { role: '부장', studentId: '2115', name: '정윤서' },
      subHead: { role: '차장', studentId: '1215', name: '이다원' },
    },
    {
      dept: '전공부',
      color: 'text-blue-800/70 dark:text-blue-400/80',
      head: { role: '부장', studentId: '2113', name: '정연돈' },
      subHead: { role: '차장', studentId: '1416', name: '임서하' },
    },
    {
      dept: '행사기획부',
      color: 'text-emerald-800/70 dark:text-emerald-400/80',
      head: { role: '부장', studentId: '2310', name: '이찬진' },
      subHead: { role: '차장', studentId: '1218', name: '최형지' },
    },
    {
      dept: '정보통신부',
      color: 'text-violet-800/70 dark:text-violet-400/80',
      head: { role: '부장', studentId: '2212', name: '정수진' },
      subHead: { role: '차장', studentId: '1113', name: '이시우' },
    },
    {
      dept: '문화체육부',
      color: 'text-rose-800/70 dark:text-rose-400/80',
      head: { role: '부장', studentId: '2309', name: '이진서' },
      subHead: { role: '차장', studentId: '1205', name: '김민욱' },
    },
    {
      dept: '학생생활안전부',
      color: 'text-fuchsia-700/70 dark:text-fuchsia-400/80',
      head: { role: '부장', studentId: '2208', name: '양은준' },
      subHead: { role: '차장', studentId: '1404', name: '김승우' },
    },
    {
      dept: '방송부',
      color: 'text-cyan-700/70 dark:text-cyan-400/80',
      head: { role: '부장', studentId: '2401', name: '김민선' },
      subHead: { role: '차장', studentId: '1306', name: '송건호' },
    },
  ];

  return (
    <main className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">학생회 명단</h1>
      </div>

      <div>
        <h2 className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mb-3">
          학생회장단
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {executives.map((e, idx) => (
            <div
              key={idx}
              className="p-6 border border-black/10 dark:border-white/10 rounded-2xl shadow-sm bg-white/70 dark:bg-white/5"
            >
              <div className="text-xl font-bold">
                {e.name} <span className="text-xs font-normal opacity-50">{e.studentId}</span>
              </div>
              <div className="text-xs opacity-60 mt-1">{e.role}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((d, idx) => (
          <div
            key={idx}
            className="p-5 border border-black/10 dark:border-white/10 rounded-2xl shadow-sm bg-white/70 dark:bg-white/5"
          >
            <h2 className={`text-base font-bold pb-2 border-b border-black/10 dark:border-white/10 ${d.color}`}>
              {d.dept}
            </h2>

            <div className="mt-3 space-y-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">
                  {d.head.name} <span className="text-xs opacity-50 font-normal">{d.head.role}</span>
                </span>
                <span className="text-xs opacity-40">{d.head.studentId}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">
                  {d.subHead.name} <span className="text-xs opacity-50 font-normal">{d.subHead.role}</span>
                </span>
                <span className="text-xs opacity-40">{d.subHead.studentId}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}