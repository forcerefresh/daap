// *** this file contains implementation for development

import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import axios from "axios";
// import extensions from "./extensions.json";

export const useExtensionsHook = () => {
  /* returns available extensions from directory */
  const getExtensions = (
    from: number,
    search?: string,
    tags?: string[],
    missingExtensions?: string[],
    apiKey?: string,
  ): Promise<{ data: IExtensionItem[] }> => {
    // const apiUrl = `${
    //   import.meta.env.VITE_APP_EXTENSIONS_BASE_URL
    // }/api/v1?api-key=${apiKey}`;
    // let url = `${apiUrl}&from=${from}`;

    // if (search) {
    //   url += `&search=${encodeURIComponent(search)}`;
    // }
    // if (tags && tags.length > 0) {
    //   url += `&tags=${tags.map((tag) => encodeURIComponent(tag)).join(",")}`;
    // }
    // if (missingExtensions && missingExtensions.length > 0) {
    //   url += `&missingExtensions=${missingExtensions
    //     .map((ext) => encodeURIComponent(ext))
    //     .join(",")}`;
    // }

    // const url = "https://extensions.bucket.forcerefresh.io/extensions.json";

    // return fetch(url).then(async (res) => ({
    //   data: await Promise.resolve(extensions), // await res.json(),
    // }));

    return axios.get(`/api/v1/available-extensions`).then((response) => {
      return { data: response.data };
    });

    // return fetch(url).then(async (res) => ({
    //   data: await Promise.resolve(extensions), // await res.json(),
    // }));

    // return new Promise((resolve) => {
    //   resolve({ data: extensions });
    // });
  };

  /* returns installed extensions */
  const getInstalledExtensions = (): Promise<{ data: IExtensionItem[] }> => {
    return axios.get(`/api/v1/extensions`).then((response) => response.data);
  };

  /*install extension from directory*/
  const installExtension = async (
    extension: IExtensionItem,
  ): Promise<IExtensionItem> => {
    const response = await axios.post(`/api/v1/extensions`, extension);

    return extension;

    // // 1. add script
    // const extensionsStorage = JSON.parse(
    //   localStorage.getItem("extensionStorage") || "{}"
    // );

    // const zipPackage = await fetch(extension.packageUrl);
    // const zip = new JSZip();
    // await zip.loadAsync(await zipPackage.blob());

    // // NOTE: not needed as we load object app
    // const playerObjectSource = await zip
    //   .file(
    //     extension.packageFiles.appObjectFilename ||
    //       extension.packageFiles.appAnimationFilename!
    //   )
    //   ?.async("string");
    // const appObjectSource = await zip
    //   .file(
    //     extension.packageFiles.appObjectFilename ||
    //       extension.packageFiles.appAnimationFilename!
    //   )
    //   ?.async("string");

    // extensionsStorage[extension.type] = {
    //   appObjectSource,
    //   playerObjectSource,
    // };

    // localStorage.setItem("extensionStorage", JSON.stringify(extensionsStorage));

    // // 2. add to DB
    // const extensions = JSON.parse(localStorage.getItem("extensions") || "[]");
    // extensions.push(extension);
    // localStorage.setItem("extensions", JSON.stringify(extensions));

    return Promise.resolve(extension);
  };

  /*uninstall extension*/
  const uninstallExtension = async ({
    type,
  }: {
    type: number;
  }): Promise<IExtensionItem> => {
    // remove from db

    const response = await axios.delete(`/api/v1/extensions/${type}`);

    // debugger;
    return response.data.data;

    return Promise.resolve(foundItem);
  };

  return {
    getExtensions,
    getInstalledExtensions,
    installExtension,
    uninstallExtension,
  };
};
