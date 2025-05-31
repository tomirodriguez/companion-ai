import { ResponsiveDialog } from "@/components/responsive-dialog";
import type { AgentGetOne } from "../../types";
import { AgentForm } from "./agent-form";

type UpdateAgentDialogProps = {
	initialValues: AgentGetOne;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export const UpdateAgentDialog: React.FC<UpdateAgentDialogProps> = ({
	initialValues,
	open,
	onOpenChange,
}) => {
	return (
		<ResponsiveDialog
			title="Update Agent"
			description="Update the agent details"
			open={open}
			onOpenChange={onOpenChange}
		>
			<AgentForm
				onSuccess={() => onOpenChange(false)}
				onCancel={() => onOpenChange(false)}
				initialValues={initialValues}
			/>
		</ResponsiveDialog>
	);
};
