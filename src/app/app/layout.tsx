import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace",
  description:
    "Distraction-free local-first notes workspace powered by on-device IndexedDB.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WorkspaceAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
