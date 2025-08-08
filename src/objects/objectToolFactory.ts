import { IToolbarProps } from "../utils/tools/types";
import { IToolClass } from "../webslider-sdk/object/i-tool-class";
import semver from "semver";
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
  if (version === "latest") {
    const latestAppObjectsMap = getLatestVersionsMap(toolsBank);
    return latestAppObjectsMap.get(type);
  }

  return (
    toolsBank.find(
      (toolItem) => toolItem.type === type && toolItem.version === version
    ) ?? null
  );
}

function getLatestVersionsMap(data: { type: string; version?: string }[]) {
  // Create a map to store the latest version of each type
  const latestVersionMap = new Map();

  for (const item of data) {
    if (!latestVersionMap.has(item.type)) {
      latestVersionMap.set(item.type, item);
    } else {
      const existing = latestVersionMap.get(item.type);
      if (semver.gt(item.version ?? "", existing.version)) {
        latestVersionMap.set(item.type, item);
      }
    }
  }
  return latestVersionMap;
}
