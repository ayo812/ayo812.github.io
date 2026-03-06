import { HistoryPage } from "@/components/history-page";
import { getIdentity } from "@/lib/identity";
import { repository } from "@/lib/repository";

export default async function HistoryRoute() {
  const identity = await getIdentity();
  const history = await repository.getHistory(identity);

  return <HistoryPage identity={identity} history={history} />;
}

