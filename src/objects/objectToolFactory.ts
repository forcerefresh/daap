import { IToolbarProps } from "../utils/tools/types";
import { IToolClass } from "webslider-sdk/lib/objects/i-objects-register";
import { TransformCapabilities } from "webslider-sdk/lib/objects/objects-register";
import semver from "semver";
export interface IToolDefinition {
  type: string;
  version?: string;
  meta: {
    name: string;
    description?: string;
    icon?: string;
    sizeType?: "line" | "rect"; // default "rect"
    transformCapabilities?: TransformCapabilities;
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
  version?: string,
): IToolDefinition | null {
  if (version === "latest") {
    const latestAppObjectsMap = getLatestVersionsMap(toolsBank);
    return latestAppObjectsMap.get(type) ?? null;
  }

  return (
    toolsBank.find(
      (toolItem) => toolItem.type === type && toolItem.version === version,
    ) ?? null
  );
}

export function getLatestVersionsMap<T>(
  data: (T & { type: string; version?: string })[],
) {
  const latestVersionMap = new Map<string, (typeof data)[0]>();

  for (const item of data) {
    if (!latestVersionMap.has(item.type)) {
      latestVersionMap.set(item.type, item);
    } else {
      const existing = latestVersionMap.get(item.type);
      if (semver.gt(item.version ?? "", existing?.version ?? "")) {
        latestVersionMap.set(item.type, item);
      }
    }
  }
  return latestVersionMap;
}
