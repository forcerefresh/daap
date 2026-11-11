import React, { useEffect } from "react";
import cx from "classnames";
import InfiniteScroll from "react-infinite-scroll-component";
import { Spinner } from "@blueprintjs/core";
import { DrawerShell } from "../drawer-shell/DrawerShell";
import { LibrarySearchBar } from "../library-search-bar/LibrarySearchBar";
import { ConfirmDeleteDialog } from "../confirm-delete-dialog/ConfirmDeleteDialog";
import { usePaginatedSearch, PaginatedFetchFn } from "../hooks/usePaginatedSearch";
import { useConfirmDelete } from "../hooks/useConfirmDelete";
import css from "./LibraryPanel.module.scss";

export { default as libraryCss } from "./LibraryPanel.module.scss";

export type LibraryColumnDef = {
  key: string;
  label: string;
};

export type LibraryRowCtx = {
  onDelete: (id: string) => void;
  classes: Record<string, string>;
};

export type LibraryPanelProps<T extends { id: string }> = {
  title: string;
  fetchFn: PaginatedFetchFn<T>;
  columns: LibraryColumnDef[];
  renderRow: (item: T, ctx: LibraryRowCtx) => React.ReactNode;
  onDelete: (id: string, removeItem: (id: string) => void) => Promise<void>;
  deleteMessage: (item: T | undefined) => React.ReactNode;
  uploadSlot?: React.ReactNode;
  searchPlaceholder?: string;
};

export function LibraryPanel<T extends { id: string }>(
  props: LibraryPanelProps<T>
) {
  const {
    title,
    fetchFn,
    columns,
    renderRow,
    onDelete,
    deleteMessage,
    uploadSlot,
    searchPlaceholder,
  } = props;

  const {
    items,
    loading,
    hasMore,
    searchValue,
    setSearchValue,
    fetchNext,
    fetchFirst,
    removeItem,
  } = usePaginatedSearch(fetchFn);

  const { isOpen, isLoading, pendingId, requestDelete, confirmDelete, cancelDelete } =
    useConfirmDelete();

  useEffect(() => {
    fetchFirst();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = () => {
    if (!pendingId) return;
    const id = pendingId;
    confirmDelete(() => onDelete(id, removeItem));
  };

  const rowCtx: LibraryRowCtx = {
    onDelete: requestDelete,
    classes: css as unknown as Record<string, string>,
  };

  return (
    <DrawerShell title={title}>
      {uploadSlot}
      <div className={css.headerSection}>
        <LibrarySearchBar
          value={searchValue}
          onChange={setSearchValue}
          onSearch={fetchFirst}
          placeholder={searchPlaceholder ?? `Find ${title.toLowerCase()}...`}
        />
      </div>
      <div className={cx(css.headerSection, css.tableHeader)}>
        {columns.map((col) => (
          <div
            key={col.key}
            className={(css as unknown as Record<string, string>)[col.key]}
          >
            {col.label}
          </div>
        ))}
      </div>
      <div className={css.mainSection} id="mediaHolder">
        <InfiniteScroll
          dataLength={items.length || -1}
          next={fetchNext}
          hasMore={hasMore}
          loader={
            <div style={{ textAlign: "center", margin: "20px" }}>
              <Spinner size={50} />
            </div>
          }
          scrollableTarget="mediaHolder"
          scrollThreshold="5px"
          endMessage={
            <p
              style={{
                textAlign: "center",
                display: loading ? "none" : "block",
              }}
            >
              {items.length === 0 ? (
                <b>No {title.toLowerCase()} were found for the chosen criteria.</b>
              ) : (
                <b>All {title.toLowerCase()} have been loaded for the chosen criteria.</b>
              )}
            </p>
          }
        >
          {items.map((item) => (
            <div key={item.id}>
              <div className={cx(css.headerSection, css.tableRow)}>
                {renderRow(item, rowCtx)}
              </div>
            </div>
          ))}
        </InfiniteScroll>
      </div>
      <ConfirmDeleteDialog
        isOpen={isOpen}
        isLoading={isLoading}
        message={deleteMessage(items.find((i) => i.id === pendingId))}
        onConfirm={handleConfirm}
        onCancel={cancelDelete}
      />
    </DrawerShell>
  );
}
