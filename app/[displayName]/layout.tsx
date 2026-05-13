import type { Metadata } from "next";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

function getDb() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ displayName: string }>;
}): Promise<Metadata> {
  const { displayName: rawName } = await params;
  const cleanName = decodeURIComponent(rawName).replace(/^@/, "");

  // Firestore에서 유저 프로필 조회
  const db = getDb();
  const q = query(collection(db, "users"), where("displayName", "==", cleanName));
  const snap = await getDocs(q);

  if (snap.empty) {
    return {
      title: `@${cleanName}`,
      description: `${cleanName}님의 MyLink 프로필 페이지`,
    };
  }

  const userData = snap.docs[0].data();
  const displayName = userData.displayName || cleanName;
  const bio = userData.bio || "";

  // 링크 개수
  const userId = snap.docs[0].id;
  const linksSnap = await getDocs(collection(db, "users", userId, "links"));
  const linkCount = linksSnap.size;

  const title = `@${displayName}`;
  const description = bio
    ? `${bio} — ${displayName}님의 ${linkCount}개 링크를 확인해보세요.`
    : `${displayName}님의 ${linkCount}개 링크를 한 곳에서 확인하세요. MyLink 프로필 페이지.`;

  return {
    title,
    description,
    openGraph: {
      type: "profile",
      title: `@${displayName} — MyLink`,
      description,
      siteName: "MyLink",
    },
    twitter: {
      card: "summary_large_image",
      title: `@${displayName} — MyLink`,
      description,
    },
  };
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
