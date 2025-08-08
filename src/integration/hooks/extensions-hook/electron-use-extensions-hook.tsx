import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import { logger } from "webslider-sdk/lib/utils/logger/logger";

export const useExtensionsHook = () => {
  /* returns available extensions from directory */
  const getExtensions = (
    from: number,
    search?: string,
    tags?: string[],
    missingExtensions?: string[],
    apiKey?: string
  ): Promise<{ data: IExtensionItem[] }> => {
    logger.app.trace("Get extensions from directory (electron)");

    const apiUrl = `${
      import.meta.env.VITE_APP_EXTENSIONS_BASE_URL
    }/api/v1?api-key=${apiKey}`;
    let url = `${apiUrl}&from=${from}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (tags && tags.length > 0) {
      url += `&tags=${tags.map((tag) => encodeURIComponent(tag)).join(",")}`;
    }
    if (missingExtensions && missingExtensions.length > 0) {
      url += `&missingExtensions=${missingExtensions
        .map((ext) => encodeURIComponent(ext))
        .join(",")}`;
    }

    logger.app.log(url);

    return fetch(url).then((res) => res.json());
  };

  /* returns installed extensions */
  const getInstalledExtensions = (): Promise<{ data: IExtensionItem[] }> => {
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
  const uninstallExtension = (props: {
    id: number;
    source?: "marketplace" | "local";
  }): Promise<IExtensionItem> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("Extensions::UninstallExtension", JSON.stringify(props))
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
