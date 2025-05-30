import { authenticationCheck } from "@/lib/authentication-check";
import { loadSearchParams } from "@/modules/agents/params";
import { AgentsListHeader } from "@/modules/agents/ui/components/agents-list-header";
import {
	AgentsView,
	AgentsViewError,
	AgentsViewLoading,
} from "@/modules/agents/ui/views/agents-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
	searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: Props) {
	await authenticationCheck();

	const params = await loadSearchParams(searchParams);

	const queryClient = getQueryClient();

	void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions(params));

	return (
		<>
			<AgentsListHeader />
			<HydrationBoundary state={dehydrate(queryClient)}>
				<Suspense fallback={<AgentsViewLoading />}>
					<ErrorBoundary FallbackComponent={AgentsViewError}>
						<AgentsView />
					</ErrorBoundary>
				</Suspense>
			</HydrationBoundary>
		</>
	);
}
