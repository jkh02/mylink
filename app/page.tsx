import { dummyLinks } from "@/data/links";
import { Card } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col items-center py-16 px-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        
        {/* Profile Placeholder */}
        <div className="flex flex-col items-center gap-4 mb-2">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 ring-4 ring-white dark:ring-zinc-900 shadow-lg" />
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">@mylink_user</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
              하나의 링크로 내 모든 채널을 연결하세요
            </p>
          </div>
        </div>

        {/* Links List */}
        <div className="flex flex-col gap-4 w-full">
          {dummyLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Card className="group relative flex items-center p-4 shadow-sm hover:shadow-md transition-shadow transition-colors border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-100/50 to-transparent dark:via-zinc-800/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                
                {/* Icon Wrapper */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50">
                  {link.faviconUrl ? (
                    <img 
                      src={link.faviconUrl} 
                      alt={`${link.title} icon`} 
                      className="h-6 w-6 rounded-sm object-contain" 
                    />
                  ) : (
                    <div className="h-6 w-6 bg-zinc-300 dark:bg-zinc-600 rounded-sm" />
                  )}
                </div>
                
                {/* Link Title */}
                <div className="flex-1 text-center font-medium pr-12 text-zinc-800 dark:text-zinc-200">
                  {link.title}
                </div>
              </Card>
            </a>
          ))}
        </div>

        {/* Footer Placeholder */}
        <p className="mt-8 text-xs font-medium text-zinc-400 dark:text-zinc-600">
          Powered by MyLink
        </p>
      </div>
    </div>
  );
}
