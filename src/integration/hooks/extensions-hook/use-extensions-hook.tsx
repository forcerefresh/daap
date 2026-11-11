// *** this file contains implementation for development

import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import JSZip from "jszip";
import axios from "axios";
import { IExtensionsHook } from "../../../integration/core/i-hooks";

export const useExtensionsHook = (): IExtensionsHook => {
  /* returns available extensions from directory */
  const getExtensions = (
    _from: number,
    _search?: string,
    _tags?: string[],
    _missingExtensions?: string[],
    _apiKey?: string,
  ): Promise<{ data: IExtensionItem[] }> => {
    return axios.get(`/api/v1/available-extensions`).then((response) => {
      return { data: response.data };
    });
  };

  /* returns installed extensions */
  const getInstalledExtensions = (): Promise<{ data: IExtensionItem[] }> => {
    const extensions: IExtensionItem[] = JSON.parse(
      localStorage.getItem("extensions") || "[]",
    );

    return new Promise((resolve) => {
      resolve({ data: extensions });
    });
  };

  /*install extension from directory*/
  const installExtension = async (
    extension: IExtensionItem,
  ): Promise<IExtensionItem> => {
    // 1. add script
    const extensionsStorage = JSON.parse(
      localStorage.getItem("extensionStorage") || "{}",
    );

    const zipPackage = await fetch(extension.packageUrl);
    const zip = new JSZip();
    await zip.loadAsync(await zipPackage.blob());

    // NOTE: not needed as we load object app
    const playerObjectSource = await zip
      .file(
        extension.packageFiles.appObjectFilename ||
          extension.packageFiles.appAnimationFilename!,
      )
      ?.async("string");
    const appObjectSource = await zip
      .file(
        extension.packageFiles.appObjectFilename ||
          extension.packageFiles.appAnimationFilename!,
      )
      ?.async("string");

    extensionsStorage[extension.type] = {
      appObjectSource,
      playerObjectSource,
    };

    localStorage.setItem("extensionStorage", JSON.stringify(extensionsStorage));

    // 2. add to DB
    const extensions = JSON.parse(localStorage.getItem("extensions") || "[]");
    extensions.push(extension);
    localStorage.setItem("extensions", JSON.stringify(extensions));

    return Promise.resolve(extension);
  };

  /*uninstall extension*/
  const uninstallExtension = (id: number): Promise<IExtensionItem> => {
    // remove from db
    const extensions = JSON.parse(localStorage.getItem("extensions") || "[]");

    const foundItem: IExtensionItem = extensions.find((item: any) => {
      return item.id === id;
    });

    const newExtensions = extensions.filter((item: any) => {
      return item.id !== id;
    });

    localStorage.setItem("extensions", JSON.stringify(newExtensions));

    // remove script
    const extensionsStorage = JSON.parse(
      localStorage.getItem("extensionStorage") || "{}",
    );
    delete extensionsStorage[foundItem.type];
    localStorage.setItem("extensionStorage", JSON.stringify(extensionsStorage));

    return Promise.resolve(foundItem);
  };

  return {
    getExtensions,
    getInstalledExtensions,
    installExtension,
    uninstallExtension: uninstallExtension as unknown as (props: { type: string | number }) => Promise<IExtensionItem>,
  };
};
