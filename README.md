# 🚀 MyLink: 아이디어를 현실로 (바이브 코딩)

**MyLink**는 인스타그램 프로필 링크 서비스처럼 여러 소셜 미디어나 웹사이트 링크를 한데 모아 보여주는 현대적인 멀티 링크 페이지 프로젝트입니다. 이 프로젝트는 **Google Antigravity IDE** 환경에서 **Gemini CLI**를 활용한 '바이브 코딩' 방법론으로 개발되었습니다.

---

## 🛠 Core Technologies
이 프로젝트는 최신의 웹 표준 기술과 AI 기반 개발 도구를 사용합니다.

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **IDE & AI:** Google Antigravity & Gemini CLI (Vibe Coding)
- **Fonts:** Geist and Geist Mono via `next/font`

---

## 📂 Project Structure
핵심 애플리케이션 코드는 `my-profile/` 디렉토리에 위치하며, Next.js의 최신 App Router 컨벤션을 따릅니다.

- **`my-profile/app/`**: 라우팅, 레이아웃 및 글로벌 스타일 정의
  - `layout.tsx`: Root 레이아웃 및 폰트 설정
  - `page.tsx`: 메인 MyLink 랜딩 페이지
  - `globals.css`: Tailwind CSS 4 지시어 및 글로벌 스타일
- **`my-profile/public/`**: 아이콘, 로고 등 정적 자원
- **`my-profile/next.config.ts`**: Next.js 프로젝트 설정 파일
- **`my-profile/package.json`**: 프로젝트 의존성 및 스크립트 관리

---

## 💡 What is Vibe Coding?
전통적인 타이핑 중심의 코딩 방식에서 벗어나, **Gemini CLI**와의 대화를 통해 개발자의 의도(Vibe)를 즉시 코드로 변환하는 선언적 개발 방식을 채택했습니다.

1. **Intention Driven**: 자연어로 기능을 정의하고 AI가 최적의 코드를 생성.
2. **Rapid Iteration**: Antigravity IDE를 통한 실시간 피드백 및 리팩토링.
3. **AI Collaboration**: 복잡한 로직이나 스타일링을 Gemini CLI와 협업하여 해결.

---

## 🏃 Building and Running
모든 명령어는 `my-profile/` 디렉토리 내부에서 실행해야 합니다.

### Development
```bash
npm run dev
