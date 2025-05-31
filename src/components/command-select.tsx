import { cn } from "@/lib/utils";
import { ChevronsUpDownIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import {
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
	CommandResponsiveDialog,
} from "./ui/command";

type CommandSelectProps = {
	options: Array<{ id: string; value: string; children: React.ReactNode }>;
	onSelect: (value: string) => void;
	onSearch?: (value: string) => void;
	value: string;
	placeholder?: string;
	isSearchable?: boolean;
	className?: string;
	onClose?: () => void;
};

export const CommandSelect: React.FC<CommandSelectProps> = ({
	options,
	value,
	placeholder,
	isSearchable,
	className,
	onSelect,
	onSearch,
	onClose,
}) => {
	const [open, setOpen] = useState(false);
	const selectedOption = options.find((option) => option.value === value);

	return (
		<>
			<Button
				onClick={() => setOpen(true)}
				type="button"
				variant="outline"
				className={cn(
					"h-9 justify-between font-normal px-2",
					!selectedOption && "text-muted-foreground",
					className,
				)}
			>
				<div>{selectedOption?.children ?? placeholder}</div>
				<ChevronsUpDownIcon />
			</Button>
			<CommandResponsiveDialog
				open={open}
				onOpenChange={(open) => {
					setOpen(open);
					onClose?.();
				}}
				shouldFilter={!onSearch}
			>
				<CommandInput placeholder="Search..." onValueChange={onSearch} />
				<CommandList>
					<CommandEmpty>
						<span className="text-muted-foreground text-sm">
							No options found
						</span>
					</CommandEmpty>
					{options.map((option) => (
						<CommandItem
							key={option.id}
							onSelect={() => {
								onSelect(option.value);
								setOpen(false);
							}}
						>
							{option.children}
						</CommandItem>
					))}
				</CommandList>
			</CommandResponsiveDialog>
		</>
	);
};
