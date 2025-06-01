import { EmptyState } from "@/components/empty-state";

export const ProcessingState: React.FC = () => {
	return (
		<div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
			<EmptyState
				image="/meetings/processing.svg"
				title="Meeting completed"
				description="This meeting was completed, summary will appear soon"
			/>
		</div>
	);
};
