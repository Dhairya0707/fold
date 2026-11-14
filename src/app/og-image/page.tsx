import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fold Open Graph Image Generator",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OgImagePage() {
  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        backgroundColor: "#0d0e0b",
        backgroundImage: `
          radial-gradient(circle at 18% 18%, rgba(224, 123, 86, 0.16) 0%, transparent 45%),
          radial-gradient(circle at 82% 80%, rgba(184, 69, 44, 0.12) 0%, transparent 50%),
          radial-gradient(circle at 75% 25%, rgba(244, 240, 230, 0.05) 0%, transparent 40%)
        `,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#f4f0e6",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        body {
          margin: 0;
          padding: 0;
          background: #0d0e0b;
          overflow: hidden;
          font-family: 'Instrument Sans', sans-serif;
        }

        [data-nextjs-dialog-overlay],
        [data-nextjs-dialog],
        nextjs-portal,
        #__next-build-indicator,
        nextjs-toast {
          display: none !important;
        }
      `}</style>

      {/* Concentric Outer Hardware Frame */}
      <div
        style={{
          width: "1160px",
          height: "590px",
          borderRadius: "26px",
          border: "1px solid rgba(244, 240, 230, 0.16)",
          backgroundColor: "#131410",
          backgroundImage: "linear-gradient(180deg, #161713 0%, #11120e 100%)",
          padding: "6px",
          display: "flex",
          position: "relative",
          boxShadow: "0 32px 100px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
        }}
      >
        {/* Concentric Inner Obsidian Chassis (R_inner = 26 - 6 = 20px) */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "20px",
            border: "1px solid rgba(244, 240, 230, 0.10)",
            backgroundColor: "#161712",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            padding: "42px 46px",
            gap: "38px",
          }}
        >
          {/* Top Specular Edge Highlight */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "140px",
              right: "140px",
              height: "1px",
              backgroundImage:
                "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.38), transparent)",
            }}
          />

          {/* LEFT COLUMN: Brand Identity & Narrative */}
          <div
            style={{
              flex: "0 0 490px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              zIndex: 2,
            }}
          >
            {/* Top Brand & Headline Block */}
            <div>
              {/* Brand Row */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
                {/* Fold Squircle Icon (Exact SVG geometry from public/icon.svg) */}
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "14px",
                    backgroundColor: "#1e1f19",
                    border: "1px solid rgba(244, 240, 230, 0.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.22)",
                  }}
                >
                  <svg width="30" height="30" viewBox="0 0 512 512" fill="none">
                    <defs>
                      <linearGradient id="paperSheetG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fffdf8" />
                        <stop offset="100%" stopColor="#f2ecde" />
                      </linearGradient>
                      <linearGradient id="foldFlapG" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#e07b56" />
                        <stop offset="100%" stopColor="#b8452c" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M150 96 H302 L388 182 V390 A26 26 0 0 1 362 416 H150 A26 26 0 0 1 124 390 V122 A26 26 0 0 1 150 96 Z"
                      fill="url(#paperSheetG)"
                    />
                    <path d="M302 96 V160 A22 22 0 0 0 324 182 H388 Z" fill="url(#foldFlapG)" />
                    <rect x="172" y="216" width="132" height="20" rx="10" fill="#191712" />
                    <rect x="172" y="262" width="168" height="16" rx="8" fill="#191712" opacity="0.72" />
                    <rect x="172" y="302" width="142" height="16" rx="8" fill="#191712" opacity="0.48" />
                    <rect x="172" y="346" width="84" height="16" rx="8" fill="#b8452c" />
                  </svg>
                </div>

                {/* Logo Text */}
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <span
                    style={{
                      fontSize: "34px",
                      fontWeight: 700,
                      letterSpacing: "-0.035em",
                      color: "#f4f0e6",
                      fontFamily: "'Instrument Sans', sans-serif",
                    }}
                  >
                    fold
                  </span>
                  <span style={{ fontSize: "34px", fontWeight: 700, color: "#b8452c" }}>.</span>
                </div>

                {/* Local Engine Status Pill */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "5px 12px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(244, 240, 230, 0.12)",
                    backgroundColor: "rgba(244, 240, 230, 0.05)",
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.04em",
                    color: "#cfc8b8",
                  }}
                >
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      backgroundColor: "#3ecf8e",
                      boxShadow: "0 0 8px rgba(62, 207, 142, 0.8)",
                    }}
                  />
                  <span>IDB v2.0 · LOCAL</span>
                </div>
              </div>

              {/* Main Headline */}
              <h1
                style={{
                  fontSize: "49px",
                  fontWeight: 700,
                  lineHeight: 1.08,
                  letterSpacing: "-0.04em",
                  margin: "0 0 16px 0",
                  color: "#f4f0e6",
                  fontFamily: "'Instrument Sans', sans-serif",
                }}
              >
                Notes without
                <br />
                <span
                  style={{
                    backgroundImage: "linear-gradient(135deg, #f2eee3 30%, #e07b56 95%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  the noise.
                </span>
              </h1>

              {/* Subtitle / Value Prop */}
              <p
                style={{
                  fontSize: "17px",
                  lineHeight: 1.5,
                  color: "#b4ad9d",
                  margin: "0 0 22px 0",
                  letterSpacing: "-0.01em",
                }}
              >
                A private, hardware-grade notes workspace for the web. Powered by on-device IndexedDB with zero tracking, zero cookies, and instant export.
              </p>

              {/* Trust & Architecture Badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {[
                  { icon: "🛡️", label: "0 bytes egress" },
                  { icon: "⚡", label: "Offline PWA" },
                  { icon: "📦", label: "Markdown vault" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(244, 240, 230, 0.12)",
                      backgroundColor: "rgba(244, 240, 230, 0.04)",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#dfd8c7",
                      fontFamily: "'Instrument Sans', sans-serif",
                    }}
                  >
                    <span style={{ fontSize: "12px" }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Footer Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "16px",
                borderTop: "1px solid rgba(244, 240, 230, 0.09)",
                fontSize: "13px",
                fontFamily: "'JetBrains Mono', monospace",
                color: "#8a8476",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f4f0e6" }}>
                <span style={{ color: "#e07b56", fontWeight: 700 }}>→</span>
                <span style={{ fontWeight: 600 }}>foldnotes.web.app</span>
              </div>
              <div style={{ color: "#9a9486" }}>Free · Open Source MIT</div>
            </div>
          </div>

          {/* RIGHT COLUMN: Realistic Hardware Editor Mockup */}
          <div
            style={{
              flex: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Ambient Radial Backlight */}
            <div
              style={{
                position: "absolute",
                width: "480px",
                height: "380px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(184, 69, 44, 0.25) 0%, rgba(224, 123, 86, 0.10) 45%, transparent 70%)",
                filter: "blur(44px)",
                zIndex: 0,
              }}
            />

            {/* Editor Window Chassis */}
            <div
              style={{
                width: "538px",
                height: "468px",
                borderRadius: "16px",
                border: "1px solid rgba(244, 240, 230, 0.18)",
                backgroundColor: "#1a1b16",
                boxShadow: "0 28px 75px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Window Titlebar */}
              <div
                style={{
                  height: "42px",
                  borderBottom: "1px solid rgba(244, 240, 230, 0.08)",
                  backgroundColor: "#161713",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 14px",
                }}
              >
                {/* macOS Controls */}
                <div style={{ display: "flex", gap: "7px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ff5f56" }} />
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#27c93f" }} />
                </div>

                {/* Quick Search Pill */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "4px 11px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(244, 240, 230, 0.05)",
                    border: "1px solid rgba(244, 240, 230, 0.08)",
                    fontSize: "11px",
                    color: "#8a8476",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <span>Quick search</span>
                  <span
                    style={{
                      padding: "1px 5px",
                      borderRadius: "3px",
                      backgroundColor: "rgba(244, 240, 230, 0.10)",
                      fontSize: "9px",
                      fontWeight: 600,
                      color: "#dfd8c7",
                    }}
                  >
                    ⌘K
                  </span>
                </div>

                {/* Save Confirmation Badge */}
                <div
                  style={{
                    fontSize: "11px",
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "#3ecf8e",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <span style={{ fontWeight: 700 }}>✓</span>
                  <span>Synced</span>
                </div>
              </div>

              {/* Editor Split View */}
              <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                {/* Mini Sidebar */}
                <div
                  style={{
                    width: "162px",
                    borderRight: "1px solid rgba(244, 240, 230, 0.08)",
                    backgroundColor: "#141511",
                    padding: "14px 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      color: "#7a7466",
                      marginBottom: "4px",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    NOTES (14)
                  </div>

                  {/* Active Note Item */}
                  <div
                    style={{
                      padding: "8px 9px",
                      borderRadius: "7px",
                      backgroundColor: "rgba(184, 69, 44, 0.18)",
                      border: "1px solid rgba(224, 123, 86, 0.40)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#f4f0e6",
                    }}
                  >
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      Hardware craft
                    </div>
                    <div style={{ fontSize: "10px", color: "#e07b56", marginTop: "2px" }}>
                      ● Active note
                    </div>
                  </div>

                  {/* Note Item 2 */}
                  <div
                    style={{
                      padding: "8px 9px",
                      borderRadius: "7px",
                      fontSize: "12px",
                      color: "#9a9486",
                    }}
                  >
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      IndexedDB engine
                    </div>
                    <div style={{ fontSize: "10px", color: "#6a6456", marginTop: "2px" }}>
                      2h ago
                    </div>
                  </div>

                  {/* Note Item 3 */}
                  <div
                    style={{
                      padding: "8px 9px",
                      borderRadius: "7px",
                      fontSize: "12px",
                      color: "#9a9486",
                    }}
                  >
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      Calm typography
                    </div>
                    <div style={{ fontSize: "10px", color: "#6a6456", marginTop: "2px" }}>
                      Yesterday
                    </div>
                  </div>
                </div>

                {/* Main Note Canvas */}
                <div
                  style={{
                    flex: 1,
                    padding: "20px 22px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    backgroundColor: "#181914",
                    overflow: "hidden",
                  }}
                >
                  {/* Note Metadata Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "11px",
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#8a8476",
                    }}
                  >
                    <span style={{ color: "#e07b56", fontWeight: 600 }}>#ideas</span>
                    <span>·</span>
                    <span>12m ago</span>
                    <span>·</span>
                    <span>428 words</span>
                  </div>

                  {/* Note Heading */}
                  <div
                    style={{
                      fontSize: "21px",
                      fontWeight: 700,
                      letterSpacing: "-0.025em",
                      color: "#f4f0e6",
                      lineHeight: 1.2,
                    }}
                  >
                    Hardware-grade craft notes
                  </div>

                  {/* Callout Quote */}
                  <div
                    style={{
                      borderLeft: "2px solid #b8452c",
                      padding: "8px 12px",
                      fontSize: "12px",
                      lineHeight: 1.45,
                      color: "#cfc8b8",
                      fontStyle: "italic",
                      backgroundColor: "rgba(184, 69, 44, 0.08)",
                      borderRadius: "0 6px 6px 0",
                    }}
                  >
                    &ldquo;Concentric radius law: R_inner = R_outer - Padding. Every thought belongs only to this device.&rdquo;
                  </div>

                  {/* Checklist Items */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "2px" }}>
                    {[
                      { text: "On-device IndexedDB persistence", checked: true },
                      { text: "Zero telemetry, cookies, or accounts", checked: true },
                      { text: "One-click Markdown vault export", checked: true },
                      { text: "Cross-tab BroadcastChannel sync", checked: true },
                    ].map((task, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                        <div
                          style={{
                            width: "15px",
                            height: "15px",
                            borderRadius: "4px",
                            backgroundColor: "#b8452c",
                            border: "1px solid #b8452c",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            fontSize: "10px",
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </div>
                        <span style={{ color: "#e4ded0" }}>{task.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
