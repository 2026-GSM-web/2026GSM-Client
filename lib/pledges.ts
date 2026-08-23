export type PledgeStatus = '진행 중' | '시범 운영 중' | '완료';

export interface Pledge {
  id: string;
  title: string;
  subStatus: string;
  status: PledgeStatus;
}

export const STATUS_VALUES: PledgeStatus[] = ['진행 중', '시범 운영 중', '완료'];

export const defaultPledges: Pledge[] = [
  { id: 'p1', title: 'AI 프로 지원', subStatus: '', status: '진행 중' },
  { id: 'p2', title: '전공 동아리 활성화', subStatus: '', status: '진행 중' },
  { id: 'p3', title: '교내 대회 개최', subStatus: '', status: '진행 중' },
  { id: 'p4', title: '지필평가 금요일로 변경', subStatus: '', status: '진행 중' },
];

// localStorage에 예전 방식(done boolean 기반)의 데이터가 남아있을 수 있어
// status 값을 갖춘 유효한 형태인지 확인 후, 아니면 기본값으로 대체
export function isValidPledges(data: unknown): data is Pledge[] {
  return (
    Array.isArray(data) &&
    data.every((p) => p && typeof p.title === 'string' && STATUS_VALUES.includes(p.status))
  );
}

// 관리자 페이지와 공개 페이지가 같은 검증/기본값 로직을 공유하도록 여기서 한 번만 정의함 -
// 예전엔 두 파일에 복사돼 있어서 한쪽만 고치면 서로 다르게 동작하는 문제가 있었음
export function loadPledgesFromStorage(): Pledge[] {
  const saved = localStorage.getItem('sc_pledges');
  try {
    const parsed = saved ? JSON.parse(saved) : null;
    if (isValidPledges(parsed)) return parsed;
  } catch {
    // 저장된 값이 손상된 JSON이면 기본값으로 대체
  }
  localStorage.setItem('sc_pledges', JSON.stringify(defaultPledges));
  return defaultPledges;
}
