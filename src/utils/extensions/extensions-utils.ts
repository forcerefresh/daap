import { getAppAnimationDefinition } from "webslider-sdk/lib/animations/animations-register";
import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";
import { getLatestVersionsMap } from "../../objects/objectToolFactory";

export function getMissingExtensionsFromProject(
  extensions: IExtensionItem[]
): IExtensionItem[] {
  const retExtensions: IExtensionItem[] = [];

  extensions?.forEach((ext) => {
    switch (ext.extensionType) {
      case "animation": {
        const animDef = getAppAnimationDefinition(ext.type);
        if (!animDef) retExtensions.push(ext);
        break;
      }
      case "object": {
        const objDef = getAppObjectDefinition(ext.type, ext.version);
        if (!objDef) retExtensions.push(ext);
      }
    }
  });

  return retExtensions;
}

export function removeExtensionFromMissing(
  extensions: IExtensionItem[],
  type: string
) {
  return extensions.filter((ex) => ex.type !== type);
}

export function getOutdatedExtensions(
  extensions: IExtensionItem[],
  installedExtensions: IExtensionItem[]
): IExtensionItem[] {
  if (!extensions) return [];

  const installedExtensionsMap = installedExtensions
    ? getLatestVersionsMap(installedExtensions)
    : new Map();

  const ret = extensions.filter((extension) => {
    const installedExtension = installedExtensionsMap.get(extension.type);

    if (!installedExtension) return false;

    return extension.version !== installedExtension.version;
  });

  console.log(ret);

  return ret;
}
