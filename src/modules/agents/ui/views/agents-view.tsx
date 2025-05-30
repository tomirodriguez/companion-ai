"use client";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { columns } from "../components/columns";
import { DataPagination } from "../components/data-pagination";
import { DataTable } from "../components/data-table";

export const AgentsView = () => {
	const [filters, setFilters] = useAgentsFilters();
	const trpc = useTRPC();

	const { data } = useSuspenseQuery(
		trpc.agents.getMany.queryOptions({
			...filters,
		}),
	);

	return (
		<div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
			<DataTable data={data.items} columns={columns} />
			<DataPagination
				page={filters.page}
				totalPages={data.pages}
				onPageChange={(page) => setFilters({ page })}
			/>
			{data.items.length === 0 && (
				<EmptyState
					title="Create your first agent"
					description="Create an agent to join your meeting. Each agent will follow your instructions and can interact with participants during the call"
				/>
			)}
		</div>
	);
};

export const AgentsViewLoading = () => {
	return (
		<LoadingState
			title="Loading Agents"
			description="This may take a few seconds"
		/>
	);
};

export const AgentsViewError = () => {
	return (
		<ErrorState
			title="Failed loading Agents"
			description="Please try again later"
		/>
	);
};
