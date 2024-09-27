import { IToolbarProps } from "../utils/tools/types";
import { IToolClass } from "../webslider-sdk/object/i-tool-class";

export interface IToolDefinition {
  type: string;
  meta: {
    name: string;
    description?: string;
    icon?: string;
    supportWidthResize?: boolean;
    supportHeightResize?: boolean;
  };
  toolClass?: new () => IToolClass;
  toolBar?: (props: IToolbarProps) => React.ReactElement | null;
  floatingBar?: (props: IToolbarProps) => React.ReactElement | null;
}

const toolsBank: IToolDefinition[] = [];

export function registerObjectTool(toolDefinition: IToolDefinition): void {
  toolsBank.push(toolDefinition);
}

export function getObjectToolDefinitions(type: string): IToolDefinition | null {
  return toolsBank.find((toolItem) => toolItem.type === type) ?? null;
}
