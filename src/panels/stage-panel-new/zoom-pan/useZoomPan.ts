import { useEffect, useRef, useState } from "react";

type DivRefType = React.MutableRefObject<HTMLDivElement | null>;
type TransformType = { scale: number; translateX: number; translateY: number };

const MIN_SCALE = 0.1;
const MAX_SCALE = 10;

export function useZoomPan({ spaceDown }: { spaceDown: boolean }) {
  const [canvasTransform, setCanvasTransform] = useState<TransformType>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  const transformRef = useRef<TransformType>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  const [parentElement, setParentElement] = useState<DivRefType | null>(null);

  const parentElementRefRef = useRef<DivRefType | null>(null);
  const targetElementRefRef = useRef<DivRefType | null>(null);

  const setRefs = (
    parentElementRef: DivRefType,
    targetElementRef: DivRefType
  ) => {
    parentElementRefRef.current = parentElementRef;
    targetElementRefRef.current = targetElementRef;

    setParentElement(parentElementRef);
  };

  const setCanvasTransformInternal = (
    transform: TransformType,
    skipStateUpdate = false
  ) => {
    const targetEl = targetElementRefRef.current?.current;
    const targetElParent = (targetEl?.parentNode as HTMLDivElement) ?? targetEl;

    if (targetElParent) {
      targetElParent.style.setProperty("--scale", `${transform.scale}`);
      targetElParent.style.setProperty(
        "--translateX",
        `${transform.translateX}px`
      );
      targetElParent.style.setProperty(
        "--translateY",
        `${transform.translateY}px`
      );
    }

    // if (!skipStateUpdate)
    setCanvasTransform(transform);
  };

  const setTransform = (transform: Partial<TransformType>) => {
    transformRef.current = { ...transformRef.current, ...transform };
    setCanvasTransformInternal(transformRef.current);
  };

  useEffect(() => {
    if (
      parentElementRefRef.current?.current &&
      targetElementRefRef.current?.current
    ) {
      const handler = (e: WheelEvent) => {
        console.log("asasasas");
        const parentEl = parentElementRefRef.current?.current;
        const targetEl = targetElementRefRef.current?.current;

        if (!targetEl || !parentEl) return;

        console.log("AA");
        e.preventDefault();
        // e.stopPropagation();

        if (!e.ctrlKey) {
          const newTransform = calculateNewTransform({
            x: e.deltaX,
            y: e.deltaY,
            scaleDiff: 1,
            panX: -e.deltaX,
            panY: -e.deltaY,
            currentScale: transformRef.current.scale,
            currentTranslateX: transformRef.current.translateX,
            currentTranslateY: transformRef.current.translateY,
          });

          setCanvasTransformInternal(newTransform, true);
          transformRef.current = newTransform;
          panPointRef.current = e;

          return;
        }

        const currentRect = targetEl.getBoundingClientRect();

        let { deltaY } = e;
        const { ctrlKey, deltaMode } = e;

        if (deltaMode === 1) {
          deltaY *= 15;
        }

        const divisor = ctrlKey ? 100 : 250;
        const scaleDiff = 1 - deltaY / divisor;

        const newTransform = calculateNewTransform({
          x: e.clientX - currentRect.left,
          y: e.clientY - currentRect.top,
          scaleDiff,
          currentScale: transformRef.current.scale,
          currentTranslateX: transformRef.current.translateX,
          currentTranslateY: transformRef.current.translateY,
        });

        if (newTransform.scale > MIN_SCALE && newTransform.scale < MAX_SCALE) {
          setCanvasTransformInternal(newTransform);
          transformRef.current = newTransform;
        }
      };

      parentElementRefRef.current?.current.addEventListener("wheel", handler);

      const canvas = document.getElementById("yourCanvas"); // or your container element

      let isTwoFingerGesture = false;

      function touchstartHandler(e) {
        console.log("AAAAAAAAAAA");
        if (e.touches.length === 2) {
          isTwoFingerGesture = true;
          e.preventDefault(); // Prevent default two-finger behavior
        }
      }

      function touchMoveHandler(e) {
        console.log(isTwoFingerGesture);
        if (isTwoFingerGesture) {
          e.preventDefault(); // Prevent default scroll/back/forward behavior

          // Your custom two-finger panning logic here
          // (e.g., calculate movement based on touch points)
        }
      }

      function touchEndHandler(e) {
        if (e.touches.length < 2) {
          isTwoFingerGesture = false;
        }
      }
      window.document.addEventListener("touchstart", touchstartHandler, {
        passive: false,
      });
      window.document.addEventListener("touchmove", touchMoveHandler, {
        passive: false,
      });
      window.document.addEventListener("touchend", touchEndHandler, {
        passive: false,
      });

      return () => {
        parentElementRefRef.current?.current?.removeEventListener(
          "wheel",
          handler
        );

        window.document.removeEventListener("touchstart", touchstartHandler);
        window.document.removeEventListener("touchmove", touchMoveHandler);
        window.document.removeEventListener("touchend", touchEndHandler);
      };
    }

    // return () => console.log("REMOVE EVENT HANDLER");
  }, [parentElement]);

  const panPointRef = useRef<{ clientX: number; clientY: number } | null>(null);

  useEffect(() => {
    if (
      spaceDown &&
      parentElementRefRef.current?.current &&
      targetElementRefRef.current?.current
    ) {
      const mouseDownHandler = (event: MouseEvent) => {
        const parentEl = parentElementRefRef.current?.current;

        if (parentEl) {
          panPointRef.current = event;
          parentEl.addEventListener("mousemove", mouseMoveHandler);
          document.addEventListener("mouseup", mouseUpHandler);
        }
      };

      const mouseMoveHandler = (event: MouseEvent) => {
        const parentEl = parentElementRefRef.current?.current;
        const targetEl = targetElementRefRef.current?.current;

        const prevPoint = panPointRef.current;
        const currPoint = event;

        if (!targetEl || !parentEl || !prevPoint || !currPoint) return;

        event.preventDefault();

        const targetElRect = targetEl.getBoundingClientRect();

        const x = prevPoint.clientX - targetElRect.left;
        const y = prevPoint.clientY - targetElRect.top;

        const newTransform = calculateNewTransform({
          x,
          y,
          scaleDiff: 1,
          panX: currPoint.clientX - prevPoint.clientX,
          panY: currPoint.clientY - prevPoint.clientY,
          currentScale: transformRef.current.scale,
          currentTranslateX: transformRef.current.translateX,
          currentTranslateY: transformRef.current.translateY,
        });

        setCanvasTransformInternal(newTransform, true);
        transformRef.current = newTransform;
        panPointRef.current = event;
      };

      const mouseUpHandler = (event: MouseEvent) => {
        const parentEl = parentElementRefRef.current?.current;
        parentEl?.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
        panPointRef.current = null;
      };

      parentElementRefRef.current?.current.addEventListener(
        "mousedown",
        mouseDownHandler
      );

      return () => {
        parentElementRefRef.current?.current?.removeEventListener(
          "mousedown",
          mouseDownHandler
        );
        parentElementRefRef.current?.current?.removeEventListener(
          "mousemove",
          mouseMoveHandler
        );
        document.removeEventListener("mouseup", mouseUpHandler);
      };
    }
  }, [spaceDown, parentElement]);

  const handleScaleChange = (scale: number) => {
    if (scale === transformRef.current.scale) return;

    const parentEl = parentElementRefRef.current?.current;
    const targetEl = targetElementRefRef.current?.current;

    if (!parentEl || !targetEl) return;

    const scaleDiff = scale / transformRef.current.scale;

    const parentElRect = parentEl.getBoundingClientRect();
    const currentRect = targetEl.getBoundingClientRect();

    const centerX = parentElRect.left + parentElRect.width / 2;
    const centerY = parentElRect.top + parentElRect.height / 2;

    const newTransform = calculateNewTransform({
      x: centerX - currentRect.left,
      y: centerY - currentRect.top,
      scaleDiff,
      currentScale: transformRef.current.scale,
      currentTranslateX: transformRef.current.translateX,
      currentTranslateY: transformRef.current.translateY,
      round: true,
    });

    setCanvasTransformInternal(newTransform);
    transformRef.current = newTransform;
  };
  return {
    setRefs,
    transformRef,
    canvasTransform,
    setTransform,
    handleScaleChange,
  };
}

function calculateNewTransform(
  props: {
    x?: number;
    y?: number;
    panX?: number;
    panY?: number;
    scaleDiff?: number;
    currentTranslateX?: number;
    currentTranslateY?: number;
    currentScale?: number;
    round?: boolean;
  } = {}
) {
  const {
    x = 0,
    y = 0,
    panX = 0,
    panY = 0,
    scaleDiff = 1,
    currentScale = 1,
    currentTranslateX = 0,
    currentTranslateY = 0,
    round = false,
  } = props;

  const matrix = new DOMMatrix()
    .translate(panX, panY)
    .translate(x, y)
    .translate(currentTranslateX, currentTranslateY)
    .scale(scaleDiff)
    .translate(-x, -y)
    .scale(currentScale);

  return {
    translateX: matrix.e,
    translateY: matrix.f,
    scale: round ? Math.round(matrix.a * 100) / 100 : matrix.a,
  };
}
