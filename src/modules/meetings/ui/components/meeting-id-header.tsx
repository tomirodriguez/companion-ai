import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	ChevronRightIcon,
	MoreVerticalIcon,
	PencilIcon,
	TrashIcon,
} from "lucide-react";
import Link from "next/link";

type MeetingIdHeaderProps = {
	meetingName: string;
	onEdit: () => void;
	onRemove: () => void;
};

export const MeetingIdHeader: React.FC<MeetingIdHeaderProps> = ({
	meetingName,
	onEdit,
	onRemove,
}) => {
	return (
		<div className="flex items-center justify-between">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild className="font-medium text-xl">
							<Link href={"/meetings"}>My Meetings</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator className="text-foreground text-xl font-medium [&>svg]:size-4">
						<ChevronRightIcon />
					</BreadcrumbSeparator>
					<BreadcrumbItem>
						<BreadcrumbPage className="font-medium text-xl">
							{meetingName}
						</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" type="button">
						<MoreVerticalIcon />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem onClick={onEdit}>
						<PencilIcon className="size-4 text-black" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onRemove}>
						<TrashIcon className="size-4 text-black" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};
