import { Input } from "@/components/ui/input";
import { DEFAULT_PAGE } from "@/constants";
import debounce from "lodash.debounce";
import { SearchIcon } from "lucide-react";
import type { ChangeEvent } from "react";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

export const MeetingsSearchFilter = () => {
	const [filters, setFilter] = useMeetingsFilters();

	const updateFilters = debounce(
		(e: ChangeEvent<HTMLInputElement>) =>
			setFilter({ search: e.target.value, page: DEFAULT_PAGE }),
		300,
	);

	return (
		<div className="relative">
			<Input
				placeholder="Filter by name"
				className="h-9 bg-white w-[200px] pl-7"
				defaultValue={filters.search}
				onChange={updateFilters}
			/>
			<SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
		</div>
	);
};
