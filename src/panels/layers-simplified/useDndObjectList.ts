import { useCallback, useEffect, useRef, useState } from "react";
import update from "immutability-helper";

export type DndItem = {
  parentType: "layer" | "type";
  parentId: string;
  parentName?: string;
  layerId: string;
  layerName?: string;
  objectId: string;
};

/** Converts display-order (top-first) array to store order (bottom-first). */
export function toStoreOrder<T>(items: T[]): T[] {
  return [...items].reverse();
}

export function useDndObjectList(baseItems: DndItem[], selectedObjectIds: string[]) {
  const [sortedItems, setSortedItems] = useState<DndItem[] | undefined>();
  const [hoverIndex, setHoverIndex] = useState(-1);
  const [fromLayerId, setFromLayerId] = useState<string | null>(null);
  const [toLayerId, setToLayerId] = useState<string | null>(null);

  const displayItems = sortedItems ?? baseItems;

  // Ref so moveObject always reads the latest items without stale closures.
  const displayItemsRef = useRef(displayItems);
  displayItemsRef.current = displayItems;

  /**
   * Moves one item or a group of items from dragIndex to hoverIndex.
   * Returns the new index of the primary dragged item so the caller can
   * update item.index for correct subsequent hover detection.
   */
  const moveObject = useCallback(
    (dragIndex: number, hoverIndex: number, draggingIds: string[]): number => {
      const items = displayItemsRef.current;

      setFromLayerId((prev) => prev ?? items[dragIndex]?.layerId ?? null);
      setToLayerId(items[hoverIndex]?.layerId ?? null);
      setHoverIndex(hoverIndex);

      if (draggingIds.length <= 1) {
        // ── Single-item move (original logic) ──────────────────────────
        const dragged: DndItem = {
          ...items[dragIndex],
          layerId: items[hoverIndex].layerId,
          layerName: items[hoverIndex].layerName,
        };
        const next = update(items, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragged],
          ],
        });
        setSortedItems(next);
        displayItemsRef.current = next;
        return hoverIndex;
      }

      // ── Multi-item group move ──────────────────────────────────────────
      const draggingSet = new Set(draggingIds);
      const primaryObjectId = items[dragIndex]?.objectId;

      // If hovering over a member of the dragging group itself, skip.
      if (draggingSet.has(items[hoverIndex]?.objectId)) {
        return dragIndex;
      }

      const targetLayerId = items[hoverIndex]?.layerId;
      const targetLayerName = items[hoverIndex]?.layerName;

      // Collect dragging items in their current relative order, updating layerId.
      const draggingItems = items
        .filter((item) => draggingSet.has(item.objectId))
        .map((item) => ({
          ...item,
          layerId: targetLayerId ?? item.layerId,
          layerName: targetLayerName ?? item.layerName,
        }));

      // Remove dragging items from the list.
      const remaining = items.filter((item) => !draggingSet.has(item.objectId));

      // Find the hover item inside the remaining (non-dragging) list.
      const hoverItemIdx = remaining.findIndex(
        (r) => r.objectId === items[hoverIndex]?.objectId,
      );

      // Decide insertion point based on drag direction.
      let insertIdx: number;
      if (dragIndex < hoverIndex) {
        // Moving down → insert the group AFTER the hover item.
        insertIdx = hoverItemIdx + 1;
      } else {
        // Moving up → insert the group BEFORE the hover item.
        insertIdx = hoverItemIdx;
      }

      insertIdx = Math.max(0, Math.min(insertIdx, remaining.length));

      const next = [...remaining];
      next.splice(insertIdx, 0, ...draggingItems);

      setSortedItems(next);
      displayItemsRef.current = next;

      const newPrimaryIdx = next.findIndex((r) => r.objectId === primaryObjectId);
      return newPrimaryIdx >= 0 ? newPrimaryIdx : hoverIndex;
    },
    [baseItems],
  );

  const reset = useCallback(() => {
    setSortedItems(undefined);
    setHoverIndex(-1);
    setFromLayerId(null);
    setToLayerId(null);
  }, []);

  useEffect(() => {
    const el = document.getElementsByClassName(
      "layers-simplified-object-item-" + selectedObjectIds[0],
    )[0];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [selectedObjectIds]);

  return { displayItems, sortedItems, hoverIndex, moveObject, reset, fromLayerId, toLayerId };
}
