import localFont from 'next/font/local';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from './provider';

// 본문 전체 폰트
const nanumSquareNeo = localFont({
  src: [
    { path: './fonts/NanumSquareNeo-Light.woff2', weight: '300', style: 'normal' },
    { path: './fonts/NanumSquareNeo-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/NanumSquareNeo-Bold.woff2', weight: '700', style: 'normal' },
    { path: './fonts/NanumSquareNeo-ExtraBold.woff2', weight: '800', style: 'normal' },
    { path: './fonts/NanumSquareNeo-Heavy.woff2', weight: '900', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-nanumsquareneo',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning className={nanumSquareNeo.variable}>
      <body className="font-[family-name:var(--font-nanumsquareneo)] min-h-screen flex flex-col">
        <Providers>
          <Header />
          {/* 콘텐츠가 짧아도 푸터가 화면 중간에 뜨지 않고 항상 맨 아래에 붙도록.
              [&>*]:w-full: 안 넣으면 각 페이지 <main>이 mx-auto 때문에 stretch 대신
              content-fit으로 줄어들어서(플렉스 아이템 + auto 마진 조합의 스펙 동작)
              넓은 화면에서 좁게 눌린 것처럼 보이는 버그가 생김 */}
          <div className="flex-1 flex flex-col [&>*]:w-full">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
