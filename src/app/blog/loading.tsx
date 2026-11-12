export default function BlogLoading() {
  return (
    <div className="relative min-h-screen bg-[var(--bg-canvas)] text-[var(--ink)]">
      {/* Subtle Film Grain */}
      <div className="studio-grain" aria-hidden="true" />

      <main
        role="status"
        aria-busy="true"
        aria-label="Loading Fold Field Notes"
        className="relative z-10 py-14 sm:py-20"
      >
        <span className="sr-only">Loading Fold Field Notes…</span>

        <div className="shell">
          <div className="mx-auto max-w-[1040px]">
            {/* Editorial Header Skeleton */}
            <header className="mb-10 space-y-4">
              <div className="h-5 w-36 animate-pulse rounded-md border border-[var(--border)] bg-[var(--surface-muted)]" />
              <div className="h-10 w-72 animate-pulse rounded-xl bg-[var(--surface-muted)] sm:h-12 sm:w-[440px]" />
              <div className="space-y-2 pt-1">
                <div className="h-4 w-full max-w-[520px] animate-pulse rounded bg-[var(--surface-muted)]" />
                <div className="h-4 w-3/4 max-w-[360px] animate-pulse rounded bg-[var(--surface-muted)]" />
              </div>

              {/* Filter Chips Skeleton */}
              <div className="flex flex-wrap items-center gap-2 pt-4">
                {[80, 96, 108, 88].map((width, idx) => (
                  <div
                    key={idx}
                    style={{ width }}
                    className="h-8 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]"
                  />
                ))}
              </div>
            </header>

            {/* Featured Article Concentric Frame Skeleton */}
            <div className="mb-8 rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-chassis)]">
              <div className="relative overflow-hidden rounded-[1.12rem] border border-[var(--border)] bg-[var(--double-frame-inner)] p-6 sm:p-8">
                <div className="specular-line" aria-hidden="true" />

                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="h-5 w-28 animate-pulse rounded border border-[var(--border)] bg-[var(--surface-muted)]" />
                  <div className="h-4 w-24 animate-pulse rounded bg-[var(--surface-muted)]" />
                </div>

                <div className="mb-4 space-y-2.5">
                  <div className="h-7 w-5/6 animate-pulse rounded-lg bg-[var(--surface-muted)] sm:h-8" />
                  <div className="h-7 w-2/3 animate-pulse rounded-lg bg-[var(--surface-muted)] sm:h-8" />
                </div>

                <div className="mb-6 space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-[var(--surface-muted)]" />
                  <div className="h-4 w-11/12 animate-pulse rounded bg-[var(--surface-muted)]" />
                  <div className="h-4 w-3/5 animate-pulse rounded bg-[var(--surface-muted)]" />
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-[var(--surface-muted)]" />
                  <div className="h-4 w-20 animate-pulse rounded bg-[var(--accent-soft)]" />
                </div>
              </div>
            </div>

            {/* Article Grid Concentric Skeletons */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((card) => (
                <div
                  key={card}
                  className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-card)]"
                >
                  <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[1.12rem] border border-[var(--border)] bg-[var(--double-frame-inner)] p-6">
                    <div className="specular-line" aria-hidden="true" />

                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="h-4 w-20 animate-pulse rounded border border-[var(--border)] bg-[var(--surface-muted)]" />
                        <div className="h-4 w-16 animate-pulse rounded bg-[var(--surface-muted)]" />
                      </div>

                      <div className="mb-3 space-y-2">
                        <div className="h-6 w-11/12 animate-pulse rounded-md bg-[var(--surface-muted)]" />
                        <div className="h-6 w-3/4 animate-pulse rounded-md bg-[var(--surface-muted)]" />
                      </div>

                      <div className="mb-6 space-y-2">
                        <div className="h-3.5 w-full animate-pulse rounded bg-[var(--surface-muted)]" />
                        <div className="h-3.5 w-5/6 animate-pulse rounded bg-[var(--surface-muted)]" />
                        <div className="h-3.5 w-2/3 animate-pulse rounded bg-[var(--surface-muted)]" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
                      <div className="h-3.5 w-24 animate-pulse rounded bg-[var(--surface-muted)]" />
                      <div className="h-3.5 w-14 animate-pulse rounded bg-[var(--surface-muted)]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
