import { authenticationCheck } from "@/lib/authentication-check";
import {
	MeetingIdView,
	MeetingIdViewError,
	MeetingIdViewLoading,
} from "@/modules/meetings/ui/view/meeting-id-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
	params: Promise<{ meetingId: string }>;
};

export default async function Page({ params }: Props) {
	await authenticationCheck();

	const { meetingId } = await params;

	const queryClient = getQueryClient();

	void queryClient.prefetchQuery(
		trpc.meetings.getOne.queryOptions({ id: meetingId }),
	);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<MeetingIdViewLoading />}>
				<ErrorBoundary fallback={<MeetingIdViewError />}>
					<MeetingIdView meetingId={meetingId} />
				</ErrorBoundary>
			</Suspense>
		</HydrationBoundary>
	);
}
