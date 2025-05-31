import { authenticationCheck } from "@/lib/authentication-check";
import { loadSearchParams } from "@/modules/agents/params";
import { getQueryClient, trpc } from "@/trpc/server";
import type { SearchParams } from "nuqs/server";

type Props = {
	searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: Props) {
	await authenticationCheck();

	const params = await loadSearchParams(searchParams);

	const queryClient = getQueryClient();

	void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions(params));
	return <div>Meeting ID page</div>;
}
