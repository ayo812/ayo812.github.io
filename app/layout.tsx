import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { getMetadataBase } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "scaveng.io",
  description: "A mobile-first daily scavenger hunt with one global drop, one hour to submit, and a top-five results board.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "scaveng.io",
    description: "A mobile-first daily scavenger hunt with one global drop, one hour to submit, and a top-five results board.",
    siteName: "scaveng.io",
    type: "website",
    url: "/"
  },
  twitter: {
    card: "summary_large_image",
    title: "scaveng.io",
    description: "A mobile-first daily scavenger hunt with one global drop, one hour to submit, and a top-five results board."
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}