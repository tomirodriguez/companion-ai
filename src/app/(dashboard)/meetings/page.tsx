import { authenticationCheck } from "@/lib/authentication-check";
import { loadSearchParams } from "@/modules/agents/params";
import { loadMeetingsSearchParams } from "@/modules/meetings/params";
import { MeetingsListHeader } from "@/modules/meetings/ui/components/meetings-list-header";
import {
	MeetingsView,
	MeetingsViewError,
	MeetingsViewLoading,
} from "@/modules/meetings/ui/view/meetings-view";
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

	const params = await loadMeetingsSearchParams(searchParams);

	const queryClient = getQueryClient();

	void queryClient.prefetchQuery(trpc.meetings.getMany.queryOptions(params));

	return (
		<>
			<MeetingsListHeader />
			<HydrationBoundary state={dehydrate(queryClient)}>
				<Suspense fallback={<MeetingsViewLoading />}>
					<ErrorBoundary fallback={<MeetingsViewError />}>
						<MeetingsView />
					</ErrorBoundary>
				</Suspense>
			</HydrationBoundary>
		</>
	);
}
