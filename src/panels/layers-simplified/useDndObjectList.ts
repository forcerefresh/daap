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

  // Ref so moveObject doesn't need displayItems in its dep array
  const displayItemsRef = useRef(displayItems);
  displayItemsRef.current = displayItems;

  const moveObject = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const current = displayItemsRef.current;
      setFromLayerId((prev) => prev ?? current[dragIndex]?.layerId ?? null);
      setToLayerId(current[hoverIndex]?.layerId ?? null);
      setHoverIndex(hoverIndex);
      setSortedItems((prev) => {
        const items = prev ?? baseItems;
        const dragged: DndItem = {
          ...items[dragIndex],
          layerId: items[hoverIndex].layerId,
          layerName: items[hoverIndex].layerName,
        };
        return update(items, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragged],
          ],
        });
      });
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
