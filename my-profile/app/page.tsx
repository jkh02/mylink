export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            진광현
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            상명대학교 컴퓨터과학과 4학년 재학중
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="h-1 w-12 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
        </div>

        <p className="max-w-[400px] text-zinc-500 text-sm leading-relaxed">
          안녕하세요. 컴퓨터 과학을 전공하며 다양한 기술에 관심을 가지고 학습하고 있는 대학생입니다. 
          심플하고 명확한 코드를 지향합니다.
        </p>
      </main>
    </div>
  );
}
