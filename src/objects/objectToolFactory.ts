import { IToolClass } from "../webslider-sdk/object/i-tool-class";
import { IToolbarProps } from "./free-draw/FreeDrawToolbar";

export interface IToolDefinition {
  type: string;
  meta: {
    name: string;
    description?: string;
    icon?: string;
  };
  toolClass: new () => IToolClass;
  toolBar?: (props: IToolbarProps) => React.ReactElement;
}

const toolsBank: IToolDefinition[] = [];

export function registerObjectTool(toolDefinition: IToolDefinition): void {
  toolsBank.push(toolDefinition);
}

export function getObjectToolDefinitions(type: string): IToolDefinition | null {
  return toolsBank.find((toolItem) => toolItem.type === type) ?? null;
}
