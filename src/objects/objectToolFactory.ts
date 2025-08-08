import { IToolbarProps } from "../utils/tools/types";
import { IToolClass } from "../webslider-sdk/object/i-tool-class";

export interface IToolDefinition {
  type: string;
  version?: string;
  meta: {
    name: string;
    description?: string;
    icon?: string;
    supportWidthResize?: boolean;
    supportHeightResize?: boolean;
    sizeType?: "line" | "rect"; // default "rect"
  };
  toolClass?: new () => IToolClass;
  toolBar?: (props: IToolbarProps) => React.ReactElement | null;
  floatingBar?: (props: IToolbarProps) => React.ReactElement | null;
}

const toolsBank: IToolDefinition[] = [];

export function registerObjectTool(toolDefinition: IToolDefinition): void {
  toolsBank.push(toolDefinition);
}

export function getObjectToolDefinitions(
  type: string,
  version?: string
): IToolDefinition | null {
  return (
    toolsBank.find(
      (toolItem) => toolItem.type === type && toolItem.version === version
    ) ?? null
  );
}
