import { useMemo } from "react";
import { useHotkeys } from "@blueprintjs/core";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { IClipboard } from "../../../store/reducers/i-clipboard";

interface UseStageHotkeysParams {
  selectedObjectIds: string[];
  objectById: { [id: string]: IObject };
  activeLayerId: string | null;
  clipboard: IClipboard;
  _groupObjects: (objectIds: string[]) => void;
  _ungroupObject: (groupId: string) => void;
  _duplicateObjects: (ids: string[]) => void;
  _deleteObjects: (ids: string[]) => void;
  _cutToClipboard: (payload: Pick<IClipboard, "entityType" | "entityIds">) => void;
  _copyToClipboard: (payload: Pick<IClipboard, "entityType" | "entityIds">) => void;
  _pasteObjectsFromClipboard: (toLayerId: string) => void;
  _clearClipboard: () => void;
}

export function useStageHotkeys({
  selectedObjectIds,
  objectById,
  activeLayerId,
  clipboard,
  _groupObjects,
  _ungroupObject,
  _duplicateObjects,
  _deleteObjects,
  _cutToClipboard,
  _copyToClipboard,
  _pasteObjectsFromClipboard,
  _clearClipboard,
}: UseStageHotkeysParams) {
  const groupingAllowed = selectedObjectIds.length > 1;
  const ungroupingAllowed =
    selectedObjectIds.length === 1 &&
    objectById[selectedObjectIds[0]]?.type === "group";

  const hotkeys = useMemo(
    () => [
      {
        combo: "cmd + G",
        global: true,
        label: "Group or Ungroup objects",
        onKeyDown: (e: Event) => {
          e.preventDefault();
          if (groupingAllowed) {
            _groupObjects(selectedObjectIds);
          } else if (ungroupingAllowed) {
            _ungroupObject(selectedObjectIds[0]);
          }
        },
      },
      {
        combo: "cmd + D",
        global: true,
        label: "Duplicate objects",
        onKeyDown: (e: Event) => {
          e.preventDefault();
          _duplicateObjects(selectedObjectIds);
        },
      },
      {
        combo: "del",
        global: true,
        label: "Delete objects",
        onKeyDown: (e: Event) => {
          if ((e.target as Element).closest("input")) {
            return;
          }
          e.preventDefault();
          _deleteObjects(selectedObjectIds);
        },
      },
      {
        combo: "cmd + X",
        global: true,
        label: "Cut",
        onKeyDown: () => {
          _cutToClipboard({
            entityIds: selectedObjectIds,
            entityType: "object",
          });
        },
      },
      {
        combo: "cmd + C",
        global: true,
        label: "Copy",
        onKeyDown: () => {
          _copyToClipboard({
            entityIds: selectedObjectIds,
            entityType: "object",
          });
        },
      },
      {
        combo: "cmd + V",
        global: true,
        label: "Paste",
        onKeyDown: () => {
          if (!!clipboard.entityIds && activeLayerId) {
            _pasteObjectsFromClipboard(activeLayerId);
          }
        },
      },
      {
        combo: "backspace",
        global: true,
        label: "Delete",
        onKeyDown: (e) => {
          if (
            (e.target as Element).closest("input") ||
            (e.target as Element).closest(".MainToolCanvas")
          ) {
            return;
          }
          if (selectedObjectIds.length > 0) {
            _deleteObjects(selectedObjectIds);
          }
        },
      },
      {
        combo: "esc",
        global: true,
        label: "Escape",
        onKeyDown: () => {
          if (!!clipboard.entityIds) {
            _clearClipboard();
          }
        },
      },
    ],
    [
      _deleteObjects,
      _ungroupObject,
      selectedObjectIds,
      _duplicateObjects,
      _copyToClipboard,
      _cutToClipboard,
      clipboard,
      activeLayerId,
      groupingAllowed,
      ungroupingAllowed,
    ],
  );

  useHotkeys(hotkeys);
}
