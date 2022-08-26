import { IExtensionItem } from "../../../webslider-sdk/src/objects/i-extensions";
import { logger } from "../../../webslider-sdk/src/utils/logger/logger";

export const useExtensionsHook = () => {
  /* returns available extensions from directory */
  const getExtensions = (
    from: number,
    search?: string,
    tags?: string[],
    apiKey?: string
  ): Promise<{ items: IExtensionItem[] }> => {
    logger.trace("Get extensions from directory (electron)");

    const apiUrl = `${process.env.REACT_APP_EXTENSIONS_BASE_URL}/api/v1?api-key=${apiKey}`;
    let url = `${apiUrl}&from=${from}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (tags && tags.length > 0) {
      url += `&tags=${tags.map((tag) => encodeURIComponent(tag)).join(",")}`;
    }
    logger.log(url);

    return fetch(url).then((res) => res.json());
  };

  /* returns installed extensions */
  const getInstalledExtensions = (): Promise<{ items: IExtensionItem[] }> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("Extensions::GetInstalledExtensions")
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  /*install extension from directory*/
  const installExtension = async (
    extension: IExtensionItem
  ): Promise<IExtensionItem> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("Extensions::InstallExtension", JSON.stringify(extension))
        .then((extension: IExtensionItem) => {
          resolve(extension);
        });
    });
  };

  /*uninstall extension*/
  const uninstallExtension = (id: number): Promise<IExtensionItem> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("Extensions::UninstallExtension", JSON.stringify({ id }))
        .then((extension: IExtensionItem) => {
          resolve(extension);
        });
    });
  };

  return {
    getExtensions,
    getInstalledExtensions,
    installExtension,
    uninstallExtension,
  };
};
