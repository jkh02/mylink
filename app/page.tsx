"use client";

import { useState } from "react";
import { dummyLinks, LinkItem } from "@/data/links";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

export default function Page() {
  const [links, setLinks] = useState<LinkItem[]>(dummyLinks);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
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

    const newLink: LinkItem = {
      id: `local-link-${Date.now()}`,
      title: values.title,
      url: finalUrl,
      faviconUrl,
      createdAt: new Date().toISOString(),
    };

    setLinks([newLink, ...links]);
    form.reset();
    setIsOpen(false);
  };

  return (
    <div className="relative flex min-h-svh flex-col items-center py-16 px-4 selection:bg-indigo-300 selection:text-white overflow-hidden">
      
      {/* Dynamic Backgrounds (Glow Orbs) */}
      <div className="fixed inset-0 -z-10 bg-[#fafafa] dark:bg-zinc-950 transition-colors duration-500">
        <div className="absolute top-[-15%] left-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-300/30 to-purple-400/30 blur-[100px] dark:from-indigo-600/20 dark:to-purple-800/20 animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-cyan-300/30 to-emerald-300/30 blur-[120px] dark:from-cyan-800/10 dark:to-emerald-900/10" />
      </div>

      <div className="flex w-full max-w-md flex-col items-center gap-10 relative z-10">
        
        {/* Profile Section */}
        <div className="flex flex-col items-center gap-5 mb-2">
          {/* Avatar with Glow Ring */}
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-60 blur-md transition-opacity duration-500 group-hover:opacity-100 dark:opacity-40 dark:group-hover:opacity-80" />
            <div className="relative h-28 w-28 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 ring-[3px] ring-white dark:ring-zinc-900 shadow-2xl">
              <img 
                src="https://api.dicebear.com/7.x/notionists/svg?seed=mylink"
                alt="Profile avatar"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2 text-center mt-1">
            <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-300 dark:to-white">
              @mylink_user
            </h1>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 max-w-[280px] leading-relaxed">
              나만의 특별한 링크 페이지를 만들고, 모든 채널을 한곳에서 연결하세요 ✨
            </p>
          </div>
        </div>

        {/* Links List */}
        <div className="flex flex-col gap-5 w-full">
          
          {/* Add Link Dialog */}
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) form.reset(); }}>
            <DialogTrigger render={<Button variant="outline" className="w-full rounded-2xl h-14 border-dashed border-2 bg-white/50 dark:bg-zinc-900/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 backdrop-blur-xl dark:text-zinc-200" />}>
              + 새 링크 추가하기
            </DialogTrigger>
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
                    <Button type="button" variant="ghost" onClick={() => { setIsOpen(false); form.reset(); }}>
                      취소
                    </Button>
                    <Button type="submit">추가하기</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full block outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
            >
              <Card className="relative flex items-center p-4 h-16 overflow-hidden border border-white/40 dark:border-white/10 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.3)] hover:border-white/80 dark:hover:border-white/20 rounded-xl">
                
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
          ))}
        </div>

        {/* Footer */}
        <p className="mt-12 text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
          Powered by MyLink
        </p>
      </div>
    </div>
  );
}
