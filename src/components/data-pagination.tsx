import { Button } from "@/components/ui/button";

type DataPaginationProps = {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
};

export const DataPagination: React.FC<DataPaginationProps> = ({
	page,
	totalPages,
	onPageChange,
}) => {
	return (
		<div className="flex items-center justify-between">
			<div className="flex-1 text-sm text-muted-foreground">
				Page {page} of {totalPages || 1}
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={page === 1}
					onClick={() => onPageChange(Math.max(1, page - 1))}
				>
					Previous
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={page === totalPages || totalPages === 0}
					onClick={() => onPageChange(Math.min(totalPages, page + 1))}
				>
					Next
				</Button>
			</div>
		</div>
	);
};
