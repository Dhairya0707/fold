import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/lib/site";

export const dynamic = "force-static";

export const alt = "Fold: notes without the noise";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  const displayHost = SITE_CONFIG.url.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#141511",
          backgroundImage:
            "radial-gradient(circle at 86% 16%, rgba(224, 123, 86, 0.16), transparent 46%), radial-gradient(circle at 14% 88%, rgba(184, 69, 44, 0.1), transparent 42%)",
          padding: "28px",
          color: "#f2eee3",
          fontFamily: "sans-serif",
        }}
      >
        {/* Concentric Outer Hardware Frame */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            borderRadius: "26px",
            border: "1px solid rgba(242, 238, 227, 0.16)",
            backgroundColor: "#161712",
            padding: "6px",
          }}
        >
          {/* Concentric Inner Obsidian Chassis (R_inner = R_outer - Padding) */}
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              borderRadius: "20px",
              border: "1px solid rgba(242, 238, 227, 0.12)",
              backgroundColor: "#191a15",
              padding: "48px 54px",
            }}
          >
            {/* Top Specular Catchlight */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "120px",
                right: "120px",
                height: "1px",
                display: "flex",
                backgroundImage:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent)",
              }}
            />

            {/* Header: Fold Vermilion Mark + Engine Pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "12px",
                    border: "1px solid rgba(224, 123, 86, 0.45)",
                    backgroundColor: "rgba(184, 69, 44, 0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#e07b56",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5.75 3.25h8l5 5v12.5h-13z"
                      stroke="#e07b56"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13.75 3.25v5h5"
                      stroke="#e07b56"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.75 12h5.5M8.75 15.5h3.5"
                      stroke="#e07b56"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    fontSize: "34px",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "#f2eee3",
                  }}
                >
                  <span>fold</span>
                  <span style={{ color: "#b8452c" }}>.</span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 18px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(242, 238, 227, 0.14)",
                  backgroundColor: "rgba(242, 238, 227, 0.04)",
                  fontSize: "14px",
                  letterSpacing: "0.08em",
                  color: "#b9b2a1",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "9999px",
                    backgroundColor: "#27c93f",
                    display: "flex",
                  }}
                />
                <span>LOCAL-FIRST WORKSPACE</span>
              </div>
            </div>

            {/* Centerpiece Display Typography */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                maxWidth: "960px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "baseline",
                  fontSize: "68px",
                  fontWeight: 700,
                  lineHeight: 1.06,
                  letterSpacing: "-0.035em",
                  color: "#f2eee3",
                }}
              >
                <span>Notes&nbsp;</span>
                <span style={{ color: "#e07b56" }}>without the noise</span>
              </div>

              <div
                style={{
                  display: "flex",
                  fontSize: "26px",
                  lineHeight: 1.44,
                  color: "#c8c1b1",
                  maxWidth: "880px",
                }}
              >
                A quiet, private, hardware-grade notes workspace for the web. Powered by IndexedDB.
              </div>
            </div>

            {/* Bottom Spec Strip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                paddingTop: "24px",
                borderTop: "1px solid rgba(242, 238, 227, 0.12)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(224, 123, 86, 0.35)",
                  backgroundColor: "rgba(184, 69, 44, 0.12)",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#f2eee3",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "9999px",
                    backgroundColor: "#e07b56",
                    display: "flex",
                  }}
                />
                <span>100% On-Device · Zero Tracking · Offline PWA</span>
              </div>

              <div
                style={{
                  display: "flex",
                  fontSize: "18px",
                  color: "#8b8577",
                  letterSpacing: "0.02em",
                }}
              >
                {displayHost}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
