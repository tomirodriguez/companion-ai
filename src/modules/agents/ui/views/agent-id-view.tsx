"use client";

import { ErrorState } from "@/components/error-state";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { LoadingState } from "@/components/loading-state";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/hooks/use-confirm";
import { useTRPC } from "@/trpc/client";
import {
	QueryClient,
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AgentIdHeader } from "../components/agent-id-header";
import { UpdateAgentDialog } from "../components/update-agent-dialog";

type AgentIdViewProps = {
	agentId: string;
};

export const AgentIdView: React.FC<AgentIdViewProps> = ({ agentId }) => {
	const trpc = useTRPC();
	const router = useRouter();
	const queryClient = useQueryClient();
	const [ConfirmDialog, confirm] = useConfirm();
	const [updateAgentDialogOpen, setUpdateAgentDialogOpen] = useState(false);

	const { data } = useSuspenseQuery(
		trpc.agents.getOne.queryOptions({ id: agentId }),
	);

	const removeAgent = useMutation(
		trpc.agents.remove.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions());
				router.push("/agents");
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const handleRemoveAgent = async () => {
		const confirmed = await confirm({
			title: "Are you sure?",
			description: `The following action will remove ${data.meetingCount} associated meetings`,
		});

		if (!confirmed) return;

		await removeAgent.mutateAsync({ id: agentId });
	};

	return (
		<>
			<ConfirmDialog />
			<UpdateAgentDialog
				open={updateAgentDialogOpen}
				onOpenChange={setUpdateAgentDialogOpen}
				initialValues={data}
			/>
			<div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
				<AgentIdHeader
					agentId={agentId}
					agentName={data.name}
					onEdit={() => setUpdateAgentDialogOpen(true)}
					onRemove={handleRemoveAgent}
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
							{data.meetingCount}{" "}
							{data.meetingCount === 1 ? "meeting" : "meetings"}
						</Badge>
						<div className="flex flex-col gap-y-4">
							<p className="text-lg font-medium">Instructions</p>
							<p className="text-neutral-800">{data.instructions}</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export const AgentsIdViewLoading = () => {
	return (
		<LoadingState
			title="Loading Agent"
			description="This may take a few seconds"
		/>
	);
};

export const AgentsIdViewError = () => {
	return (
		<ErrorState
			title="Failed loading Agent"
			description="Please try again later"
		/>
	);
};
