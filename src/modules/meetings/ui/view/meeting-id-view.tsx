"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useConfirm } from "@/hooks/use-confirm";
import { useTRPC } from "@/trpc/client";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MeetingIdHeader } from "../components/meeting-id-header";
import { ActiveState } from "../components/states/active-state";
import { CancelledState } from "../components/states/cancel-state";
import { CompletedState } from "../components/states/completed-state";
import { ProcessingState } from "../components/states/processing-state";
import { UpcomingState } from "../components/states/upcoming-state";
import { UpdateMeetingDialog } from "../components/update-meeting-dialog";

type MeetingIdViewProps = {
	meetingId: string;
};

export const MeetingIdView: React.FC<MeetingIdViewProps> = ({ meetingId }) => {
	const trpc = useTRPC();
	const router = useRouter();
	const queryClient = useQueryClient();
	const [ConfirmDialog, confirm] = useConfirm();
	const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);

	const { data } = useSuspenseQuery(
		trpc.meetings.getOne.queryOptions({ id: meetingId }),
	);

	const removeMeeting = useMutation(
		trpc.meetings.remove.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(
					trpc.meetings.getMany.queryOptions(),
				);

				await queryClient.invalidateQueries(
					trpc.premium.getFreeUsage.queryOptions(),
				);

				router.push("/meetings");
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const handleRemoveMeeting = async () => {
		const confirmed = await confirm({
			title: "Are you sure?",
			description: "The following action will remove this meeting.",
		});

		if (!confirmed) return;

		await removeMeeting.mutateAsync({ id: meetingId });
	};

	return (
		<>
			<ConfirmDialog />
			<UpdateMeetingDialog
				open={updateMeetingDialogOpen}
				onOpenChange={setUpdateMeetingDialogOpen}
				initialValues={data}
			/>
			<div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
				<MeetingIdHeader
					meetingName={data.name}
					onEdit={() => setUpdateMeetingDialogOpen(true)}
					onRemove={handleRemoveMeeting}
				/>
				{data.status === "active" && <ActiveState meetingId={meetingId} />}
				{data.status === "cancelled" && <CancelledState />}
				{data.status === "complete" && <CompletedState data={data} />}
				{data.status === "processing" && <ProcessingState />}
				{data.status === "upcoming" && (
					<UpcomingState
						meetingId={meetingId}
						onCancelMeeting={() => {}}
						isCancelling={false}
					/>
				)}
			</div>
		</>
	);
};

export const MeetingIdViewLoading = () => {
	return (
		<LoadingState
			title="Loading Meeting"
			description="This may take a few seconds"
		/>
	);
};

export const MeetingIdViewError = () => {
	return (
		<ErrorState
			title="Failed loading Meeting"
			description="Please try again later"
		/>
	);
};
