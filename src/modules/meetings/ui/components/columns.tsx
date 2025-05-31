"use client";

import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";
import humanizeDuration from "humanize-duration";
import {
	CircleCheckIcon,
	CircleXIcon,
	ClockArrowUpIcon,
	ClockFadingIcon,
	CornerDownRightIcon,
	LoaderIcon,
	type LucideIcon,
	VideoIcon,
} from "lucide-react";
import type { MeetingGetMany } from "../../types";

function formatDuration(seconds: number) {
	return humanizeDuration(seconds * 1000, {
		largest: 1,
		round: true,
		units: ["h", "m", "s"],
	});
}

const statusIconMap: Record<MeetingGetMany[number]["status"], LucideIcon> = {
	upcoming: ClockArrowUpIcon,
	active: LoaderIcon,
	complete: CircleCheckIcon,
	processing: LoaderIcon,
	cancelled: CircleXIcon,
};

const statusColorMap: Record<MeetingGetMany[number]["status"], string> = {
	upcoming: "bg-yellow-500/20 text-yellow-800 border-yellow-800/5",
	active: "bg-blue-500/20 text-blue-800 border-blue-800/5",
	complete: "bg-emerald-500/20 text-emerald-800 border-emerald-800/5",
	cancelled: "bg-rose-500/20 text-rose-800 border-rose-800/5",
	processing: "bg-gray-300/20 text-gray-800 border-gray-800/5",
};

export const columns: ColumnDef<MeetingGetMany[number]>[] = [
	{
		accessorKey: "name",
		header: "Meeting Name",
		cell: ({ row }) => (
			<div className="flex flex-col gap-y-1">
				<span className="font-semibold capitalize">{row.original.name}</span>
				<div className="flex items-center gap-x-2">
					<div className="flex items-center gap-x-1">
						<CornerDownRightIcon className="size-3 text-muted-foreground" />
						<span className="text-sm text-muted-foreground max-w-[200px] truncate capitalize">
							{row.original.agent.name}
						</span>
					</div>
					<GeneratedAvatar
						seed={row.original.agent.name}
						variant={"botttsNeutral"}
						className="size-4"
					/>
				</div>
				<span>
					{row.original.startedAt
						? format(row.original.startedAt, "MMM d")
						: ""}
				</span>
			</div>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const Icon = statusIconMap[row.original.status];

			return (
				<Badge
					variant={"outline"}
					className={cn(
						"capitalize [&>svg]:size-4 text-muted-foreground",
						statusColorMap[row.original.status],
					)}
				>
					<Icon
						className={cn(
							row.original.status === "processing" && "animate-spin",
						)}
					/>
					{row.original.status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "duration",
		header: "Duration",
		cell: ({ row }) => {
			return (
				<Badge
					variant="outline"
					className={cn(
						"capitalize [&>svg]:size-4 text-muted-foreground flex items-center gap-x-2",
						statusColorMap[row.original.status],
					)}
				>
					<ClockFadingIcon className="text-blue-700" />
					{row.original.duration
						? formatDuration(row.original.duration)
						: "No duration"}
				</Badge>
			);
		},
	},
];
