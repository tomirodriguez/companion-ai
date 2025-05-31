import { CommandSelect } from "@/components/command-select";
import { meetingStatusValues } from "../../constants";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { statusIconMap } from "../utils";

const options = meetingStatusValues.map((meetingStatus) => {
	const Icon = statusIconMap[meetingStatus];

	return {
		id: meetingStatus,
		value: meetingStatus,
		children: (
			<div className="flex items-center gap-x-2 capitalize">
				<Icon />
				{meetingStatus}
			</div>
		),
	};
});

export const MeetingsStatusFilter = () => {
	const [filters, setFilters] = useMeetingsFilters();

	return (
		<CommandSelect
			placeholder="Status"
			className="h-9"
			options={options}
			onSelect={(value) => setFilters({ status: value })}
			value={filters.status ?? null}
		/>
	);
};
