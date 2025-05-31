import {
	CircleCheckIcon,
	CircleXIcon,
	ClockArrowUpIcon,
	LoaderIcon,
	type LucideIcon,
} from "lucide-react";
import type { meetingStatusValues } from "../constants";

export const statusIconMap: Record<
	(typeof meetingStatusValues)[number],
	LucideIcon
> = {
	upcoming: ClockArrowUpIcon,
	active: LoaderIcon,
	complete: CircleCheckIcon,
	processing: LoaderIcon,
	cancelled: CircleXIcon,
};
