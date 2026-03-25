# 마이링크 (MyLink) - 제품 요구사항 정의서 (PRD)

## 1. 프로젝트 개요
- **프로젝트명**: 마이링크 (MyLink)
- **목적**: 인스타그램, 틱톡 등 하나의 링크만 허용되는 소셜 미디어 프로필에 여러 개의 링크를 연결해주는 멀티 링크 랜딩 페이지(Link in Bio) 서비스 제공
- **대상 사용자**:
  - 인플루언서 및 크리에이터: 다양한 플랫폼(유튜브, 인스타, 블로그 등)을 하나의 페이지로 모아서 홍보하려는 사용자
  - 프리랜서 및 포트폴리오 사용자: 작업물과 이력서 등을 체계적으로 보여주고 싶은 사용자
  - 소상공인 및 브랜드: 이벤트 페이지, 상품 링크, 예약 시스템 등 다양한 비즈니스 채널을 하나로 묶고 싶은 사용자

---

## 2. 핵심 기능 목록

### 2.1 필수 기능 (MVP - Minimum Viable Product)
- [ ] **회원가입 및 온보딩 (Authentication & Onboarding)**: Firebase 기반 구글 소셜 로그인 전용, 최초 가입 시 닉네임 설정 온보딩 포함
- [ ] **고유 URL 생성 (닉네임 기반)**: 핸들(ID) 없이 닉네임 자체를 URL 경로로 사용
- [ ] **프로필 관리 (Profile Management)**: 프로필 이미지 업로드 기능 없음, 닉네임(displayName) 및 자기소개 인라인(Inline) 수정 지원
- [ ] **링크 관리 (Link Management)**: 링크 추가/인라인 수정/삭제, 구글 Favicon API 기반 아이콘 반영 (순서 변경 및 토글 제외)
- [ ] **기본 테마 및 커스터마이징 (Basic Theming)**

### 2.2 선택 기능 (고도화 및 향후 확장 기능)
- [ ] **링크 클릭 통계 (Analytics)**: MVP 이후 추후 고도화 단계에서 수집 및 제공 예정 (개별 링크 클릭 조회수 위주)

---

## 3. 각 기능의 상세 설명

### 3.1 회원가입 및 온보딩
- **구글 소셜 로그인 전용**: Firebase Authentication을 연동하여 구글 계정으로만 간편하게 가입 및 로그인.
- 별도의 이메일/비밀번호 가입 절차를 생략하여 사용자 이탈률을 최소화.
- **초기 온보딩 과정**: 소셜 로그인 직후 신규 유저로 판별될 경우 온보딩 페이지로 라우팅. 사용자는 고유 접속 주소로 사용될 닉네임을 필수 입력하며, 제출 완료 시에 빈 서브 컬렉션과 함께 데이터베이스에 프로필 정보가 등록됨.

### 3.2 고유 URL 생성 및 DB 구조 (Firestore)
- 별도의 고유 아이디(Handle) 없이, 온보딩 단계에서 사용자가 설정한 **닉네임(displayName)**을 서비스 접속 주소(예: `mylink.com/닉네임`)로 그대로 사용.
- **데이터베이스 모델링 요건 및 예시**:
  - 사용자 프로필 정보는 상위 컬렉션(`users`)에 저장하며, `email`, `displayName`, `photoUrl`(연동된 구글 프로필 이미지 URL), `bio` 필드를 포함함.
  - 서비스 특징 상 사용자의 별도 이미지 업로드 필드나 저장소 기능은 제공하지 않으며, 소셜 계정의 기본 프로필 이미지를 사용.
  - 각각의 링크 목록 데이터는 해당 사용자 문서 하위의 **서브 컬렉션(예: `users/{userId}/links`)**을 통하여 관리함.

**[Firestore 데이터베이스 구조 예시]**
```json
// Collection: users
{
  "users": {
    "user_uid_12345": {
      "email": "user@gmail.com",
      "displayName": "홍길동",
      "photoUrl": "https://lh3.googleusercontent.com/a/...",
      "bio": "안녕하세요, 프리랜서 디자이너 홍길동입니다.",
      "createdAt": "2026-03-24T10:00:00Z",
      "updatedAt": "2026-03-24T10:00:00Z"
    }
  }
}

// Sub-Collection: users/{uid}/links
{
  "links": {
    "link_doc_abc123": {
      "title": "내 포트폴리오 웹사이트",
      "url": "https://hong-portfolio.com",
      "faviconUrl": "https://s2.googleusercontent.com/s2/favicons?domain=hong-portfolio.com",
      "createdAt": "2026-03-24T10:05:00Z"
    },
    "link_doc_def456": {
      "title": "인스타그램",
      "url": "https://instagram.com/hong_design",
      "faviconUrl": "https://s2.googleusercontent.com/s2/favicons?domain=instagram.com",
      "createdAt": "2026-03-24T10:06:00Z"
    }
  }
}
```

### 3.3 프로필 관리 (인라인 편집)
- **닉네임 및 소개글 수정**: 화면에 표시된 닉네임과 짧은 자기소개(Bio) 텍스트를 클릭하여 그 자리에서 바로 수정할 수 있는 **인라인 편집(Inline Edit)** 구조를 채택.
- 해당 정보는 마이페이지 랜딩 URL이자 브랜딩 요소 역할을 함. 수정 시 URL도 변경된 닉네임으로 함께 갱신됨.
- **프로필 이미지 렌더링**: 구글 소셜 로그인 연동 시 받아오는 프로필 이미지(`photoUrl`)를 랜딩 페이지의 메인 아바타로 렌더링함. 사용자가 사진을 직접 변경/업로드하는 기능은 제외.

### 3.4 링크 추가, 수정 및 삭제
- **링크 생성**: 사용자 페이지에 표시될 버튼의 `타이틀(Title)`과 실제 연결될 `URL` 데이터 추가.
- **인라인 편집 (Inline Edit)**: 프로필과 동일하게 등록된 링크의 제목(Title)과 URL을 클릭하면 그 자리에서 즉시 텍스트를 수정할 수 있음.
- **파비콘 자동 연동**: **구글 파비콘 API**(예: `https://s2.googleusercontent.com/s2/favicons?domain=...`)를 활용하여 사용자가 입력한 URL의 도메인에서 파비콘 이미지를 추출해 링크 버튼의 좌측 아이콘으로 렌더링.
- **목록 단순화**: 링크를 활성/비활성하는 토글 버튼이나, 드래그 앤 드롭을 통한 노출 순서 변경 기능은 모두 제외. 목록에 추가된 순서 그대로 렌더링.
- **영구 삭제**: 불필요한 링크는 삭제 아이콘/버튼을 통해 완전히 제거.

### 3.5 기본 테마 및 디자인 커스터마이징
- **배경색상**: 단색 또는 기본 그라데이션 배경 제공.
- **버튼 스타일**: 테두리(Border), 배경색, 그림자 효과, 둥근 모서리(Border-radius) 등 지정.

---

## 4. 기술 스택 (Tech Stack)
- **Frontend / Framework**: Next.js, React
- **UI & Design System**: Tailwind CSS, shadcn/ui
- **Backend & Database**: Firebase (Authentication, Firestore)
- **External API**: Google Favicon API (파비콘 추출용)
- **Hosting / Deployment**: Vercel (권장)
