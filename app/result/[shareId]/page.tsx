import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { repository } from "@/lib/repository";
import { formatOrdinal } from "@/lib/share";
import { toAbsoluteUrl } from "@/lib/site";
import { formatFriendlyDate } from "@/lib/time";

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }): Promise<Metadata> {
  const { shareId } = await params;
  const result = await repository.getPublicResultPageData(shareId);
  if (!result) {
    return {
      title: "Result not found | scaveng.io",
      description: "This scaveng.io result link is invalid or no longer available.",
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const title = `${result.displayName} placed ${formatOrdinal(result.overallRank)} | scaveng.io`;
  const description = `${result.displayName} finished ${formatOrdinal(result.overallRank)} out of ${result.totalRanked} on today's scaveng.io hunt: ${result.challenge}.`;
  const canonicalUrl = toAbsoluteUrl(`/result/${result.shareId}`);
  const imageUrl = toAbsoluteUrl(result.imageUrl);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    robots: {
      index: false,
      follow: true,
      nocache: false
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      siteName: "scaveng.io",
      images: [
        {
          url: imageUrl,
          alt: `${result.displayName}'s scaveng.io submission for ${result.challenge}`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl]
    }
  };
}

export default async function PublicResultPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const result = await repository.getPublicResultPageData(shareId);
  if (!result) {
    notFound();
  }

  return (
    <div className="page shell result-shell">
      <div className="result-card">
        <Link href="/" className="back-btn">Back home</Link>
        <div className="eyebrow closed">Verified result</div>
        <h1 className="lb-title">{result.displayName}</h1>
        <p className="lb-sub">{result.challenge}</p>
        <div className="result-grid">
          <div>
            <div className="section-label">Placement</div>
            <div className="result-rank">{formatOrdinal(result.overallRank)}</div>
            <div className="share-meta">{result.totalRanked} ranked submissions</div>
            <div className="share-meta">{result.isTopFive ? "Top 5 finish" : "Verified official result"}</div>
            <div className="share-meta">Submitted {formatFriendlyDate(result.acceptedAt)}</div>
          </div>
          <img className="result-photo" src={result.imageUrl} alt={`${result.displayName}'s submission for ${result.challenge}`} />
        </div>
      </div>
    </div>
  );
}