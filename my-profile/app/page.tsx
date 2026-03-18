import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fdfcee] text-foreground font-[family-name:var(--font-geist-sans)] selection:bg-[#fde047] selection:text-black">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 p-4 neo-border border-b-4 border-l-0 border-r-0 border-t-0 flex flex-col md:flex-row justify-between items-center bg-white gap-4">
        <div className="font-black text-2xl uppercase tracking-widest text-black text-center">
          Gwanghyun Jin
        </div>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 w-full md:w-auto">
          <a href="#about" className="font-bold text-sm sm:text-base px-3 sm:px-4 py-2 hover:bg-[#fde047] hover:text-black transition-colors neo-border bg-black text-white leading-none flex items-center">About</a>
          <a href="#projects" className="font-bold text-sm sm:text-base px-3 sm:px-4 py-2 hover:bg-[#fde047] hover:text-black transition-colors neo-border bg-black text-white leading-none flex items-center">Projects</a>
          <a href="#contact" className="font-bold text-sm sm:text-base px-3 sm:px-4 py-2 hover:bg-[#fde047] hover:text-black transition-colors neo-border bg-black text-white leading-none flex items-center">Contact</a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col gap-16 md:gap-24 overflow-hidden">
        
        {/* 1. Hero Section */}
        <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 sm:gap-12">
          <div className="flex-1 space-y-6 sm:space-y-8 w-full text-center md:text-left">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase leading-none tracking-tight break-words text-black drop-shadow-[3px_3px_0px_#fff]">
              Developer <br className="hidden md:block"/>
              <span className="inline-block bg-[#fde047] px-2 mt-2 md:mt-4 text-black border-4 border-black">Gwanghyun</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-bold border-black md:border-l-8 md:pl-4">
              상명대학교 컴퓨터과학과 4학년<br/>
              심플하고 명확한 코드를 지향하는 학생.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center md:justify-start gap-4 sm:gap-6">
              <a href="#projects" className="neo-hover-effect neo-border bg-black px-8 py-4 font-black text-lg text-white inline-block uppercase w-full sm:w-auto text-center hover:bg-[#fde047] hover:text-black">
                View Works
              </a>
              <a href="#contact" className="neo-hover-effect neo-border bg-white px-8 py-4 font-black text-lg text-black inline-block uppercase w-full sm:w-auto text-center hover:bg-[#fde047]">
                Say Hello
              </a>
            </div>
          </div>
          {/* Avatar Area */}
          <div className="flex justify-center md:justify-end w-full md:w-auto shrink-0 mb-6 md:mb-0">
            <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full neo-border neo-shadow bg-[#fde047] overflow-hidden relative group">
              <div className="absolute inset-0 flex items-center justify-center text-7xl sm:text-8xl lg:text-9xl select-none group-hover:scale-110 transition-transform duration-500">
                🚀
              </div>
            </div>
          </div>
        </section>

        {/* 2. About Section */}
        <section id="about" className="pt-8">
          <div className="flex justify-center md:justify-start mb-8">
            <h2 className="text-4xl sm:text-5xl font-black uppercase inline-block bg-black px-4 py-1 text-white neo-border neo-shadow">
              About Me
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="neo-border neo-shadow bg-white p-6 sm:p-8 space-y-4 text-base sm:text-lg font-bold leading-relaxed text-black">
              <p>
                안녕하세요! 기술을 통해 복잡한 문제를 단순하게 풀어내는 것을 좋아하는 진광현입니다.
              </p>
              <p>
                웹 개발과 모바일 앱 개발부터 백엔드, 최근에는 AI 및 머신러닝 분야의 다양한 기술에 관심을 두고 꾸준히 학습 중입니다.
              </p>
              <p>
                단순히 돌아가는 코드가 아니라, 유지보수하기 좋고 사용자 경험을 섬세하게 고려한 소프트웨어를 만드는 데 목표를 두고 있습니다.
              </p>
            </div>
            
            <div className="neo-border neo-shadow bg-gray-100 p-6 sm:p-8 text-black flex flex-col">
              <h3 className="text-2xl sm:text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2 inline-block">My Skills</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-2">
                {['JS / TS', 'React', 'Next.js', 'Tailwind', 'Python', 'Git', 'Java', 'C / C++'].map((skill) => (
                  <span key={skill} className="bg-white neo-border px-3 py-1 font-black text-sm uppercase">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Projects Section */}
        <section id="projects" className="pt-8">
          <div className="flex justify-center md:justify-start mb-8">
            <h2 className="text-4xl sm:text-5xl font-black uppercase inline-block bg-black px-4 py-1 text-white neo-border neo-shadow">
              Projects
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Project Card 1 */}
            <div className="neo-border bg-white flex flex-col h-full neo-hover-effect group overflow-hidden">
              <div className="h-40 sm:h-48 bg-gray-200 border-b-4 border-black p-4 flex items-center justify-center text-2xl sm:text-3xl font-black group-hover:bg-[#fde047] transition-colors text-black text-center break-words">
                Personal Profile
              </div>
              <div className="p-5 sm:p-6 flex flex-col flex-grow text-black">
                <h3 className="text-xl sm:text-2xl font-black mb-2 uppercase">My Profile</h3>
                <p className="flex-grow font-bold mb-6 text-sm sm:text-base">
                  Next.js와 Tailwind CSS를 활용해 개발한 개인 프로필(이력서) 포고 랜딩페이지입니다. 네오브루탈리즘 스타일을 시도했습니다.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-black px-2 py-1 bg-[#fde047] text-black neo-border border-2">Next.js</span>
                  <span className="text-xs font-black px-2 py-1 bg-[#fde047] text-black neo-border border-2">Tailwind</span>
                </div>
                <a href="https://github.com/jkh02/mylink" target="_blank" rel="noreferrer" className="block w-full text-center bg-black text-white font-black uppercase py-3 neo-border hover:bg-[#fde047] hover:text-black transition-colors">
                  View Source
                </a>
              </div>
            </div>
            
            {/* Project Card 2 */}
            <div className="neo-border bg-white flex flex-col h-full neo-hover-effect group overflow-hidden">
              <div className="h-40 sm:h-48 bg-gray-200 border-b-4 border-black p-4 flex items-center justify-center text-2xl sm:text-3xl font-black group-hover:bg-[#fde047] transition-colors text-black text-center break-words">
                Study Archive
              </div>
              <div className="p-5 sm:p-6 flex flex-col flex-grow text-black">
                <h3 className="text-xl sm:text-2xl font-black mb-2 uppercase">Dev Notes</h3>
                <p className="flex-grow font-bold mb-6 text-sm sm:text-base">
                  대학 전공 과목 및 개인적으로 공부한 내용을 정리해둔 기록 보관소입니다. 마크다운 기반으로 정리하고 있습니다.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-black px-2 py-1 bg-[#fde047] text-black neo-border border-2">Markdown</span>
                  <span className="text-xs font-black px-2 py-1 bg-[#fde047] text-black neo-border border-2">CS</span>
                </div>
                <a href="#" className="block w-full text-center bg-[#fdfcee] text-black font-black uppercase py-3 neo-border hover:bg-black hover:text-white transition-colors">
                  Coming Soon
                </a>
              </div>
            </div>

            {/* Project Card 3 */}
            <div className="neo-border bg-white flex flex-col h-full neo-hover-effect group overflow-hidden">
              <div className="h-40 sm:h-48 bg-gray-200 border-b-4 border-black p-4 flex items-center justify-center text-2xl sm:text-3xl font-black group-hover:bg-[#fde047] transition-colors text-black text-center break-words">
                More XAI..
              </div>
              <div className="p-5 sm:p-6 flex flex-col flex-grow text-black">
                <h3 className="text-xl sm:text-2xl font-black mb-2 uppercase">XAI Chatbot</h3>
                <p className="flex-grow font-bold mb-6 text-sm sm:text-base">
                  설명가능한 AI를 활용하여 개인 맞춤형 공공 정책을 추천해 주는 챗봇 서비스 프로토타입.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-black px-2 py-1 bg-[#fde047] text-black neo-border border-2">Python</span>
                  <span className="text-xs font-black px-2 py-1 bg-[#fde047] text-black neo-border border-2">LLM</span>
                </div>
                <button disabled className="block w-full text-center bg-gray-300 text-black font-black uppercase py-3 neo-border cursor-not-allowed">
                  Private
                </button>
              </div>
            </div>
            
          </div>
        </section>

        {/* 4. Contact Section */}
        <section id="contact" className="pt-8 pb-16">
          <div className="neo-border bg-[#fde047] p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center text-center neo-shadow text-black overflow-hidden break-words">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase mb-6 drop-shadow-[2px_2px_0px_#fff]">Let&apos;s Connect!</h2>
            <p className="text-lg sm:text-xl font-bold mb-8 max-w-2xl">
              함께 멋진 프로젝트를 만들어가고 싶거나, 제안해주실 흥미로운 아이디어가 있다면 언제든지 연락주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <a href="mailto:jkh02@example.com" className="neo-hover-effect bg-white px-6 py-4 font-black text-lg uppercase neo-border flex items-center justify-center gap-2 w-full sm:w-auto">
                <span className="text-2xl">✉️</span> Email Me
              </a>
              <a href="https://github.com/jkh02" target="_blank" rel="noreferrer" className="neo-hover-effect bg-black text-white px-6 py-4 font-black text-lg uppercase neo-border !border-black flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-colors w-full sm:w-auto">
                <span className="text-2xl">🐈</span> GitHub
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-black text-white p-6 neo-border border-b-0 border-l-0 border-r-0 !border-t-4 text-center font-bold">
        <p>&copy; {new Date().getFullYear()} Gwanghyun Jin. All rights reserved.</p>
        <p className="text-sm text-gray-400 mt-2 uppercase font-black">Engineered with ❤️ & Next.js</p>
      </footer>
    </div>
  );
}
