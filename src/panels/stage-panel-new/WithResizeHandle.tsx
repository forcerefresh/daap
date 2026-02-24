import { IObject } from "webslider-sdk/lib/objects/i-object";

interface WithResizeHandleProps {
  object: IObject;
  stageZoom: number;
  children: JSX.Element;
  rotation: number;
  scale: number;
  selectionPath: string[];
  objectById: { [id: string]: IObject<{}> };
  isSelected: boolean;
  forceHide: boolean;
}

export function WithResizeHandle(props: WithResizeHandleProps): JSX.Element {
  return <>{props.children}</>;
}
