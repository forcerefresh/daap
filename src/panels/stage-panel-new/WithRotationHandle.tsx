import { IObject } from "webslider-sdk/lib/objects/i-object";

interface WithRotationHandleProps {
  object: IObject;
  stageZoom: number;
  children: JSX.Element;
  rotation: number;
  scale: number;
  selectionPath: string[];
  objectById: { [id: string]: IObject<{}> };
  forceHide: boolean;
}

export function WithRotationHandle(
  props: WithRotationHandleProps
): JSX.Element {
  return <>{props.children}</>;
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
