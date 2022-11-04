import { IPlayerData } from "../../../export/i-export-html";
import { IStore } from "../../../store/store";
import { IExtensionItem } from "webslider-sdk2/lib/objects/i-extensions";
import { GetAssetsUrlFuncReturnType } from "webslider-sdk2/lib/objects/objects-register";

export const useTemplateHook = () => {
  const getTemplate = (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      const json = {
        id,
      };

      ipcRenderer
        .invoke("Templates::GetTemplate", JSON.stringify(json))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const getTemplates = (
    from: number,
    search: string,
    perPage = 10
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      const json = {
        from,
        search,
        perPage,
      };

      ipcRenderer
        .invoke("Templates::GetTemplates", JSON.stringify(json))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const saveTemplate = ({
    name,
    description,
    slides,
    project,
    preview,
    playerData,
    assetsUrls,
    extensions,
  }: {
    name: string;
    description?: string;
    slides?: number;
    created?: string;
    project: Omit<IStore["project"], "diff">;
    preview: {
      width: number;
      height: number;
      scale: number;
      html: string;
    };
    playerData: IPlayerData;
    assetsUrls: GetAssetsUrlFuncReturnType;
    extensions: IExtensionItem[];
  }): Promise<{
    id: string;
    name: string;
    description: string;
    slides: number;
    created: string;
  }> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      const json = {
        name,
        description,
        slides,
        project,
        preview,
        playerData,
        assetsUrls,
        extensions,
      };

      ipcRenderer
        .invoke("Templates::SaveTemplate", JSON.stringify(json))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const deleteTemplate = (id: string): Promise<{ id: string }> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      const json = {
        id,
      };

      ipcRenderer
        .invoke("Templates::DeleteTemplate", JSON.stringify(json))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const downloadTemplate = async (req: { id: string }): Promise<string> => {
    const { ipcRenderer } = window.require("electron");

    return ipcRenderer.invoke("Templates::Download", JSON.stringify(req));
  };

  return {
    getTemplate,
    getTemplates,
    saveTemplate,
    deleteTemplate,
    downloadTemplate,
  };
};
