"use client";

import { ErrorState } from "@/components/error-state";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { LoadingState } from "@/components/loading-state";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/hooks/use-confirm";
import { useTRPC } from "@/trpc/client";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MeetingIdHeader } from "../components/meeting-id-header";
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
				<div className="bg-white rounded-lg border">
					<div className="px-4 py-5 gap-y-5 flex flex-col cal-span-5">
						<div className="flex items-center gap-x-3">
							<GeneratedAvatar
								variant="botttsNeutral"
								seed={data.name}
								className="size-10"
							/>
							<h2 className="text-2xl font-medium">{data.name}</h2>
						</div>
						<Badge
							variant="outline"
							className="flex items-center gap-x-2 [&>svg]:size-4"
						>
							<VideoIcon className="text-primary" />
							{/* {data.meetingCount}{" "}
							{data.meetingCount === 1 ? "meeting" : "meetings"} */}
						</Badge>
						<div className="flex flex-col gap-y-4">
							<p className="text-lg font-medium">Instructions</p>
							{/* <p className="text-neutral-800">{data.instructions}</p> */}
						</div>
					</div>
				</div>
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
