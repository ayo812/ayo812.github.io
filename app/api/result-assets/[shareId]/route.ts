import { repository } from "@/lib/repository";

export async function GET(_: Request, { params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const asset = await repository.getSharedResultAsset(shareId);
  if (!asset) {
    return new Response("Not found", {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, noimageindex"
      }
    });
  }

  return new Response(asset.buffer, {
    status: 200,
    headers: {
      "Content-Type": asset.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": 'inline; filename="scaveng-result"',
      "X-Robots-Tag": "noindex, noimageindex"
    }
  });
}