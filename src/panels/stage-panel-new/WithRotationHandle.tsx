import React, { useCallback, useContext, useEffect, useRef } from "react";
import { getMousePosition } from "../../utils/doom-utils/common";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { StageManagerContext } from "./StageManagerProvider";
import { getGroupMatrixFromSelectionPath } from "./stage-panel-utils";
import { StageToolEnum } from "../../utils/selection-manager/types";

interface WithRotationHandleProps {
  object: IObject;
  stageZoom: number;
  children: JSX.Element;
  rotation: number;
  scale: number;
  selectionPath: string[];
  objectById: {
    [id: string]: IObject<{}>;
  };
  forceHide: boolean;
}

export function WithRotationHandle(
  props: WithRotationHandleProps
): JSX.Element {
  const {
    stageZoom,
    rotation: initialRotation,
    scale: initialScale,
    selectionPath,
    objectById,
    object,
    forceHide,
  } = props;

  const { stageManager } = useContext(StageManagerContext);

  const initialRotationRef = useRef(initialRotation);
  initialRotationRef.current = initialRotation;

  const initialScaleRef = useRef(initialScale);
  initialScaleRef.current = initialScale;

  const childRef = useRef<HTMLDivElement>();

  const rotationHandle = useRef<HTMLElement | null>(null);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();

      const groupsMatrix = getGroupMatrixFromSelectionPath(
        selectionPath,
        objectById
      );

      stageManager.start(StageToolEnum.ROTATE, {
        boundingClientRects: [childRef.current!.getBoundingClientRect()],
        mousePosition: getMousePosition(e),
        contextMatrix: groupsMatrix,
        objectId: object.id,
        objectRotation: initialRotation,
        objectScale: initialScale,
        originalMouseEvent: e,
        handle: "", // TODO ???
      });
    },
    [
      initialRotation,
      initialScale,
      object.id,
      objectById,
      selectionPath,
      stageManager,
    ]
  );

  useEffect(() => {
    childRef.current = document.getElementsByClassName(
      `object-holder-${props.object.id}`
    )[0] as HTMLDivElement;

    initialRotationRef.current = initialRotation;

    if (childRef.current) {
      const objectRootEl = childRef.current as HTMLElement;

      rotationHandle.current = objectRootEl.querySelector(".rotation-handle");

      if (rotationHandle.current) {
        rotationHandle.current?.removeEventListener(
          "mousedown",
          handleMouseDown
        );
        rotationHandle.current?.addEventListener("mousedown", handleMouseDown);
      }

      return () => {
        rotationHandle.current?.removeEventListener(
          "mousedown",
          handleMouseDown
        );
      };
    }
  }, [handleMouseDown, initialRotation, props.object.id, forceHide]);

  useEffect(() => {
    const objectRootEl = childRef.current as HTMLElement;
    rotationHandle.current = objectRootEl.querySelector(".rotation-handle");

    if (rotationHandle.current) {
      const handleBoxShadow = "0 0 0 " + 1 + "px white";

      rotationHandle.current.style.boxShadow = handleBoxShadow;
    }
  }, [stageZoom, object.scale]);

  const renderChildren = () => {
    return React.Children.map(props.children, (child) => {
      return React.cloneElement(child, {});
    });
  };

  return <>{renderChildren()}</>;
}

let absEl: Record<string, HTMLDivElement> = {};

export function getAbsEl(
  id: string,
  { x, y }: { x: any; y: any } = { x: 0, y: 0 },
  append = true
): HTMLDivElement {
  if (absEl[id]) {
    absEl[id].style.left = parseInt(x) + "px";
    absEl[id].style.top = parseInt(y) + "px";
    return absEl[id];
  }

  absEl[id] = document.createElement("div");
  absEl[id].style.position = "absolute";
  absEl[id].style.width = "6px";
  absEl[id].style.height = "6px";
  absEl[id].style.zIndex = "2000";
  absEl[id].style.backgroundColor = "red";
  absEl[id].style.left = parseInt(x) + "px";
  absEl[id].style.top = parseInt(y) + "px";
  absEl[id].style.pointerEvents = "none";

  if (append) document.body.appendChild(absEl[id]);

  return absEl[id];
}
