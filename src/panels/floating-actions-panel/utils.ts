import { debounce, noop } from "lodash-es";
import {
  boundsUnion,
  rect2DOMRect,
} from "../../store/helpers/objectBoundingBox";
import { IObject } from "webslider-sdk/lib/objects/i-object";

export function getFloatingRect(objectIds: string[]) {
  let unionBounds = getObjectRect(objectIds[0]);

  if (objectIds.length > 1) {
    for (let i = 1; i < objectIds.length; i++) {
      let bounds = getObjectRect(objectIds[i]);
      unionBounds = rect2DOMRect(boundsUnion(unionBounds, bounds));
    }
  }

  const contentBounds = getContentAreaBounds();

  if (contentBounds && unionBounds) {
    return {
      ...unionBounds.toJSON(),
      left: unionBounds.left - contentBounds.left,
      top: unionBounds.top - contentBounds.top,
    };
  }

  return contentBounds;
}

export function getContentAreaBounds(): DOMRect {
  const contentEl = document.getElementsByClassName("layout-content-area")[0];
  return contentEl?.getBoundingClientRect();
}

function getObjectRect(objectId: string): DOMRect {
  const objectEl = document.getElementsByClassName(
    `object-holder-${objectId}`
  )[0];

  return objectEl?.getBoundingClientRect();
}

// export const setFloatingActionPanelVisibility = debounce(
//   noop,
//   // setFloatingActionPanelVisibility2,
//   10
// );

export function setFloatingActionPanelVisibility(visible: boolean) {
  // const el = document.getElementsByClassName(
  //   "floating-action-panel"
  // )[0] as HTMLElement;
  // if (el) {
  //   el.style.opacity = visible ? "1" : "0";
  // }
}

export function isGroupingPossible(
  objectById: {
    [id: string]: IObject<{}>;
  },
  selectedObjectIds: string[]
) {
  return selectedObjectIds.length > 1;
}

export function isUngroupingPossible(
  objectById: {
    [id: string]: IObject<{}>;
  },
  selectedObjectIds: string[]
) {
  return (
    selectedObjectIds.length === 1 &&
    objectById[selectedObjectIds[0]]?.type === "group"
  );
}
