"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { IconLoader2 } from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { LinkItem } from "@/data/links";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ displayName: string }>;
}) {
  const unwrappedParams = use(params);
  const rawName = unwrappedParams.displayName;
  // 파라미터에서 @ 기호를 제거합니다.
  const cleanName = decodeURIComponent(rawName).replace(/^@/, "");

  const { data: userProfile, isLoading: isUserLoading } = useQuery({
    queryKey: ['public-profile', cleanName],
    queryFn: async () => {
      const q = query(collection(db, "users"), where("displayName", "==", cleanName));
      const snap = await getDocs(q);
      if (snap.empty) {
        return null;
      }
      const docData = snap.docs[0];
      return { id: docData.id, ...docData.data() } as any;
    },
    retry: false,
  });

  if (!isUserLoading && !userProfile) {
    notFound();
  }

  const userId = userProfile?.id;

  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ['public-links', userId],
    queryFn: async () => {
      if (!userId) return [];
      const q = query(collection(db, "users", userId, "links"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as LinkItem[];
    },
    enabled: !!userId,
  });

  const handleLinkClick = async (e: React.MouseEvent, link: LinkItem) => {
    e.preventDefault(); // 기본 a 태그 이동 방지
    if (!userId) return;

    // 1. 새 창으로 먼저 이동시킵니다.
    window.open(link.url, '_blank', 'noopener,noreferrer');

    // 2. 비동기로 안전하게 클릭수를 업데이트합니다.
    try {
      await updateDoc(doc(db, "users", userId, "links", link.id), {
        clickCount: increment(1)
      });
    } catch (e) {
      console.error("Click count update failed", e);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-zinc-950">
        <IconLoader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center py-16 px-4 selection:bg-indigo-300 selection:text-white overflow-hidden">
      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 -z-10 bg-[#fafafa] dark:bg-zinc-950 transition-colors duration-500">
        <div className="absolute top-[-15%] left-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-300/30 to-purple-400/30 blur-[100px] dark:from-indigo-600/20 dark:to-purple-800/20 animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-cyan-300/30 to-emerald-300/30 blur-[120px] dark:from-cyan-800/10 dark:to-emerald-900/10" />
      </div>

      <div className="flex w-full max-w-md flex-col items-center gap-10 relative z-10">
        
        {/* Profile Card */}
        <div className="flex flex-col items-center gap-5">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-60 blur-md transition-opacity duration-500 group-hover:opacity-100 dark:opacity-40 dark:group-hover:opacity-80" />
            <div className="relative h-28 w-28 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 ring-[3px] ring-white dark:ring-zinc-900 shadow-2xl">
              <img 
                src={userProfile?.photoUrl || "https://api.dicebear.com/7.x/notionists/svg?seed=mylink"}
                alt="Profile avatar"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2 text-center mt-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-300 dark:to-white">
              {userProfile?.displayName}
            </h1>
            <p className="text-base font-medium text-zinc-600 dark:text-zinc-400 max-w-[280px] leading-relaxed">
              {userProfile?.bio || "나를 표현하는 한 줄 소개를 작성해보세요 ✨"}
            </p>
          </div>
        </div>

        {/* Links List */}
        <div className="flex flex-col gap-5 w-full">
          {isLinksLoading ? (
            <div className="flex flex-col gap-5 w-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-zinc-200/50 dark:bg-zinc-800/50 animate-pulse border border-zinc-200/50 dark:border-zinc-700/50" />
              ))}
            </div>
          ) : (
            links.map((link) => (
              <div key={link.id} className="relative group w-full block">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleLinkClick(e, link)}
                  className="w-full block outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
                >
                  <Card className="relative flex items-center p-4 h-16 overflow-hidden border border-white/40 dark:border-white/10 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.3)] hover:border-white/80 dark:hover:border-white/20 rounded-xl pr-20">
                    
                    {/* Shine Animation Effect on Hover */}
                    <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/50 dark:via-white/5 to-transparent skew-x-[-20deg] transition-transform duration-700 ease-out group-hover:translate-x-[150%]" />
                    
                    {/* Icon Wrapper */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100/90 dark:bg-zinc-800/90 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 transition-transform duration-300 group-hover:scale-110">
                      {link.faviconUrl ? (
                        <img 
                          src={link.faviconUrl} 
                          alt={`${link.title} icon`} 
                          className="h-6 w-6 rounded-full object-contain" 
                        />
                      ) : (
                        <div className="h-6 w-6 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                      )}
                    </div>
                    
                    {/* Link Title */}
                    <div className="w-full text-center font-mono font-semibold tracking-wide mt-[2px] text-zinc-800 dark:text-zinc-200 transition-colors duration-300 group-hover:text-zinc-950 dark:group-hover:text-white">
                      {link.title}
                    </div>
                  </Card>
                </a>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-8 text-center text-xs text-zinc-400 font-mono tracking-wide">
          Powered by MyLink
        </div>

      </div>
    </div>
  );
}
