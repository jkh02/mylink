export interface LinkItem {
  id: string;
  title: string;
  url: string;
  faviconUrl?: string;
  createdAt: string;
}

export const dummyLinks: LinkItem[] = [
  {
    id: "link-1",
    title: "인스타그램",
    url: "https://instagram.com/your_username",
    faviconUrl: "https://s2.googleusercontent.com/s2/favicons?domain=instagram.com",
    createdAt: "2026-03-25T16:00:00Z",
  },
  {
    id: "link-2",
    title: "유튜브",
    url: "https://youtube.com/@your_channel",
    faviconUrl: "https://s2.googleusercontent.com/s2/favicons?domain=youtube.com",
    createdAt: "2026-03-25T16:01:00Z",
  },
  {
    id: "link-3",
    title: "블로그",
    url: "https://blog.naver.com/your_blog",
    faviconUrl: "https://s2.googleusercontent.com/s2/favicons?domain=naver.com",
    createdAt: "2026-03-25T16:02:00Z",
  },
  {
    id: "link-4",
    title: "GitHub",
    url: "https://github.com/your_username",
    faviconUrl: "https://s2.googleusercontent.com/s2/favicons?domain=github.com",
    createdAt: "2026-03-25T16:03:00Z",
  },
  {
    id: "link-5",
    title: "포트폴리오",
    url: "https://your-portfolio.com",
    faviconUrl: "https://s2.googleusercontent.com/s2/favicons?domain=your-portfolio.com",
    createdAt: "2026-03-25T16:04:00Z",
  },
];
