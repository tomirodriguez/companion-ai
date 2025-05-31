"use client";

import { CommandSelect } from "@/components/command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import { Divide } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { meetingsInsertSchema } from "../../schemas";
import type { MeetingGetOne } from "../../types";

type MeetingFormProps = {
	initialValues?: MeetingGetOne;

	onSuccess?: (id?: string) => void;
	onCancel?: () => void;
};

export const MeetingForm: React.FC<MeetingFormProps> = ({
	initialValues,
	onSuccess,
	onCancel,
}) => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [agentSearch, setAgentSearch] = useState("");
	const [openNewAgentDialog, setOpenNewAgentDialog] = useState(false);

	const agents = useQuery(
		trpc.agents.getMany.queryOptions({
			pageSize: 50,
			search: agentSearch,
		}),
	);

	const createMeeting = useMutation(
		trpc.meetings.create.mutationOptions({
			onSuccess: async (data) => {
				await queryClient.invalidateQueries(
					trpc.meetings.getMany.queryOptions(),
				);

				onSuccess?.(data.id);
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const updateMeeting = useMutation(
		trpc.meetings.update.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(
					trpc.meetings.getMany.queryOptions(),
				);

				if (initialValues?.id) {
					await queryClient.invalidateQueries(
						trpc.meetings.getOne.queryOptions({ id: initialValues.id }),
					);
				}

				onSuccess?.();
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const form = useForm<z.infer<typeof meetingsInsertSchema>>({
		resolver: zodResolver(meetingsInsertSchema),
		defaultValues: {
			name: initialValues?.name ?? "",
			agentId: initialValues?.agentId ?? "",
		},
	});

	const isEdit = !!initialValues?.id;
	const isPending = createMeeting.isPending || updateMeeting.isPending;

	const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
		if (isEdit) {
			updateMeeting.mutate({ ...values, id: initialValues.id });
		} else {
			createMeeting.mutate(values);
		}
	};

	const handleAgentSearch = debounce(
		(search: string) => setAgentSearch(search),
		300,
	);

	return (
		<>
			<NewAgentDialog
				open={openNewAgentDialog}
				onOpenChange={setOpenNewAgentDialog}
			/>
			<Form {...form}>
				<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						name="name"
						control={form.control}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input {...field} placeholder="e.g. English class" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						name="agentId"
						control={form.control}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Agent</FormLabel>
								<FormControl>
									<CommandSelect
										options={(agents.data?.items ?? []).map((agent) => ({
											id: agent.id,
											value: agent.id,
											children: (
												<div className="flex items-center gap-x-2">
													<GeneratedAvatar
														seed={agent.name}
														variant={"botttsNeutral"}
														className="border size-6"
													/>
													<span>{agent.name}</span>
												</div>
											),
										}))}
										onClose={() => setAgentSearch("")}
										onSelect={field.onChange}
										onSearch={handleAgentSearch}
										value={field.value}
										placeholder="Select an agent"
									/>
								</FormControl>
								<FormDescription>
									Not found what you're looking for?{" "}
									<button
										type="button"
										className="text-primary hover:underline"
										onClick={() => setOpenNewAgentDialog(true)}
									>
										Create new agent
									</button>
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex items-center justify-between">
						{onCancel && (
							<Button
								variant="ghost"
								disabled={isPending}
								type="button"
								onClick={() => onCancel()}
							>
								Cancel
							</Button>
						)}
						<Button disabled={isPending} type="submit">
							{isEdit ? "Update" : "Create"}
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
};
