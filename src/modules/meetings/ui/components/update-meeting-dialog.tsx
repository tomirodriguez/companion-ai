"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import type { MeetingGetOne } from "../../types";
import { MeetingForm } from "./meeting-form";

type UpdateMeetingDialogProps = {
	initialValues: MeetingGetOne;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export const UpdateMeetingDialog: React.FC<UpdateMeetingDialogProps> = ({
	initialValues,
	open,
	onOpenChange,
}) => {
	return (
		<ResponsiveDialog
			title="Update Meeting"
			description="Edit the meeting details"
			open={open}
			onOpenChange={onOpenChange}
		>
			<MeetingForm
				initialValues={initialValues}
				onSuccess={() => onOpenChange(false)}
				onCancel={() => onOpenChange(false)}
			/>
		</ResponsiveDialog>
	);
};
