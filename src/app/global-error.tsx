"use client";

import React, { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      console.error("Fold global boundary caught error:", {
        name: error?.name || "Error",
        digest: error?.digest ?? null,
      });
    } else {
      console.error("Fold global boundary caught error:", error);
    }
  }, [error]);

  const digest =
    error && typeof error === "object" && "digest" in error && error.digest
      ? String(error.digest)
      : null;

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "#f4f0e6",
          color: "#141511",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <main
          style={{
            width: "100%",
            maxWidth: "520px",
            borderRadius: "20px",
            border: "1px solid rgba(20, 21, 17, 0.14)",
            backgroundColor: "#faf7f0",
            padding: "32px 28px",
            textAlign: "center",
            boxShadow: "0 12px 32px rgba(20, 21, 17, 0.08)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "12px",
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid rgba(20, 21, 17, 0.14)",
                backgroundColor: "#f0ebe0",
                color: "#b8452c",
              }}
            >
              Root recovery
            </span>
            {digest ? (
              <span
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: "11px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid rgba(20, 21, 17, 0.14)",
                  backgroundColor: "#f0ebe0",
                  color: "#5f5e58",
                }}
              >
                digest: {digest}
              </span>
            ) : null}
          </div>

          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "26px",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Fold encountered an unexpected error
          </h1>

          <p
            style={{
              margin: "0 auto 24px",
              maxWidth: "42ch",
              fontSize: "15px",
              lineHeight: 1.6,
              color: "#5f5e58",
            }}
          >
            The application shell had to reset. Your notes remain safely stored
            on this device in IndexedDB.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                cursor: "pointer",
                border: "1px solid #96331e",
                borderRadius: "10px",
                backgroundColor: "#b8452c",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                padding: "10px 18px",
              }}
            >
              Try again
            </button>

            {/* Root error boundary avoids next/link so recovery never depends on router state. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                borderRadius: "10px",
                border: "1px solid rgba(20, 21, 17, 0.16)",
                backgroundColor: "transparent",
                color: "#141511",
                fontSize: "14px",
                fontWeight: 500,
                padding: "10px 18px",
                textDecoration: "none",
              }}
            >
              Back to home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
