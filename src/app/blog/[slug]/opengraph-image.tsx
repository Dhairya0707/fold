import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { formatBlogDate, getAllSlugs, getPostBySlug } from "@/lib/blog";

export const dynamic = "force-static";

export const alt = "Fold Field Notes";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function trimToWordBoundary(text: string, maxLength = 148): string {
  if (text.length <= maxLength) return text;
  const sliced = text.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const clean = lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced;
  return `${clean.replace(/[,:;—-]+$/, "").trimEnd()}...`;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const title = post.title;
  const description = post.description;
  const category = post.category;
  const authorName = post.author.name;
  const authorHandle = post.author.handle;
  const readingTime = post.readingTimeText;
  const publishedDate = formatBlogDate(post.publishedAt);

  const titleFontSize = title.length > 62 ? 44 : 52;
  const trimmedDescription = trimToWordBoundary(description, 152);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#141511",
          backgroundImage:
            "radial-gradient(circle at 86% 12%, rgba(224, 123, 86, 0.16) 0%, rgba(224, 123, 86, 0.03) 34%, transparent 62%)",
          padding: "28px",
          color: "#f2eee3",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Outer Concentric Frame */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            borderRadius: "24px",
            border: "1px solid rgba(242, 238, 227, 0.10)",
            backgroundColor: "#171813",
            padding: "5px",
          }}
        >
          {/* Inner Sheet */}
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: "19px",
              border: "1px solid rgba(242, 238, 227, 0.14)",
              backgroundColor: "#1b1c17",
              padding: "44px 52px",
              position: "relative",
            }}
          >
            {/* Top Specular Catchlight */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "40px",
                right: "40px",
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent)",
              }}
            />

            {/* Header Row: Brand & Category Badge */}
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
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: "#22231d",
                    border: "1px solid rgba(242, 238, 227, 0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M6.5 3.5h7l4.5 4.5V19a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 19V5A1.5 1.5 0 0 1 6.5 3.5Z"
                      fill="#fbf8f0"
                    />
                    <path d="M13.5 3.5v3.5A1 1 0 0 0 14.5 8H18Z" fill="#e07b56" />
                    <rect x="7.75" y="11" width="7" height="1.6" rx="0.8" fill="#191712" />
                    <rect x="7.75" y="14.2" width="4.8" height="1.6" rx="0.8" fill="#b8452c" />
                  </svg>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      fontFamily: "Georgia, serif",
                      fontSize: "30px",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      color: "#f2eee3",
                    }}
                  >
                    <span>fold</span>
                    <span style={{ color: "#e07b56" }}>.</span>
                  </div>
                  <span
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: "15px",
                      letterSpacing: "0.14em",
                      color: "#8b8577",
                      textTransform: "uppercase",
                    }}
                  >
                    / Field Notes
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(224, 123, 86, 0.15)",
                  border: "1px solid rgba(224, 123, 86, 0.35)",
                  color: "#e07b56",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "15px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {category}
              </div>
            </div>

            {/* Centerpiece: Article Serif Title & Description */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                marginTop: "12px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: `${titleFontSize}px`,
                  fontWeight: 700,
                  lineHeight: 1.14,
                  letterSpacing: "-0.025em",
                  color: "#f2eee3",
                }}
              >
                {title}
              </div>

              <div
                style={{
                  fontSize: "21px",
                  lineHeight: 1.48,
                  color: "#9b9485",
                  maxWidth: "960px",
                }}
              >
                {trimmedDescription}
              </div>
            </div>

            {/* Footer Metadata Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid rgba(242, 238, 227, 0.11)",
                paddingTop: "22px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "999px",
                    backgroundColor: "rgba(224, 123, 86, 0.18)",
                    border: "1px solid rgba(224, 123, 86, 0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#e07b56",
                    fontFamily: "Georgia, serif",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  {authorName.charAt(0)}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "19px",
                      fontWeight: 600,
                      color: "#f2eee3",
                    }}
                  >
                    {authorName}
                  </span>
                  <span
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: "16px",
                      color: "#8b8577",
                    }}
                  >
                    {authorHandle}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "16px",
                  color: "#dcd6c7",
                }}
              >
                <span style={{ color: "#e07b56", fontWeight: 600 }}>
                  {readingTime}
                </span>
                <span style={{ color: "rgba(242, 238, 227, 0.25)" }}>·</span>
                <span style={{ color: "#8b8577" }}>{publishedDate}</span>
                <span style={{ color: "rgba(242, 238, 227, 0.25)" }}>·</span>
                <span style={{ color: "#8b8577" }}>foldnotes.web.app</span>
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
