import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MyLink - 클릭 통계";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
            top: -100,
            right: -50,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
          }}
        />

        {/* Logo small */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <span style={{ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.6)" }}>
            MyLink
          </span>
        </div>

        {/* Chart Icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
            <path d="M9 19V9a2 2 0 012-2h2a2 2 0 012 2v10" />
            <path d="M15 19V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>

        <span
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: "white",
            letterSpacing: -1,
          }}
        >
          클릭 통계
        </span>
        <span
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.45)",
            fontWeight: 500,
            marginTop: 12,
          }}
        >
          내 링크 성과를 한눈에 분석하세요
        </span>
      </div>
    ),
    { ...size }
  );
}
