import { HomePageClient } from "@/components/home-page";
import { getIdentity } from "@/lib/identity";
import { repository } from "@/lib/repository";
import { isPreviewState } from "@/lib/time";

export default async function Home({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const params = await searchParams;
  const identity = await getIdentity();
  const previewState = isPreviewState(params.state) ? params.state : undefined;
  const data = await repository.getHomePageData(identity, previewState);

  return <HomePageClient initialData={data} />;
}

