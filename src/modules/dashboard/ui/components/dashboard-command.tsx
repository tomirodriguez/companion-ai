import {
	CommandInput,
	CommandItem,
	CommandList,
	CommandResponsiveDialog,
} from "@/components/ui/command";
import type { Dispatch, SetStateAction } from "react";

type DashboardCommandProps = {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
};

export const DashboardCommand: React.FC<DashboardCommandProps> = ({
	open,
	setOpen,
}) => {
	return (
		<CommandResponsiveDialog open={open} onOpenChange={setOpen}>
			<CommandInput placeholder="Find a meeting or agent" />
			<CommandList>
				<CommandItem>Test</CommandItem>
			</CommandList>
		</CommandResponsiveDialog>
	);
};
