import { DEFAULT_PAGE } from "@/constants";
import {
	createLoader,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
} from "nuqs/server";
import { meetingStatusValues } from "./constants";

export const filtersSearchParams = {
	search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
	page: parseAsInteger
		.withDefault(DEFAULT_PAGE)
		.withOptions({ clearOnDefault: true }),
	status: parseAsStringLiteral(meetingStatusValues),
	agentId: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

export const loadMeetingsSearchParams = createLoader(filtersSearchParams);
