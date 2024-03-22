import React, { useCallback, useEffect, useRef } from "react";
import { getMousePosition } from "../../utils/doom-utils/common";
import { IObject } from "webslider-sdk/lib/objects/i-object";

interface WithRotationHandleProps {
  object: IObject;
  stageZoom: number;
  children: JSX.Element;
  rotation: number;
  onRotationDone: (rotation: number) => void;
}

export function WithRotationHandle(
  props: WithRotationHandleProps
): JSX.Element {
  const { stageZoom, rotation: initialRotation, onRotationDone } = props;

  console.info(initialRotation);
  const initialRotationRef = useRef(initialRotation);
  initialRotationRef.current = initialRotation;

  const rotationRef = useRef(0);
  const childRef = useRef<HTMLDivElement>();

  const rotationHandle = useRef<HTMLElement | null>(null);
  const startMousePosition = useRef({ x: 0, y: 0 });

  const startAngle = useRef(0);
  const objectCenter = useRef({ x: 0, y: 0 });

  function getDragAngle(event: MouseEvent) {
    //////console.log(objectCenter);
    //////console.log(event.clientY, "event.clientY");

    var angle = Math.atan2(
      objectCenter.current.y - event.clientY,
      objectCenter.current.x - event.clientX
    );
    getAbsEl("mouse", { x: event.clientX, y: event.clientY });

    ////console.log(angle);
    ////console.log(startAngle.current);
    ////console.log(angle - startAngle.current);
    return angle - startAngle.current;
  }

  const handleMouseMove = (e: MouseEvent) => {
    const rotation = getDragAngle(e);

    ////console.log("ROTATION:" + rotation);
    rotationRef.current = rotation;

    console.log(initialRotationRef.current);
    const totalRotation = initialRotationRef.current + rotation;
    childRef.current!.style.transform = "rotate(" + totalRotation + "rad" + ")";

    const w = parseInt(childRef.current?.style?.width);
    const h = parseInt(childRef.current?.style?.height);

    const x = parseInt(childRef.current?.style?.left);
    const y = parseInt(childRef.current?.style?.top);

    const rXCenter = x + w / 2;
    const rYCenter = y + h / 2;

    const boundsEl = document.getElementsByClassName(
      `object-bounds-${props.object.id}`
    )[0] as HTMLDivElement;

    //////////console.log(rect);

    const fullRotation = initialRotationRef.current + rotation;
    const H =
      w * Math.abs(Math.sin(fullRotation)) +
      h * Math.abs(Math.cos(fullRotation));
    const W =
      w * Math.abs(Math.cos(fullRotation)) +
      h * Math.abs(Math.sin(fullRotation));

    const X = rXCenter - W / 2;
    const Y = rYCenter - H / 2;

    ////////console.log({ X, Y });
    ////////console.log({ H, W });
    ////////console.log({ rXCenter, rYCenter });

    if (boundsEl) {
      boundsEl.style.position = "absolute";
      boundsEl.style.top = Y + "px";
      boundsEl.style.left = X + "px";
      boundsEl.style.width = W + "px"; //rect.width / stageZoom + "px";
      boundsEl.style.height = H + "px"; //rect.height / stageZoom + "px";
    }
  };

  const handleMouseUp = (e: Event) => {
    (window as any).removeEventListener("mousemove", handleMouseMove);
    (window as any).removeEventListener("mouseup", handleMouseUp);

    ////////console.log(rotationRef.current);

    //initialRotationRef.current +
    //initialRotationRef.current +
    onRotationDone(initialRotationRef.current + rotationRef.current);
    //rotationRef.current = 0;
  };

  const handleMouseDown = (e: Event) => {
    ////////console.log(e.target);
    startMousePosition.current = getMousePosition(
      e as unknown as React.MouseEvent
    );
    ////////console.log(startMousePosition.current);

    var rect = childRef.current!.getBoundingClientRect();
    ////console.log(rect);
    objectCenter.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    getAbsEl("center", objectCenter.current);

    //if (!startAngle.current)
    startAngle.current = 0;
    startAngle.current = getDragAngle(e as MouseEvent);

    ////console.log("START ANGLE:" + startAngle.current);

    ////////console.log(startAngle.current);

    (window as any).removeEventListener("mousemove", handleMouseMove);
    (window as any).addEventListener("mousemove", handleMouseMove);

    (window as any).removeEventListener("mouseup", handleMouseUp);
    (window as any).addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    childRef.current = document.getElementsByClassName(
      `object-holder-${props.object.id}`
    )[0] as HTMLDivElement;

    ////////console.log(childRef.current);

    initialRotationRef.current = initialRotation;

    if (childRef.current) {
      const objectRootEl = childRef.current as HTMLElement;
      childRef.current!.style.transform =
        "rotate(" + initialRotation + "rad" + ")";

      rotationHandle.current = objectRootEl.querySelector(".rotation-handle");

      ////////console.log(rotationHandle);

      rotationHandle.current?.removeEventListener("mousedown", handleMouseDown);
      rotationHandle.current?.addEventListener("mousedown", handleMouseDown);

      return () => {
        rotationHandle.current?.removeEventListener(
          "mousedown",
          handleMouseDown
        );
      };
      // (window as any).addEventListener("blur", windowBlurHandler);
      // (window as any).addEventListener("mouseup", documentMouseUpHandler);
      // document.addEventListener("mouseout", documentMouseOutHandler);
    }
    // const bounds = objectRootEl.getBoundingClientRect();
    // ////////console.log(bounds);
  }, []);

  const renderChildren = () => {
    return React.Children.map(props.children, (child) => {
      return React.cloneElement(child, {
        //ref: childRef,
      });
    });
  };

  return <>{renderChildren()}</>;
}

let absEl: Record<string, HTMLDivElement> = {};

function getAbsEl(
  id: string,
  { x, y }: { x: any; y: any } = { x: 0, y: 0 }
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

  document.body.appendChild(absEl[id]);

  return absEl[id];
}
