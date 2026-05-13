"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { LinkItem } from "@/data/links";
import { collection, addDoc, serverTimestamp, query, orderBy, doc, updateDoc, deleteDoc, setDoc, getDoc, getDocs, where } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, updateProfile } from "firebase/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, auth } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { IconLoader2, IconEdit, IconTrash, IconCheck, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconCopy, IconEye, IconUserEdit, IconLogout, IconChartBar } from "@tabler/icons-react";

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

const profileSchema = z.object({
  displayName: z.string().min(2, { message: "닉네임은 2자 이상이어야 합니다." }).max(20, { message: "닉네임은 20자 이하여야 합니다." }),
  bio: z.string().max(100, { message: "소개글은 100자 이하여야 합니다." }).optional(),
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
  const queryClient = useQueryClient();

  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.uid],
    queryFn: async () => {
      if (!user) return null;
      const snap = await getDoc(doc(db, "users", user.uid));
      return snap.exists() ? snap.data() : null;
    },
    enabled: !!user,
  });

  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ['links', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(collection(db, "users", user.uid, "links"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(docSnap => ({
        id: docSnap.id,
        title: docSnap.data().title,
        url: docSnap.data().url,
        faviconUrl: docSnap.data().faviconUrl,
        createdAt: docSnap.data().createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.().toISOString() || undefined,
      })) as LinkItem[];
    },
    enabled: !!user,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [deletingLink, setDeletingLink] = useState<LinkItem | null>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(true);

  // Authentication Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (profile && isProfileOpen) {
      profileForm.reset({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
      });
      setIsDuplicateChecked(true); // 기존 본인 닉네임이므로 통과 상태로 시작
    }
  }, [profile, isProfileOpen, profileForm]);

  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  const handleDuplicateCheck = async () => {
    const newName = profileForm.getValues("displayName");
    if (!newName || newName.length < 2) {
      toast.error("올바른 닉네임을 입력해주세요 (최소 2자).");
      return;
    }
    if (newName === profile?.displayName) {
      setIsDuplicateChecked(true);
      toast.success("현재 사용 중인 닉네임입니다.");
      return;
    }
    
    setIsProfileSubmitting(true);
    try {
      const q = query(collection(db, "users"), where("displayName", "==", newName));
      const querySnapshot = await getDocs(q);
      
      let isDuplicate = false;
      querySnapshot.forEach((docSnap) => {
        if (docSnap.id !== user?.uid) isDuplicate = true;
      });
      
      if (isDuplicate) {
        toast.error("이미 누군가 사용 중인 닉네임입니다.");
        setIsDuplicateChecked(false);
      } else {
        toast.success("사용 가능한 닉네임입니다!");
        setIsDuplicateChecked(true);
      }
    } catch (error) {
      toast.error("중복 확인 중 오류가 발생했습니다.");
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const profileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      if (!user) throw new Error("No user");
      await updateDoc(doc(db, "users", user.uid), {
        displayName: values.displayName,
        bio: values.bio || "",
        updatedAt: serverTimestamp()
      });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: values.displayName });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.uid] });
      setIsProfileOpen(false);
      toast.success("프로필이 성공적으로 업데이트되었습니다.");
    },
    onError: () => toast.error("프로필 업데이트 중 오류가 발생했습니다.")
  });

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    if (!isDuplicateChecked) {
      toast.error("닉네임 중복 확인을 먼저 완료해주세요.");
      return;
    }
    profileMutation.mutate(values);
  };

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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("No user");
      await new Promise(resolve => setTimeout(resolve, 600)); // optimistic delay UX
      await deleteDoc(doc(db, "users", user.uid, "links", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', user?.uid] });
      setDeletingLink(null);
    }
  });

  const handleDelete = () => {
    if (deletingLink) deleteMutation.mutate(deletingLink.id);
  };

  const updateMutation = useMutation({
    mutationFn: async ({ id, title, url, faviconUrl }: any) => {
      if (!user) throw new Error("No user");
      await updateDoc(doc(db, "users", user.uid, "links", id), {
        title, 
        url, 
        faviconUrl,
        updatedAt: serverTimestamp()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', user?.uid] });
      setEditingLinkId(null);
    }
  });

  const handleUpdate = (id: string, title: string, url: string, faviconUrl: string | undefined) => {
    updateMutation.mutate({ id, title, url, faviconUrl });
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const addMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!user) throw new Error("No user");
      let parsedDomain = "";
      let finalUrl = values.url.trim().startsWith("http") ? values.url.trim() : `https://${values.url.trim()}`;
      try {
        const urlObj = new URL(finalUrl);
        parsedDomain = urlObj.hostname;
      } catch (err) {}

      const faviconUrl = parsedDomain 
        ? `https://s2.googleusercontent.com/s2/favicons?domain=${parsedDomain}`
        : undefined;

      await addDoc(collection(db, "users", user.uid, "links"), {
        title: values.title,
        url: finalUrl,
        faviconUrl: faviconUrl || null,
        clickCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', user?.uid] });
      form.reset();
      setIsOpen(false);
    },
    onError: (error) => {
      console.error("링크 추가 중 오류 발생:", error);
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addMutation.mutate(values);
  };

  return (
    <div className="relative flex min-h-svh flex-col items-center py-8 px-4 selection:bg-indigo-300 selection:text-white overflow-hidden">
      
      {/* Dynamic Backgrounds (Glow Orbs) */}
      <div className="fixed inset-0 -z-10 bg-[#fafafa] dark:bg-zinc-950 transition-colors duration-500">
        <div className="absolute top-[-15%] left-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-300/30 to-purple-400/30 blur-[100px] dark:from-indigo-600/20 dark:to-purple-800/20 animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-cyan-300/30 to-emerald-300/30 blur-[120px] dark:from-cyan-800/10 dark:to-emerald-900/10" />
      </div>

      {/* Header Area */}
      <header className="w-full max-w-md flex items-center justify-between mb-8 relative z-20">
        
        {/* Brand Logo */}
        <div 
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300 group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
            MyLink
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isAuthLoading && (user ? (
            <>
              <button
                onClick={() => window.open(`/@${profile?.displayName || user.displayName || user.uid}`, '_blank')}
                className="flex items-center gap-2 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/40 dark:border-white/10 shadow-sm hover:bg-white/80 dark:hover:bg-zinc-800/80 transition-all text-sm font-semibold text-zinc-700 dark:text-zinc-200 cursor-pointer"
              >
                <IconEye className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span className="hidden sm:inline">내 페이지</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                <div className="flex items-center gap-2 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/40 dark:border-white/10 shadow-sm hover:bg-white/80 dark:hover:bg-zinc-800/80 transition-all cursor-pointer">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  )}
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{profile?.displayName || user.displayName}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl">
                <div className="flex items-center gap-3 p-2 mb-1 px-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-700" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{profile?.displayName || user.displayName}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal truncate max-w-[150px]">{user.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-zinc-200/50 dark:bg-zinc-800/50" />
                
                <DropdownMenuItem 
                  className="rounded-xl p-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://mylink.com/@${profile?.displayName || user.displayName || user.uid}`);
                    toast.success("프로필 주소가 복사되었습니다.");
                  }}
                >
                  <IconCopy className="w-4 h-4 mr-3 text-zinc-500 dark:text-zinc-400" />
                  <span className="font-medium text-sm text-zinc-700 dark:text-zinc-300">내 링크 복사하기</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="rounded-xl p-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  onClick={() => window.open(`/@${profile?.displayName || user.displayName || user.uid}`, '_blank')}
                >
                  <IconEye className="w-4 h-4 mr-3 text-zinc-500 dark:text-zinc-400" />
                  <span className="font-medium text-sm text-zinc-700 dark:text-zinc-300">내 페이지 미리보기</span>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  className="rounded-xl p-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  onClick={() => setIsProfileOpen(true)}
                >
                  <IconUserEdit className="w-4 h-4 mr-3 text-zinc-500 dark:text-zinc-400" />
                  <span className="font-medium text-sm text-zinc-700 dark:text-zinc-300">프로필 편집</span>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  className="rounded-xl p-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                  onClick={() => window.location.href = '/stats'}
                >
                  <IconChartBar className="w-4 h-4 mr-3 text-indigo-500 dark:text-indigo-400" />
                  <span className="font-medium text-sm text-indigo-600 dark:text-indigo-400">통계 보기</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-zinc-200/50 dark:bg-zinc-800/50" />
                <DropdownMenuItem 
                  className="rounded-xl p-3 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  onClick={handleLogout}
                >
                  <IconLogout className="w-4 h-4 mr-3 text-red-500" />
                  <span className="font-bold text-sm text-red-500">로그아웃</span>
                </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden border-zinc-200/50 dark:border-zinc-800/50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl rounded-3xl shadow-2xl">
                  <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-bold">프로필 편집</DialogTitle>
                    <DialogDescription>
                      자신만의 닉네임과 짧은 소개를 작성해보세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-6 pt-4">
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>닉네임</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input 
                                    placeholder="닉네임" 
                                    className="bg-white/50 dark:bg-zinc-900/50" 
                                    {...field} 
                                    onChange={(e) => {
                                      field.onChange(e);
                                      setIsDuplicateChecked(false);
                                    }}
                                  />
                                </FormControl>
                                <Button 
                                  type="button" 
                                  variant={isDuplicateChecked ? "outline" : "default"} 
                                  onClick={handleDuplicateCheck}
                                  disabled={isProfileSubmitting || !field.value || field.value.length < 2}
                                >
                                  중복 확인
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>소개글</FormLabel>
                              <FormControl>
                                <Input placeholder="나를 표현하는 한 줄 소개" className="bg-white/50 dark:bg-zinc-900/50" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter className="mt-6 gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsProfileOpen(false)} className="rounded-xl">취소</Button>
                          <Button type="submit" disabled={isProfileSubmitting || !isDuplicateChecked} className="rounded-xl flex gap-2">
                            {isProfileSubmitting && <IconLoader2 className="w-4 h-4 animate-spin" />}
                            저장하기
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </div>
                </DialogContent>
              </Dialog>
            </>
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
        </div>
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
            <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-[280px] leading-relaxed break-keep">
              크리에이터, 인플루언서, 브랜드를 위한 <br />나만의 멀티 링크 페이지를 만들어보세요.
            </p>
            
            {/* Project Preview Image */}
            <div className="relative w-full max-w-sm mt-6 mb-2 overflow-hidden rounded-3xl shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white">
              <img 
                src="/landing-image.png" 
                alt="MyLink Connection" 
                className="w-full h-[240px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

            <div className="mt-4 p-6 rounded-3xl bg-white/50 dark:bg-zinc-900/40 border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-xl w-full flex flex-col gap-4">
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
                  {profile?.displayName || user.displayName || "@mylink_user"}
                </h1>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 max-w-[280px] leading-relaxed">
                  {profile?.bio || "나를 표현하는 한 줄 소개를 작성해보세요 ✨"}
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
                    <Button type="button" variant="ghost" onClick={() => { setIsOpen(false); form.reset(); }} disabled={addMutation.isPending}>
                      취소
                    </Button>
                    <Button type="submit" disabled={addMutation.isPending}>
                      {addMutation.isPending ? (
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
                <Button type="button" variant="ghost" onClick={() => setDeletingLink(null)} disabled={deleteMutation.isPending}>
                  취소
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  삭제하기
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {isLinksLoading ? (
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
                      
                      {/* Click Count */}
                      <div className="absolute right-20 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100/50 dark:bg-zinc-800/50 px-2.5 py-1 rounded-full border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15.004 5.925L13.5 12h5.5l-9.504 11.075L11 17H5.5z"/></svg>
                        {link.clickCount || 0}
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
