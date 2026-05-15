import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("admin");
  return (
    <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        {t("showingRecords", { count: currentRecords, total: totalRecords })}
        {isFetching && !isLoading ? ` • ${t("refreshing")}` : ""}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="rounded-xl"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          {t("prev")}
        </Button>
        <div className="rounded-xl border border-border/70 px-4 py-2 text-sm text-muted-foreground">
          {t("pageOf", { page: currentPage, totalPages: totalPages })}
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          {t("next")}
        </Button>
      </div>
    </div>
  );
};
