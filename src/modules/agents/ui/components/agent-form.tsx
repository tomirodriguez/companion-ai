import { GeneratedAvatar } from "@/components/generated-avatar";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { agentsInsertSchema } from "../../schemas";
import type { AgentGetOne } from "../../types";

type AgentFormProps = {
	initialValues?: AgentGetOne;

	onSuccess?: () => void;
	onCancel?: () => void;
};

export const AgentForm: React.FC<AgentFormProps> = ({
	initialValues,
	onSuccess,
	onCancel,
}) => {
	const [seed, setSeed] = useState(initialValues?.name ?? "");
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const createAgent = useMutation(
		trpc.agents.create.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions());

				onSuccess?.();
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const updateAgent = useMutation(
		trpc.agents.update.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions());

				if (initialValues?.id) {
					await queryClient.invalidateQueries(
						trpc.agents.getOne.queryOptions({ id: initialValues.id }),
					);
				}

				onSuccess?.();
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const form = useForm<z.infer<typeof agentsInsertSchema>>({
		resolver: zodResolver(agentsInsertSchema),
		defaultValues: {
			name: initialValues?.name ?? "",
			instructions: initialValues?.instructions ?? "",
		},
	});

	const isEdit = !!initialValues?.id;
	const isPending = createAgent.isPending || updateAgent.isPending;

	const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
		if (isEdit) {
			updateAgent.mutate({ ...values, id: initialValues.id });
		} else {
			createAgent.mutate(values);
		}
	};

	const updateSeed = debounce((name: string) => {
		setSeed(name);
	}, 1000);

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
				<GeneratedAvatar
					seed={seed}
					variant={"botttsNeutral"}
					className="border size-16"
				/>
				<FormField
					name="name"
					control={form.control}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder="e.g. English tutor"
									onChange={(e) => {
										field.onChange(e);
										updateSeed(e.target.value);
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					name="instructions"
					control={form.control}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Instructions</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									placeholder="You are a helpful english assistant that can teach me how to improve my english."
								/>
							</FormControl>
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
	);
};
