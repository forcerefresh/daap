import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { getMousePosition } from "../../utils/doom-utils/common";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { StageManagerContext } from "./StageManagerProvider";
import { getGroupMatrixFromSelectionPath } from "./stage-panel-utils";
import { StageToolEnum } from "../../utils/selection-manager/types";
import { isObjectInGroup } from "../../store/actions/actions-utils";
import { ToolsContext } from "../../utils/tools/ToolsProvider";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";
import { getObjectToolDefinitions } from "../../objects/objectToolFactory";

export const HANDLE_SIZE = 16;

const groupSelectionColor = "#48aff0"; /// "#48f08d";
const objectSelectionColor = "#48aff0";

interface WithResizeHandleProps {
  object: IObject;
  stageZoom: number;
  children: JSX.Element;
  rotation: number;
  scale: number;
  selectionPath: string[];
  objectById: {
    [id: string]: IObject<{}>;
  };
  isSelected: boolean;
  forceHide: boolean;
}

export function WithResizeHandle(props: WithResizeHandleProps): JSX.Element {
  const {
    stageZoom,
    rotation: initialRotation,
    scale: initialScale,
    selectionPath,
    objectById,
    object,
    isSelected,
    forceHide,
  } = props;

  const { stageManager } = useContext(StageManagerContext);

  const { activeTool } = useContext(ToolsContext);

  const showWidthResize =
    getAppObjectDefinition(object.type)?.meta?.supportWidthResize ?? false;
  const showHeightResize =
    getAppObjectDefinition(object.type)?.meta?.supportHeightResize ?? false;

  // const initialRotationRef = useRef(initialRotation);
  // initialRotationRef.current = initialRotation;

  // const initialScaleRef = useRef(initialScale);
  // initialScaleRef.current = initialScale;

  const childRef = useRef<HTMLDivElement>();
  const resizeHolderRef = useRef<HTMLDivElement>();

  const handlesRef = useRef<{
    tl?: HTMLElement;
    tr?: HTMLElement;
    bl?: HTMLElement;
    br?: HTMLElement;
    width?: HTMLElement;
    height?: HTMLElement;
  }>({});

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();

      const handle = (e.currentTarget as HTMLElement)?.getAttribute(
        "data-scale-handle"
      );

      console.log(selectionPath);

      const groupsMatrix = getGroupMatrixFromSelectionPath(
        selectionPath,
        objectById
      );

      stageManager.start(StageToolEnum.SCALE, {
        boundingClientRects: [childRef.current!.getBoundingClientRect()],
        mousePosition: getMousePosition(e),
        contextMatrix: groupsMatrix,
        objectId: object.id,
        objectRotation: initialRotation,
        objectScale: initialScale,
        originalMouseEvent: e,
        handle: handle ?? "",
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

  useLayoutEffect(() => {
    console.log(isSelected);

    if (!isSelected || forceHide) return;
    if (object.isLocked) return;
    // if (isObjectInGroup(object, objectById)) {
    //   return;
    // }

    childRef.current = document.getElementsByClassName(
      `object-holder-${props.object.id}`
    )[0] as HTMLDivElement;

    resizeHolderRef.current = document.getElementsByClassName(
      `resize-handle-holder-${props.object.id}`
    )[0] as HTMLDivElement;

    const scaledHandleSize = HANDLE_SIZE / Math.abs(initialScale) / stageZoom;

    const borderRadius = "10%"; //  2 / Math.abs(initialScale) / stageZoom;

    //initialRotationRef.current = initialRotation;
    if (resizeHolderRef.current) {
      let el: HTMLDivElement;

      const handleBoxShadow =
        "0 0 0 " + 1 / Math.abs(object.scale ?? 1) / stageZoom + "px white";

      el = document.createElement("div");
      el.style.left = "-" + scaledHandleSize + "px";
      el.style.top = "-" + scaledHandleSize + "px";
      el.style.width = scaledHandleSize + "px";
      el.style.height = scaledHandleSize + "px";
      el.style.transformOrigin = "bottom right";
      // el.style.transform = `scale(${1 / object.scale! / stageZoom})`;

      // el.style.transform = "scale(" + stageZoom + ")";

      el.style.background = `${
        object.objectIds ? groupSelectionColor : objectSelectionColor
      }`;
      el.style.boxShadow = handleBoxShadow;
      el.style.borderRadius = borderRadius;

      // el.style.border = `0.1px solid ${
      //   object.objectIds ? groupSelectionColor : objectSelectionColor
      // }`;
      el.style.position = "absolute";
      el.style.pointerEvents = "all";
      el.setAttribute("data-scale-handle", "tl");
      el.setAttribute("class", "resize-handle resize-handle-" + object.id);
      resizeHolderRef.current.appendChild(el);
      // el.removeEventListener("mousedown", handleMouseDown);
      el.addEventListener("mousedown", handleMouseDown);
      handlesRef.current.tl = el;
      // ----

      el = document.createElement("div");
      el.style.right = "-" + scaledHandleSize + "px";
      el.style.top = "-" + scaledHandleSize + "px";
      el.style.width = scaledHandleSize + "px";
      el.style.height = scaledHandleSize + "px";
      el.style.transformOrigin = "bottom left";

      el.style.background = `${
        object.objectIds ? groupSelectionColor : objectSelectionColor
      }`;
      el.style.boxShadow = handleBoxShadow;
      el.style.borderRadius = borderRadius;

      // el.style.border = `0.1px solid ${
      //   object.objectIds ? groupSelectionColor : objectSelectionColor
      // }`;
      el.style.position = "absolute";
      el.style.pointerEvents = "all";
      el.setAttribute("data-scale-handle", "tr");
      el.setAttribute("class", "resize-handle resize-handle-" + object.id);

      resizeHolderRef.current.appendChild(el);
      // el.removeEventListener("mousedown", handleMouseDown);
      el.addEventListener("mousedown", handleMouseDown);
      handlesRef.current.tr = el;
      // ----

      el = document.createElement("div");
      el.style.bottom = "-" + scaledHandleSize + "px";
      el.style.left = "-" + scaledHandleSize + "px";
      el.style.width = scaledHandleSize + "px";
      el.style.height = scaledHandleSize + "px";
      el.style.transformOrigin = "top right";

      el.style.background = `${
        object.objectIds ? groupSelectionColor : objectSelectionColor
      }`;
      el.style.boxShadow = handleBoxShadow;
      el.style.borderRadius = borderRadius;

      // el.style.border = `0.1px solid ${
      //   object.objectIds ? groupSelectionColor : objectSelectionColor
      // }`;
      el.style.position = "absolute";
      el.style.pointerEvents = "all";
      el.setAttribute("data-scale-handle", "bl");
      el.setAttribute("class", "resize-handle resize-handle-" + object.id);
      resizeHolderRef.current.appendChild(el);
      // el.removeEventListener("mousedown", handleMouseDown);
      el.addEventListener("mousedown", handleMouseDown);
      handlesRef.current.bl = el;

      // ----

      el = document.createElement("div");
      el.style.bottom = "-" + scaledHandleSize + "px";
      el.style.right = "-" + scaledHandleSize + "px";
      el.style.width = scaledHandleSize + "px";
      el.style.height = scaledHandleSize + "px";
      el.style.transformOrigin = "top left";

      el.style.background = `${
        object.objectIds ? groupSelectionColor : objectSelectionColor
      }`;
      // el.style.border =
      //   1 / Math.abs(object.scale) / stageZoom + "px solid white";
      el.style.boxShadow = handleBoxShadow;
      el.style.borderRadius = borderRadius;

      // el.style.border = `0.1px solid ${
      //   object.objectIds ? groupSelectionColor : objectSelectionColor
      // }`;
      el.style.position = "absolute";
      el.style.pointerEvents = "all";
      el.setAttribute("data-scale-handle", "br");
      el.setAttribute("class", "resize-handle resize-handle-" + object.id);
      resizeHolderRef.current.appendChild(el);
      // el.removeEventListener("mousedown", handleMouseDown);
      el.addEventListener("mousedown", handleMouseDown);
      handlesRef.current.br = el;

      // ----

      if (showWidthResize) {
        el = document.createElement("div");
        el.style.top = `calc(50% - ${scaledHandleSize / 1.25}px)`;
        el.style.right = "-" + scaledHandleSize / 1.5 + "px";
        el.style.width = scaledHandleSize / 1.5 + "px";
        el.style.height = scaledHandleSize * 1.5 + "px";
        el.style.transformOrigin = "center left";

        el.style.background = `${
          object.objectIds ? groupSelectionColor : objectSelectionColor
        }`;
        // el.style.border =
        //   1 / Math.abs(object.scale) / stageZoom + "px solid white";
        el.style.boxShadow = handleBoxShadow;
        el.style.borderTopRightRadius = "15%";
        el.style.borderBottomRightRadius = "15%";

        // el.style.border = `0.1px solid ${
        //   object.objectIds ? groupSelectionColor : objectSelectionColor
        // }`;
        el.style.position = "absolute";
        el.style.pointerEvents = "all";
        el.setAttribute("data-scale-handle", "width");
        el.setAttribute("class", "resize-handle resize-handle-" + object.id);
        resizeHolderRef.current.appendChild(el);
        // el.removeEventListener("mousedown", handleMouseDown);
        el.addEventListener("mousedown", handleMouseDown);
        handlesRef.current.width = el;
      }

      if (showHeightResize) {
        el = document.createElement("div");
        el.style.bottom = "-" + scaledHandleSize / 1.5 + "px";
        el.style.left = `calc(50% - ${scaledHandleSize / 1.25}px)`;
        el.style.width = scaledHandleSize * 1.5 + "px";
        el.style.height = scaledHandleSize / 1.5 + "px";
        el.style.transformOrigin = "top center";

        el.style.background = `${
          object.objectIds ? groupSelectionColor : objectSelectionColor
        }`;
        // el.style.border =
        //   1 / Math.abs(object.scale) / stageZoom + "px solid white";
        el.style.boxShadow = handleBoxShadow;
        el.style.borderTopRightRadius = "15%";
        el.style.borderBottomRightRadius = "15%";

        // el.style.border = `0.1px solid ${
        //   object.objectIds ? groupSelectionColor : objectSelectionColor
        // }`;
        el.style.position = "absolute";
        el.style.pointerEvents = "all";
        el.setAttribute("data-scale-handle", "height");
        el.setAttribute("class", "resize-handle resize-handle-" + object.id);
        resizeHolderRef.current.appendChild(el);
        // el.removeEventListener("mousedown", handleMouseDown);
        el.addEventListener("mousedown", handleMouseDown);
        handlesRef.current.height = el;
      }
    }

    return () => {
      if (handlesRef.current?.tl && resizeHolderRef.current) {
        handlesRef.current.tl.removeEventListener("mousedown", handleMouseDown);
        resizeHolderRef.current.removeChild(handlesRef.current.tl);
      }
      if (handlesRef.current?.tr && resizeHolderRef.current) {
        handlesRef.current.tr.removeEventListener("mousedown", handleMouseDown);
        resizeHolderRef.current.removeChild(handlesRef.current.tr);
      }
      if (handlesRef.current?.bl && resizeHolderRef.current) {
        handlesRef.current.bl.removeEventListener("mousedown", handleMouseDown);
        resizeHolderRef.current.removeChild(handlesRef.current.bl);
      }
      if (handlesRef.current?.br && resizeHolderRef.current) {
        handlesRef.current.br.removeEventListener("mousedown", handleMouseDown);
        resizeHolderRef.current.removeChild(handlesRef.current.br);
      }
      if (handlesRef.current?.width && resizeHolderRef.current) {
        handlesRef.current.width.removeEventListener(
          "mousedown",
          handleMouseDown
        );
        resizeHolderRef.current.removeChild(handlesRef.current.width);
      }
      if (handlesRef.current?.height && resizeHolderRef.current) {
        handlesRef.current.height.removeEventListener(
          "mousedown",
          handleMouseDown
        );
        resizeHolderRef.current.removeChild(handlesRef.current.height);
      }
    };
    // if (childRef.current) {
    //   const objectRootEl = childRef.current as HTMLElement;

    //   rotationHandle.current = objectRootEl.querySelector(".rotation-handle");

    //   rotationHandle.current?.removeEventListener("mousedown", handleMouseDown);
    //   rotationHandle.current?.addEventListener("mousedown", handleMouseDown);

    //   return () => {
    //     rotationHandle.current?.removeEventListener(
    //       "mousedown",
    //       handleMouseDown
    //     );
    //   };

    //   // (window as any).addEventListener("blur", windowBlurHandler);
    //   // (window as any).addEventListener("mouseup", documentMouseUpHandler);
    //   // document.addEventListener("mouseout", documentMouseOutHandler);
    // }
  }, [
    initialRotation,
    props.object.id,
    isSelected,
    handleMouseDown,
    stageZoom,
    forceHide,
    showWidthResize,
  ]);

  const renderChildren = () => {
    return React.Children.map(props.children, (child) => {
      return React.cloneElement(child, {});
    });
  };

  return <>{renderChildren()}</>;
}
