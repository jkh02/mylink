"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { LinkItem } from "@/data/links";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { IconLoader2, IconEdit, IconTrash, IconCheck, IconX } from "@tabler/icons-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const urlSchema = z.string().min(1, { message: "연결할 URL 주소를 입력해주세요." }).refine((val) => {
  try {
    const finalUrl = val.trim().startsWith("http") ? val.trim() : `https://${val.trim()}`;
    const urlObj = new URL(finalUrl);
    return urlObj.hostname.includes(".");
  } catch {
    return false;
  }
}, {
  message: "올바른 형태의 URL 주소를 입력해주세요 (예: instagram.com/my_id)."
});

const formSchema = z.object({
  title: z.string().min(1, { message: "링크 제목을 입력해주세요." }),
  url: urlSchema,
});

function InlineEditForm({ 
  link, 
  onCancel, 
  onSave 
}: { 
  link: LinkItem; 
  onCancel: () => void; 
  onSave: (id: string, title: string, url: string, faviconUrl: string | undefined) => void; 
}) {
  const [isSaving, setIsSaving] = useState(false);
  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: link.title, url: link.url },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    let parsedDomain = "";
    let finalUrl = "";
    try {
      finalUrl = values.url.trim().startsWith("http") ? values.url.trim() : `https://${values.url.trim()}`;
      const urlObj = new URL(finalUrl);
      parsedDomain = urlObj.hostname;
    } catch (err) {}
    const faviconUrl = parsedDomain ? `https://s2.googleusercontent.com/s2/favicons?domain=${parsedDomain}` : undefined;
    
    // UX 개선: 처리 속도가 너무 빨라 스피너가 안 보이는 현상 방지를 위한 인위적 지연
    await new Promise(resolve => setTimeout(resolve, 600));

    await onSave(link.id, values.title, finalUrl, faviconUrl);
    setIsSaving(false);
  };

  return (
    <Card className="relative flex items-center p-4 min-h-[4rem] h-auto overflow-hidden border border-indigo-400/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-lg rounded-xl z-20 w-full">
      <Form {...editForm}>
        <form onSubmit={editForm.handleSubmit(onSubmit)} className="flex w-full items-start gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <FormField
              control={editForm.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <Input placeholder="링크 제목" className="h-8" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="url"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <Input placeholder="URL 주소" className="h-8 text-xs" type="text" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-1 items-center justify-center shrink-0">
            <Button type="submit" size="icon" variant="ghost" className="h-7 w-7 text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400" disabled={isSaving}>
              {isSaving ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconCheck className="h-4 w-4" />}
            </Button>
            <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-zinc-400 hover:text-red-500" onClick={onCancel} disabled={isSaving}>
              <IconX className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}

export default function Page() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [deletingLink, setDeletingLink] = useState<LinkItem | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Authentication Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;
      
      // 사용자 고유 UID 기반으로 문서 레퍼런스 생성
      const userRef = doc(db, "users", loggedInUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // 최초 가입 시 데이터 저장
        await setDoc(userRef, {
          email: loggedInUser.email,
          displayName: loggedInUser.displayName,
          photoUrl: loggedInUser.photoURL,
          bio: "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // 기존 유저 로그인 시 최근 접속(수정) 시간만 업데이트
        await setDoc(userRef, {
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (error) {
      console.error("로그인 에러:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("로그아웃 에러:", error);
    }
  };

  const handleDelete = async () => {
    if (!deletingLink || !user) return;
    setIsActionLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      await deleteDoc(doc(db, "users", user.uid, "links", deletingLink.id));
      setDeletingLink(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdate = async (id: string, title: string, url: string, faviconUrl: string | undefined) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "links", id), {
        title, 
        url, 
        faviconUrl,
        updatedAt: serverTimestamp()
      });
      setEditingLinkId(null);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!user) {
      setLinks([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const q = query(collection(db, "users", user.uid, "links"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchLinks: LinkItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        url: doc.data().url,
        faviconUrl: doc.data().faviconUrl,
        createdAt: doc.data().createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.().toISOString() || undefined,
      }));
      setLinks(fetchLinks);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    let parsedDomain = "";
    let finalUrl = "";
    try {
      finalUrl = values.url.trim().startsWith("http") ? values.url.trim() : `https://${values.url.trim()}`;
      const urlObj = new URL(finalUrl);
      parsedDomain = urlObj.hostname;
    } catch (err) {}

    const faviconUrl = parsedDomain 
      ? `https://s2.googleusercontent.com/s2/favicons?domain=${parsedDomain}`
      : undefined;

    if (!user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "links"), {
        title: values.title,
        url: finalUrl,
        faviconUrl: faviconUrl || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("링크 추가 중 오류 발생:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-svh flex-col items-center py-8 px-4 selection:bg-indigo-300 selection:text-white overflow-hidden">
      
      {/* Dynamic Backgrounds (Glow Orbs) */}
      <div className="fixed inset-0 -z-10 bg-[#fafafa] dark:bg-zinc-950 transition-colors duration-500">
        <div className="absolute top-[-15%] left-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-300/30 to-purple-400/30 blur-[100px] dark:from-indigo-600/20 dark:to-purple-800/20 animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-cyan-300/30 to-emerald-300/30 blur-[120px] dark:from-cyan-800/10 dark:to-emerald-900/10" />
      </div>

      {/* Header Area */}
      <header className="w-full max-w-md flex items-center justify-end mb-8 relative z-20">
        {!isAuthLoading && (
          user ? (
            <div className="flex items-center gap-3 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/40 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-2">
                {user.photoURL && (
                  <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full" />
                )}
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{user.displayName}</span>
              </div>
              <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700" />
              <Button variant="ghost" size="sm" onClick={handleLogout} className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
                로그아웃
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleLogin} className="rounded-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-zinc-800 transition-all">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google로 시작하기
            </Button>
          )
        )}
      </header>

      <div className="flex w-full max-w-md flex-col items-center gap-10 relative z-10">
        
        {/* Conditional View */}
        {isAuthLoading ? (
          <div className="flex flex-col items-center gap-4 mt-20">
            <IconLoader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-zinc-500 font-medium animate-pulse">로딩 중...</p>
          </div>
        ) : !user ? (
          /* Logged Out View */
          <div className="flex flex-col items-center gap-6 mt-10 px-4 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-8">
              모든 링크를 <br />하나의 페이지에.
            </h1>
            <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-[280px] leading-relaxed">
              크리에이터, 인플루언서, 브랜드를 위한 나만의 멀티 링크 페이지를 만들어보세요.
            </p>
            <div className="mt-8 p-6 rounded-3xl bg-white/50 dark:bg-zinc-900/40 border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-xl w-full flex flex-col gap-4">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                지금 바로 시작하려면 로그인하세요 👇
              </p>
              <Button size="lg" onClick={handleLogin} className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all text-base font-semibold h-14">
                Google 계정으로 로그인
              </Button>
            </div>
          </div>
        ) : (
          /* Logged In View (Dashboard) */
          <>
            {/* Profile Section */}
            <div className="flex flex-col items-center gap-5 mb-2">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-60 blur-md transition-opacity duration-500 group-hover:opacity-100 dark:opacity-40 dark:group-hover:opacity-80" />
                <div className="relative h-28 w-28 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 ring-[3px] ring-white dark:ring-zinc-900 shadow-2xl">
                  <img 
                    src={user.photoURL || "https://api.dicebear.com/7.x/notionists/svg?seed=mylink"}
                    alt="Profile avatar"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 text-center mt-1">
                <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-300 dark:to-white">
                  {user.displayName || "@mylink_user"}
                </h1>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 max-w-[280px] leading-relaxed">
                  나만의 특별한 링크 페이지를 만들고, 모든 채널을 한곳에서 연결하세요 ✨
                </p>
              </div>
            </div>

            {/* Links List */}
            <div className="flex flex-col gap-5 w-full">
          
          {/* Add Link Dialog */}
          <Button 
            variant="outline" 
            className="w-full rounded-2xl h-14 border-dashed border-2 bg-white/50 dark:bg-zinc-900/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 backdrop-blur-xl dark:text-zinc-200"
            onClick={() => setIsOpen(true)}
          >
            + 새 링크 추가하기
          </Button>

          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) form.reset(); }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>새 링크 추가</DialogTitle>
                <DialogDescription>
                  추가할 링크의 제목과 목적지 주소(URL)를 입력하세요. 구글 API를 통해 아이콘이 자동 결합됩니다.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>링크 제목</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 내 인스타그램" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL 주소</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/..." type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="mt-4">
                    <Button type="button" variant="ghost" onClick={() => { setIsOpen(false); form.reset(); }} disabled={isSubmitting}>
                      취소
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                          추가 중...
                        </>
                      ) : (
                        "추가하기"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={!!deletingLink} onOpenChange={(open) => !open && setDeletingLink(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-500">정말 삭제하시겠습니까?</DialogTitle>
                <DialogDescription className="mt-2 text-zinc-900 dark:text-zinc-100 font-semibold">
                  [{deletingLink?.title}] 링크를 삭제합니다.
                </DialogDescription>
                <DialogDescription className="mt-1 text-red-500 font-semibold">
                  이 작업은 되돌릴 수 없습니다.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button type="button" variant="ghost" onClick={() => setDeletingLink(null)} disabled={isActionLoading}>
                  취소
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isActionLoading}>
                  {isActionLoading ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  삭제하기
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {isLoading ? (
            <div className="flex flex-col gap-5 w-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-zinc-200/50 dark:bg-zinc-800/50 animate-pulse border border-zinc-200/50 dark:border-zinc-700/50" />
              ))}
            </div>
          ) : (
            links.map((link) => (
              editingLinkId === link.id ? (
                <InlineEditForm 
                  key={link.id} 
                  link={link} 
                  onCancel={() => setEditingLinkId(null)} 
                  onSave={handleUpdate} 
                />
              ) : (
                <div key={link.id} className="relative group w-full block">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
                  >
                    <Card className="relative flex items-center p-4 h-16 overflow-hidden border border-white/40 dark:border-white/10 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.3)] hover:border-white/80 dark:hover:border-white/20 rounded-xl pr-20">
                      
                      {/* Shine Animation Effect on Hover */}
                      <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/50 dark:via-white/5 to-transparent skew-x-[-20deg] transition-transform duration-700 ease-out group-hover:translate-x-[150%]" />
                      
                      {/* Icon Wrapper (Perfectly Absolute Centered) */}
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
                      
                      {/* Link Title (Perfectly Centered + Optically adjusted) */}
                      <div className="w-full text-center font-mono font-semibold tracking-wide mt-[2px] text-zinc-800 dark:text-zinc-200 transition-colors duration-300 group-hover:text-zinc-950 dark:group-hover:text-white">
                        {link.title}
                      </div>
                      
                    </Card>
                  </a>
                  
                  {/* Actions */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10 opacity-100">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); setEditingLinkId(link.id); }} className="h-8 w-8 text-zinc-400 hover:text-indigo-500 bg-white/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 backdrop-blur-md rounded-full shadow-sm">
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); setDeletingLink(link); }} className="h-8 w-8 text-zinc-400 hover:text-red-500 bg-white/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 backdrop-blur-md rounded-full shadow-sm">
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            ))
          )}
        </div>

          </>
        )}

        {/* Footer */}
        <p className="mt-12 text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
          Powered by MyLink
        </p>
      </div>
    </div>
  );
}
