import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "클릭 통계",
  description: "내 링크들의 클릭 성과를 실시간으로 분석하세요. 인기 링크 순위, 총 클릭 수, 링크별 비교 차트를 한눈에 확인할 수 있습니다.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
