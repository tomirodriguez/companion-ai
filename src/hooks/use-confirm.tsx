import { ResponsiveAlertDialog } from "@/components/responsive-alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { type JSX, useState } from "react";

type DialogProps = {
	title: string;
	description: string;
	variant?: React.ComponentProps<typeof Button>["variant"];
};

export const useConfirm = (): [
	() => JSX.Element,
	(props: DialogProps) => Promise<unknown>,
] => {
	const [dialogProps, setDialogProps] = useState<DialogProps>({
		title: "",
		description: "",
		variant: "destructive",
	});

	const [promise, setPromise] = useState<{
		resolve: (value: boolean) => void;
	} | null>(null);

	const confirm = (props: DialogProps) => {
		setDialogProps(props);
		return new Promise((resolve) => {
			setPromise({ resolve });
		});
	};

	const handleClose = () => {
		setDialogProps({ title: "", description: "", variant: "destructive" });
		setPromise(null);
	};

	const handleConfirm = () => {
		promise?.resolve(true);
		handleClose();
	};

	const handleCancel = () => {
		promise?.resolve(false);
		handleClose();
	};

	const ConfirmationDialog = () => (
		<ResponsiveAlertDialog
			title={dialogProps.title}
			description={dialogProps.description}
			open={promise !== null}
			onOpenChange={handleClose}
		>
			<div className="pt-4 w-full flex flex-col-reverse gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
				<Button
					type="button"
					variant="outline"
					className="w-full lg:w-auto"
					onClick={handleCancel}
				>
					Cancel
				</Button>
				<Button
					type="button"
					className="w-full lg:w-auto"
					variant={dialogProps.variant ?? "destructive"}
					onClick={handleConfirm}
				>
					Confirm
				</Button>
			</div>
		</ResponsiveAlertDialog>
	);

	return [ConfirmationDialog, confirm];
};
