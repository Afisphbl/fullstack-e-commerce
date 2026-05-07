import React from "react";
import { Button } from "@/components/ui/button";

interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  currentRecords: number;
  isFetching: boolean;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export const UserPagination: React.FC<UserPaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  currentRecords,
  isFetching,
  isLoading,
  onPageChange,
}) => {
  return (
    <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {currentRecords} of {totalRecords} records
        {isFetching && !isLoading ? " • Refreshing..." : ""}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="rounded-xl"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <div className="rounded-xl border border-border/70 px-4 py-2 text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
