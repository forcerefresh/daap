export const useRemoteTemplateHook = () => {
  const installRemoteTemplate = (template: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("Templates::InstallRemoteTemplate", JSON.stringify(template))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const getRemoteTemplate = (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      const json = {
        id,
      };

      ipcRenderer
        .invoke("Templates::GetRemoteTemplate", JSON.stringify(json))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  /* returns available extensions from directory */
  const getRemoteTemplates = (
    from: number,
    search?: string,
    tags?: string[],
    apiKey?: string
  ): Promise<{ items: any[] }> => {
    const apiUrl = `${process.env.REACT_APP_EXTENSIONS_BASE_URL}/api/v1?kind=template&api-key=${apiKey}`;
    let url = `${apiUrl}&from=${from}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (tags && tags.length > 0) {
      url += `&tags=${tags.map((tag) => encodeURIComponent(tag)).join(",")}`;
    }

    return fetch(url).then((res) => res.json());
  };

  const uninstallRemoteTemplate = (id: string): Promise<{ id: string }> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      const json = {
        id,
      };

      ipcRenderer
        .invoke("Templates::UninstallRemoteTemplate", JSON.stringify(json))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  /* returns installed extensions */
  const getInstalledRemoteTemplates = (): Promise<{ items: any[] }> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("Templates::GetInstalledRemoteTemplates")
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  return {
    getInstalledRemoteTemplates,
    installRemoteTemplate,
    uninstallRemoteTemplate,
    getRemoteTemplates,
    getRemoteTemplate,
  };
};
