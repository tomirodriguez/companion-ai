import { CommandSelect } from "@/components/command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import { useState } from "react";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

export const MeetingsAgentFilter = () => {
	const [filters, setFilters] = useMeetingsFilters();

	const trpc = useTRPC();

	const [agentSearch, setAgentSearch] = useState("");

	const { data } = useQuery(
		trpc.agents.getMany.queryOptions({
			pageSize: 100,
			search: agentSearch,
		}),
	);

	const updateAgentSearch = debounce(
		(value: string) => setAgentSearch(value),
		300,
	);

	return (
		<CommandSelect
			className="h-9"
			placeholder="Agent"
			options={(data?.items ?? []).map((agent) => ({
				id: agent.id,
				value: agent.id,
				children: (
					<div className="flex items-center gap-x-2">
						<GeneratedAvatar
							seed={agent.name}
							variant="botttsNeutral"
							className="size-4"
						/>
						{agent.name}
					</div>
				),
			}))}
			onSelect={(value) => setFilters({ agentId: value })}
			onSearch={updateAgentSearch}
			value={filters.agentId ?? ""}
		/>
	);
};
