import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import {
	AgentsView,
	AgentsViewError,
	AgentsViewLoading,
} from "@/modules/agents/ui/views/agents-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default async function Page() {
	const queryClient = getQueryClient();

	void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions());

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<AgentsViewLoading />}>
				<ErrorBoundary FallbackComponent={AgentsViewError}>
					<AgentsView />
				</ErrorBoundary>
			</Suspense>
		</HydrationBoundary>
	);
}
