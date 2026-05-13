import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MyLink - 모든 링크를, 하나의 페이지에";
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
            top: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -60,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 100,
            right: 200,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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
            MyLink
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 900,
              letterSpacing: -2,
              background: "linear-gradient(135deg, #e0e7ff, #c7d2fe, #a5b4fc)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1.2,
            }}
          >
            모든 링크를, 하나의 페이지에.
          </span>
          <span
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.5)",
              fontWeight: 500,
              marginTop: 8,
            }}
          >
            크리에이터를 위한 멀티 링크 페이지 서비스
          </span>
        </div>

        {/* Bottom badges */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
          }}
        >
          {["무료 사용", "30초 설정", "클릭 분석"].map((text) => (
            <div
              key={text}
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              ✓ {text}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
