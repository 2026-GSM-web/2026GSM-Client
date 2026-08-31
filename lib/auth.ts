// 백엔드(school.https.gsmsv.site)가 DG(DataGSM) SSO 리다이렉트 체인을 직접 소유한다.
// 프론트는 GET /api/auth/dg/authorize로 풀 페이지 리다이렉트만 하면 되고, code/state를
// 다루거나 토큰을 저장할 책임이 없다 - Spring Security의 기본 oauth2Login 엔드포인트
// (/oauth2/authorization/{registrationId})가 아니라 백엔드가 자체 소유한 경로다.
// 로그인 성공 시 백엔드는 ACCESS_TOKEN을 httpOnly 쿠키로 설정한 뒤 콜백 페이지로
// 리다이렉트한다(URL에 토큰이 실리지 않음 - httpOnly라 JS로 읽을 수도 없음). 실제 로그인
// 여부는 콜백 페이지에서 쿠키를 자동으로 실어 보내는 /api/auth/me 호출로 확인한다.
export const OAUTH_RETURN_TO_KEY = 'sc_oauth_return_to';

export function startDataGsmLogin(returnTo: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
  if (!apiBaseUrl) {
    alert('로그인 서버 주소가 설정되지 않았습니다. 관리자에게 문의해 주세요.');
    return;
  }

  // 로그인 후 돌아갈 위치를 기억해둠 - 백엔드 리다이렉트는 고정된 한 주소로만 오기 때문에,
  // 실제 이동은 콜백 페이지에서 이 값을 읽어 처리함
  sessionStorage.setItem(OAUTH_RETURN_TO_KEY, returnTo);
  window.location.href = `${apiBaseUrl}/api/auth/dg/authorize`;
}
