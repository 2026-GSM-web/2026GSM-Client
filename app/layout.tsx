import localFont from 'next/font/local';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from './provider';
import { AuthProvider } from './auth-provider';

// 본문 전체 폰트 - Pretendard 가변 폰트(1개 파일이 45~920 전체 굵기 범위를
// 커버). 이전 NanumSquareNeo는 300/400/700/800/900 다섯 개의 정적 굵기만
// 있어서 Tailwind의 font-medium(500)/font-semibold(600) 같은 클래스가
// 실제로 대응하는 파일 없이 렌더링됐는데, 가변 폰트라 이제 모든 굵기가
// 정확히 표현됨
const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  display: 'swap',
  variable: '--font-pretendard',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning className={pretendard.variable}>
      <body className="font-sans min-h-screen flex flex-col">
        <Providers>
          <AuthProvider>
            <Header />
            {/* 콘텐츠가 짧아도 푸터가 화면 중간에 뜨지 않고 항상 맨 아래에 붙도록.
                *:w-full: 안 넣으면 각 페이지 <main>이 mx-auto 때문에 stretch 대신
                content-fit으로 줄어들어서(플렉스 아이템 + auto 마진 조합의 스펙 동작)
                넓은 화면에서 좁게 눌린 것처럼 보이는 버그가 생김 */}
            <div className="flex-1 flex flex-col *:w-full">{children}</div>
            <Footer />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
