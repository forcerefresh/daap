import React from "react";
import { cloneDeep } from "lodash-es";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { Rect } from "../../../webslider-sdk/object/i-tool-class";
import { ILayer } from "../../../store/reducers/i-layers";
import {
  StageToolScaleEventData,
} from "../../../utils/selection-manager/events/StageToolEvent";
import { populateObjectThreeIds } from "../../../store/actions/actions-utils";
import {
  decomposeMatrix2DW3,
  getElementBySelector,
  getGroupMatrixFromSelectionPath,
  getObjectTransform,
  screenPointToLocal,
} from "../stage-panel-utils";
import { getObjectRotation, getObjectScale } from "../../../objects/object-utils";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";

export function processScaleStartEvent(
  eData: StageToolScaleEventData,
  objectById: { [key: string]: IObject },
  storeProps: {
    activeObjectId: string | null;
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
    selectionPath: string[];
  },
  storeActions: {
    _updateObject: any;
    _activateObject: any;
    _selectObjects: (objectIds: string[]) => any;
    _addObjectsToSelection: any;
    _removeObjectsFromSelection: any;
    _deactivateObject: any;
  },
) {
  // do nothing
}

export function processScaleChangeEvent(
  eData: StageToolScaleEventData,
  objectById: { [key: string]: IObject },
  layerById: { [key: string]: ILayer },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
  },
) {
  const { selectedObjectIdsRef, zoom } = storeProps;
  const selectedObjectIds = selectedObjectIdsRef.current;

  selectedObjectIds.forEach((objectId) => {
    const object = objectById[objectId];

    const objectPath: string[] = [];
    populateObjectThreeIds(objectPath, objectId, objectById, layerById);
    const parentGroupsMatrix = getGroupMatrixFromSelectionPath(
      objectPath,
      objectById,
    );
    parentGroupsMatrix.e = parentGroupsMatrix.f = 0;
    const objectOwnMatrix = new DOMMatrix(getObjectTransform(object));
    const fullContextMatrix = parentGroupsMatrix.multiply(objectOwnMatrix);

    const mouseMoveX = eData.mouseMove.x / zoom;
    const mouseMoveY = eData.mouseMove.y / zoom;

    const realMove = screenPointToLocal(
      { x: eData.mouseMove.x / zoom, y: eData.mouseMove.y / zoom },
      fullContextMatrix,
      0,
      getObjectScale(object),
    );

    const objectHolder = document.getElementsByClassName(
      `object-holder-${objectId}`,
    )[0] as HTMLDivElement;

    if (objectHolder) {
      let newWidth: string | undefined = undefined;
      let newLeft: string | undefined = undefined;
      let newTop: string | undefined = undefined;

      let newHeight: string | undefined = undefined;

      const realMoveXY = realMove.x;

      const objectSize: Rect = {
        x: object.left!,
        y: object.top!,
        width: object.width!,
        height: object.height!,
      };

      let left = objectSize.x;
      let top = objectSize.y;
      let scale = getObjectScale(object) ?? 1;

      const dir = eData.handle === "br" || eData.handle === "tr" ? -1 : 1;

      scale =
        ((getObjectScale(object) ?? 1) * objectSize.width - dir * realMoveXY) /
        objectSize.width;

      let m = new DOMMatrix();

      let transform = "";

      if (eData.handle === "tr") {
        m.rotateSelf(getObjectRotation(object));
        m.translateSelf(
          0,
          objectSize.height * (getObjectScale(object) ?? 1) - objectSize.height,
        );

        m.scaleSelf(scale);
        m.translateSelf(
          0,
          -(objectSize.height * scale - objectSize.height) / scale,
        );

        const d = decomposeMatrix2DW3(m);

        left = left + d.translateX;
        top = top + d.translateY;
        transform =
          "rotate(" +
          getObjectRotation(object) +
          "deg) scale(" +
          d.scaleX +
          ")";
      }
      if (eData.handle === "bl") {
        m.rotateSelf(getObjectRotation(object));
        m.translateSelf(
          objectSize.width * (getObjectScale(object) ?? 1) - objectSize.width,
          0,
        );

        m.scaleSelf(scale);
        m.translateSelf(
          -(objectSize.width * scale - objectSize.width) / scale,
          0,
        );

        const d = decomposeMatrix2DW3(m);

        left = left + d.translateX;
        top = top + d.translateY;
        transform =
          "rotate(" +
          getObjectRotation(object) +
          "deg) scale(" +
          d.scaleX +
          ")";
      }
      if (eData.handle === "tl") {
        m.rotateSelf(getObjectRotation(object));
        m.translateSelf(
          objectSize.width * (getObjectScale(object) ?? 1) - objectSize.width,
          objectSize.height * (getObjectScale(object) ?? 1) - objectSize.height,
        );

        m.scaleSelf(scale);
        m.translateSelf(
          -(objectSize.width * scale - objectSize.width) / scale,
          -(objectSize.height * scale - objectSize.height) / scale,
        );

        const d = decomposeMatrix2DW3(m);

        left = left + d.translateX;
        top = top + d.translateY;
        transform =
          "rotate(" +
          getObjectRotation(object) +
          "deg) scale(" +
          d.scaleX +
          ")";
      } else if (eData.handle === "br") {
        transform =
          "rotate(" + getObjectRotation(object) + "deg) scale(" + scale + ")";
      }

      // WIDTH
      if (eData.handle === "left" || eData.handle === "width") {
        if (eData.handle === "left") {
          newLeft =
            objectSize.x + realMove.x / (getObjectScale(object) ?? 1) + "px";
          objectHolder.style.left = newLeft;
        }

        const widthDirection = eData.handle === "left" ? -1 : 1;

        newWidth =
          objectSize.width +
          widthDirection * (realMove.x / (getObjectScale(object) ?? 1)) +
          "px";
        objectHolder.style.width = newWidth;

        const contentEl = objectHolder.getElementsByClassName(
          "object-content",
        )[0] as HTMLElement;
        if (contentEl) contentEl.style.width = newWidth;

        const resizeHolderEl = objectHolder.getElementsByClassName(
          "resize-handle-holder-" + objectId,
        )[0] as HTMLElement;
        if (resizeHolderEl) resizeHolderEl.style.width = newWidth;
      } else if (eData.handle === "top" || eData.handle === "height") {
        if (eData.handle === "top") {
          newTop =
            objectSize.y + realMove.y / (getObjectScale(object) ?? 1) + "px";
          objectHolder.style.top = newTop;
        }

        const widthDirection = eData.handle === "top" ? -1 : 1;

        newHeight =
          objectSize.height +
          widthDirection * (realMove.y / (getObjectScale(object) ?? 1)) +
          "px";
        objectHolder.style.height = newHeight;

        const contentEl = objectHolder.getElementsByClassName(
          "object-content",
        )[0] as HTMLElement;
        if (contentEl) contentEl.style.height = newHeight;

        const resizeHolderEl = objectHolder.getElementsByClassName(
          "resize-handle-holder-" + objectId,
        )[0] as HTMLElement;
        if (resizeHolderEl) resizeHolderEl.style.height = newHeight;
      } else {
        objectHolder.style.left = left + "px";
        objectHolder.style.top = top + "px";
        objectHolder.style.transform = transform;

        // HANDLES
        const handlesEls = Array.from(
          document.getElementsByClassName(`resize-handle-${objectId}`),
        ) as HTMLDivElement[];

        handlesEls.forEach((handleEL) => {
          handleEL.style.scale = `${(getObjectScale(object) ?? 1) / scale}`;
        });

        const selEl = objectHolder.getElementsByClassName(
          "object-selection",
        )?.[0] as HTMLDivElement | undefined;
        if (selEl) {
          selEl.style.boxShadow = `0 0 0 ${1 / scale / zoom}px ${
            object.objectIds ? "#444444" : "#48aff0"
          }`;
        }
      }

      const html = getAppObjectDefinition(object.type, "latest")?.getHtml?.({
        calculatedObjectSize: {
          width: newWidth ?? object.width,
          height: newHeight ?? object.height,
        },
        object: {
          ...object,
          width: newWidth ? parseInt(newWidth) : object.width,
          height: newHeight ? parseInt(newHeight) : object.height,
        },
        deviceType: "device-independent",
      });

      const el = objectHolder.querySelector(`.object-content-${object.id}`);

      if (el?.parentElement && html) {
        el.parentElement.style.height = newHeight ?? object.height + "px";
        el.parentElement.style.width = newWidth ?? object.width + "px";

        el.parentElement.innerHTML = html;

        const objectSelectorEl = getElementBySelector(
          ".object-holder-" + object.id + " > .object-selection",
        ) as HTMLElement;

        if (objectSelectorEl) {
          objectSelectorEl.style.width = newWidth ?? object.width + "px";
          objectSelectorEl.style.height = newHeight ?? object.height + "px";
        }
      }
    }
  });
}

export function processScaleStopEvent(
  eData: StageToolScaleEventData,
  objectById: { [key: string]: IObject },
  layerById: { [key: string]: ILayer },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
  },
  storeActions: {
    _updateObject: any;
  },
) {
  const { selectedObjectIdsRef, zoom } = storeProps;
  const { _updateObject } = storeActions;

  const selectedObjectIds = selectedObjectIdsRef.current;

  const x = eData.x! / zoom;
  const y = eData.y! / zoom;

  selectedObjectIds.forEach((objectId) => {
    const object = objectById[objectId];
    const objectClone = cloneDeep(object);

    const objectPath: string[] = [];
    populateObjectThreeIds(objectPath, objectId, objectById, layerById);
    const parentGroupsMatrix = getGroupMatrixFromSelectionPath(
      objectPath,
      objectById,
    );
    parentGroupsMatrix.e = parentGroupsMatrix.f = 0;
    const objectOwnMatrix = new DOMMatrix(getObjectTransform(object));
    const fullContextMatrix = parentGroupsMatrix.multiply(objectOwnMatrix);

    const realMove = screenPointToLocal(
      { x: eData.mouseMove.x / zoom, y: eData.mouseMove.y / zoom },
      fullContextMatrix,
      0,
      getObjectScale(object),
    );

    const realMoveX = realMove.x;
    const realMoveY = realMove.y;

    const objectSize: Rect = {
      x: object.left!,
      y: object.top!,
      width: object.width!,
      height: object.height!,
    };

    const dir = eData.handle === "br" || eData.handle === "tr" ? -1 : 1;

    let scale =
      ((getObjectScale(object) ?? 1) * objectSize.width - dir * realMoveX) /
      objectSize.width;

    let left = objectSize.x;
    let top = objectSize.y;

    let transform = "";
    const m = new DOMMatrix();
    if (eData.handle === "tr") {
      m.rotateSelf(getObjectRotation(object));
      m.translateSelf(
        0,
        objectSize.height * (getObjectScale(object) ?? 1) - objectSize.height,
      );

      m.scaleSelf(scale);
      m.translateSelf(
        0,
        -(objectSize.height * scale - objectSize.height) / scale,
      );

      const d = decomposeMatrix2DW3(m);

      left = left + d.translateX;
      top = top + d.translateY;
      transform =
        "rotate(" + getObjectRotation(object) + "deg) scale(" + d.scaleX + ")";
    }
    if (eData.handle === "bl") {
      m.rotateSelf(getObjectRotation(object));
      m.translateSelf(
        objectSize.width * (getObjectScale(object) ?? 1) - objectSize.width,
        0,
      );

      m.scaleSelf(scale);
      m.translateSelf(
        -(objectSize.width * scale - objectSize.width) / scale,
        0,
      );

      const d = decomposeMatrix2DW3(m);

      left = left + d.translateX;
      top = top + d.translateY;
      transform =
        "rotate(" + getObjectRotation(object) + "deg) scale(" + d.scaleX + ")";
    }
    if (eData.handle === "tl") {
      m.rotateSelf(getObjectRotation(object));
      m.translateSelf(
        objectSize.width * (getObjectScale(object) ?? 1) - objectSize.width,
        objectSize.height * (getObjectScale(object) ?? 1) - objectSize.height,
      );

      m.scaleSelf(scale);
      m.translateSelf(
        -(objectSize.width * scale - objectSize.width) / scale,
        -(objectSize.height * scale - objectSize.height) / scale,
      );

      const d = decomposeMatrix2DW3(m);

      left = left + d.translateX;
      top = top + d.translateY;
      transform =
        "rotate(" + getObjectRotation(object) + "deg) scale(" + d.scaleX + ")";
    } else if (eData.handle === "br") {
      transform =
        "rotate(" + getObjectRotation(object) + "deg) scale(" + scale + ")";
    }

    if (eData.handle === "left" || eData.handle === "width") {
      if (eData.handle === "left") {
        objectClone.left =
          objectSize.x + realMoveX / (getObjectScale(object) ?? 1);
      }

      const widthDirection = eData.handle === "left" ? -1 : 1;

      objectClone.width =
        objectSize.width +
        widthDirection * (realMoveX / (getObjectScale(object) ?? 1));
    } else if (eData.handle === "top" || eData.handle === "height") {
      if (eData.handle === "top") {
        objectClone.top =
          objectSize.y + realMoveY / (getObjectScale(object) ?? 1);
      }

      const widthDirection = eData.handle === "top" ? -1 : 1;

      objectClone.height =
        objectSize.height +
        widthDirection * (realMoveY / (getObjectScale(object) ?? 1));
    } else {
      objectClone.left = left;
      objectClone.top = top;
      objectClone.scale = scale;
    }

    _updateObject(objectClone);
  });
}
