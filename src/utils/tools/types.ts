import { IObject } from "webslider-sdk/lib/objects/i-object";

export type IToolConfig<T = unknown> = T;

export enum ToolbarMode {
  Selection = "Selection",
  Edit = "Edit",
}

export interface IToolbarProps {
  mode?: ToolbarMode;
  object: IObject | null;
  addObject: (object: IObject) => void;
  updateObject: (object: IObject) => void;
  updateObjectForPreview: (object: IObject) => void;
  deleteObject: (object: IObject) => void;
  // tool configuration (use for internal shared state between Quick Toolbar and Stage Tool )
  toolConfig: IToolConfig<unknown>;
  setToolConfig: (toolConfig: IToolConfig<unknown>) => void;
}
