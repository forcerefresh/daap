import React from "react";
import { Button, ButtonGroup, Colors } from "@blueprintjs/core";
import { Pagination } from "../../../types/pagination";

export const AdvancedPagination = ({
  isFirstPage,
  isLastPage,
  currentPage,
  previousPage,
  nextPage,
  pageCount,
  onPageChange,
  showTotalCount = false,
  totalCount,
}: Pagination & {
  onPageChange: (page: number) => void;
  showTotalCount?: boolean;
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px",
        // borderTop: `1px solid ${Colors.LIGHT_GRAY1}`,
        // backgroundColor: Colors.LIGHT_GRAY5,
      }}
    >
      {/* Left side - Total count (optional) */}
      {showTotalCount && totalCount && (
        <div style={{ color: Colors.GRAY1, fontSize: "14px" }}>
          Total: {totalCount} items
        </div>
      )}

      {/* Center - Pagination controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <ButtonGroup>
          <Button
            icon="chevron-left"
            disabled={isFirstPage}
            onClick={() => onPageChange(previousPage!)}
            minimal
          >
            Previous
          </Button>

          <Button disabled minimal style={{ minWidth: "100px" }}>
            <strong>{currentPage}</strong> / {pageCount}
          </Button>

          <Button
            rightIcon="chevron-right"
            disabled={isLastPage}
            onClick={() => onPageChange(nextPage!)}
            minimal
          >
            Next
          </Button>
        </ButtonGroup>
      </div>

      {/* Right side - Empty space for balance */}
      <div style={{ width: showTotalCount ? "100px" : "0" }}></div>
    </div>
  );
};
