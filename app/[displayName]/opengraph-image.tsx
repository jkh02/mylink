import { ImageResponse } from "next/og";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";

export const runtime = "edge";
export const alt = "MyLink 프로필";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Edge Runtime에서 Firebase 초기화
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

export default async function Image({
  params,
}: {
  params: Promise<{ displayName: string }>;
}) {
  const { displayName: rawName } = await params;
  const cleanName = decodeURIComponent(rawName).replace(/^@/, "");

  // Firestore에서 유저 프로필 조회
  const db = getDb();
  const q = query(collection(db, "users"), where("displayName", "==", cleanName));
  const snap = await getDocs(q);

  let displayName = cleanName;
  let bio = "";
  let linkCount = 0;

  if (!snap.empty) {
    const userData = snap.docs[0].data();
    displayName = userData.displayName || cleanName;
    bio = userData.bio || "";

    // 링크 개수 조회
    const userId = snap.docs[0].id;
    const linksSnap = await getDocs(collection(db, "users", userId, "links"));
    linkCount = linksSnap.size;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 40%, #2d1b69 70%, #1a1a3e 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative Orbs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -60,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 150,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Profile Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "48px 64px",
            borderRadius: 32,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
            gap: 8,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 44, color: "white", fontWeight: 800 }}>
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Username */}
          <span
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: "white",
              letterSpacing: -1,
            }}
          >
            @{displayName}
          </span>

          {/* Bio */}
          {bio && (
            <span
              style={{
                fontSize: 20,
                color: "rgba(255,255,255,0.55)",
                fontWeight: 500,
                marginTop: 4,
                maxWidth: 500,
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              {bio}
            </span>
          )}

          {/* Link count badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 20,
              padding: "8px 20px",
              borderRadius: 999,
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#a5b4fc" }}>
              {linkCount}개의 링크
            </span>
          </div>
        </div>

        {/* Bottom branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 32,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.35)" }}>
            MyLink
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
