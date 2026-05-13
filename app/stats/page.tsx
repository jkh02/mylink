"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { IconLoader2, IconArrowLeft, IconChartBar, IconLink, IconTrophy, IconCrown, IconMedal } from "@tabler/icons-react";
import { LinkItem } from "@/data/links";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";

const chartConfig = {
  clickCount: {
    label: "클릭 수",
    color: "hsl(var(--chart-1))",
  },
};

export default function StatsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/");
      } else {
        setUser(currentUser);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ['stats-links', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(collection(db, "users", user.uid, "links"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as LinkItem[];
    },
    enabled: !!user,
  });

  const totalClicks = links.reduce((acc, link) => acc + (link.clickCount || 0), 0);
  const totalLinks = links.length;
  
  // Sort links by click count descending
  const sortedLinks = [...links].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
  const topLink = sortedLinks.length > 0 ? sortedLinks[0] : null;
  const top5Links = sortedLinks.slice(0, 5);

  // Transform data for the chart
  const chartData = links.map(link => ({
    name: link.title.length > 8 ? link.title.substring(0, 8) + '...' : link.title,
    clickCount: link.clickCount || 0,
    fullTitle: link.title,
  }));

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-zinc-950">
        <IconLoader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="relative min-h-svh flex flex-col py-10 px-4 bg-[#fafafa] dark:bg-zinc-950 selection:bg-indigo-300 selection:text-white overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 -z-10 bg-[#fafafa] dark:bg-zinc-950 transition-colors duration-500">
        <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-indigo-300/20 to-purple-400/20 blur-[100px] dark:from-indigo-600/10 dark:to-purple-800/10" />
      </div>

      <div className="mx-auto w-full max-w-4xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors outline-none rounded-lg p-2 -ml-2"
          >
            <IconArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">대시보드로 돌아가기</span>
          </button>
        </div>

        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl shadow-sm border border-indigo-200/50 dark:border-indigo-500/30">
            <IconChartBar className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">클릭 통계</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">내 링크들이 얼마나 클릭되었는지 한눈에 파악해보세요.</p>
          </div>
        </div>

        {isLinksLoading ? (
          <div className="h-64 flex items-center justify-center">
            <IconLoader2 className="w-8 h-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Clicks Card */}
              <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <IconChartBar className="w-16 h-16 text-indigo-500" />
                </div>
                <CardHeader className="pb-2">
                  <CardDescription className="font-medium text-zinc-500 uppercase tracking-wider text-xs">총 클릭 수</CardDescription>
                  <CardTitle className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                    {totalClicks.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">전체 누적 클릭</p>
                </CardContent>
              </Card>

              {/* Total Links Card */}
              <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <IconLink className="w-16 h-16 text-emerald-500" />
                </div>
                <CardHeader className="pb-2">
                  <CardDescription className="font-medium text-zinc-500 uppercase tracking-wider text-xs">등록된 링크</CardDescription>
                  <CardTitle className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                    {totalLinks.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">운영 중인 링크 수</p>
                </CardContent>
              </Card>

              {/* Top Link Card */}
              <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <IconTrophy className="w-16 h-16 text-amber-500" />
                </div>
                <CardHeader className="pb-2">
                  <CardDescription className="font-medium text-zinc-500 uppercase tracking-wider text-xs">최고 인기 링크</CardDescription>
                  <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400 truncate mt-1">
                    {topLink && topLink.clickCount ? topLink.title : "-"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {topLink && topLink.clickCount ? `${topLink.clickCount.toLocaleString()} 클릭 달성` : "아직 클릭된 링크가 없습니다"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {links.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Card */}
                <Card className="col-span-1 lg:col-span-2 border-zinc-200/50 dark:border-zinc-800/50 shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-lg">링크별 클릭 수 비교</CardTitle>
                    <CardDescription>클릭 발생 빈도가 높은 순서를 한눈에 비교합니다.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px] w-full pt-4">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorClickCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--color-clickCount)" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="var(--color-clickCount)" stopOpacity={0.3}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.2} />
                          <XAxis 
                            dataKey="name" 
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            fontSize={12}
                          />
                          <YAxis 
                            tickLine={false} 
                            axisLine={false} 
                            fontSize={12}
                            tickFormatter={(value) => `${value}`}
                          />
                          <ChartTooltip 
                            cursor={{ fill: 'var(--color-clickCount)', opacity: 0.1 }} 
                            content={<ChartTooltipContent />} 
                          />
                          <Bar 
                            dataKey="clickCount" 
                            fill="url(#colorClickCount)" 
                            radius={[6, 6, 0, 0]} 
                            maxBarSize={50}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Top 5 Ranking List */}
                <Card className="col-span-1 border-zinc-200/50 dark:border-zinc-800/50 shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-lg">🔥 인기 랭킹 TOP 5</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {top5Links.map((link, index) => {
                        if ((link.clickCount || 0) === 0) return null;
                        
                        return (
                          <div key={link.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 transition-all hover:scale-[1.02]">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold">
                                {index === 0 && <IconCrown className="text-yellow-500 w-6 h-6" />}
                                {index === 1 && <IconMedal className="text-slate-400 w-6 h-6" />}
                                {index === 2 && <IconMedal className="text-amber-700 w-6 h-6" />}
                                {index > 2 && <span className="text-zinc-400 text-sm">{index + 1}</span>}
                              </div>
                              <div className="truncate">
                                <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 truncate">{link.title}</p>
                              </div>
                            </div>
                            <div className="flex-shrink-0 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {link.clickCount}
                            </div>
                          </div>
                        );
                      })}
                      {top5Links.filter(l => (l.clickCount || 0) > 0).length === 0 && (
                        <div className="text-center py-8 text-sm text-zinc-500">
                          아직 클릭된 링크가 없습니다.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {links.length === 0 && (
              <div className="py-16 text-center text-zinc-500 dark:text-zinc-400 bg-white/30 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 border-dashed">
                등록된 링크가 없습니다. 링크를 추가하고 클릭 통계를 확인해보세요!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
