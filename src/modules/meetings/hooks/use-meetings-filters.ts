import { DEFAULT_PAGE } from "@/constants";
import {
	parseAsInteger,
	parseAsString,
	parseAsStringEnum,
	parseAsStringLiteral,
	useQueryStates,
} from "nuqs";
import { meetingStatusValues } from "../constants";

export const useMeetingsFilters = () => {
	return useQueryStates({
		search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
		page: parseAsInteger
			.withDefault(DEFAULT_PAGE)
			.withOptions({ clearOnDefault: true }),
		status: parseAsStringLiteral(meetingStatusValues),
		agentId: parseAsString
			.withDefault("")
			.withOptions({ clearOnDefault: true }),
	});
};
