"use client";

import React from "react";
import Link from "next/link";
import { audioHaptics } from "@/lib/audio-haptics";
import { SITE_CONFIG } from "@/lib/site";

export function LaunchCta() {
  const handleScrollToDemo = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    audioHaptics.trigger("tap");
    const demo = document.getElementById("app");
    if (demo) {
      demo.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="landing-cta-section" id="launch" aria-labelledby="ctaTitle">
      <div className="shell">
        <div className="cta-plate">
          <div className="cta-plate__glow" aria-hidden="true" />

          <div className="cta-plate__inner">
            <div className="cta-plate__grid">
              <div className="cta-plate__lead">
                <h2 className="cta-headline" id="ctaTitle">
                  Ready for notes without the noise?
                </h2>
              </div>

              <div className="cta-plate__aside">
                <p className="cta-desc">
                  No account, no cookies, no tracking. Open the standalone
                  workspace and start writing in under two seconds.
                </p>

                <div className="cta-actions">
                  <Link href="/app" className="cta-launch">
                    <span>Start writing in Fold</span>
                    <span className="cta-launch__arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>

                  <a href="#app" onClick={handleScrollToDemo} className="cta-quiet">
                    <span className="cta-quiet__label">
                      Try the demo workspace
                      <span
                        className="cta-quiet__line cta-quiet__line--base"
                        aria-hidden="true"
                      />
                      <span
                        className="cta-quiet__line cta-quiet__line--accent"
                        aria-hidden="true"
                      />
                    </span>
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M7 17 17 7M7 7h10v10" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="cta-plate__foot">
              <div className="cta-facts">
                <span className="cta-facts__item">Zero telemetry</span>
                <span className="cta-facts__rule" aria-hidden="true" />
                <span className="cta-facts__item">IndexedDB local storage</span>
                <span className="cta-facts__rule" aria-hidden="true" />
                <span className="cta-facts__item">Open source (MIT)</span>
              </div>

              <a
                href={SITE_CONFIG.links.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => audioHaptics.trigger("tap")}
                className="cta-signature inline-flex items-center gap-1.5 hover:text-[var(--plate-fg)] transition-colors underline underline-offset-4"
              >
                <span>View source on GitHub</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
