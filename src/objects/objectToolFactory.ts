import { IToolClass } from "../webslider-sdk/object/i-tool-class";
import { IToolbarProps } from "./free-draw/FreeDrawToolbar";

interface IToolDefinition {
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

export function registerObjectTool(
  deff: IToolDefinition
  //   {type: string,
  //   meta: {
  //     name: string;
  //     description?: string;
  //     icon?: string;
  //   },
  //   toolClass: new () => IToolClass,
  //   toolBar: (props: IToolbarProps) => React.ReactElement
  // }
): void {
  toolsBank.push(deff);
}

export function getObjectToolDefinitions(
  type: string
): IToolDefinition | undefined {
  return toolsBank.find((toolItem) => toolItem.type === type);
}
