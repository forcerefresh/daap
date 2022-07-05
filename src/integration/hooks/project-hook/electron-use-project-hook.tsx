export const useProjectHook = () => {
  const getNextProjectId = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer.invoke("apiGetNextProjectId").then((result: any) => {
        resolve(result);
      });
    });
  };

  const getProject = (id: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      const json = {
        id,
      };

      ipcRenderer
        .invoke("apiGetProject", JSON.stringify(json))
        .then((result: any) => {
          console.log(result);
          resolve(result);
        });
    });
  };

  const getProjects = (
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
        .invoke("apiGetProjects", JSON.stringify(json))
        .then((result: any) => {
          console.log(result);
          resolve(result);
        });
    });
  };

  const saveProject = ({
    id,
    name,
    description,
    slides,
    project,
    preview,
    playerData,
    assetsUrls,
  }: {
    id?: number;
    name: string;
    description?: string;
    slides?: number;
    created?: string;
    modified?: string;
    project: any;
    preview: any;
    playerData: any;
    assetsUrls: { url: string; type: "url" | string }[];
  }): Promise<{
    id: number;
    name: string;
    description: string;
    slides: number;
    created: string;
    modified: string;
    saveRevision: number;
  }> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      const json = {
        id,
        name,
        description,
        slides,
        project,
        preview,
        playerData,
        assetsUrls,
      };

      ipcRenderer
        .invoke("apiSaveProject", JSON.stringify(json))
        .then((result: any) => {
          console.log(result);
          resolve(result);
        });
    });
  };

  const deleteProject = (id: number): Promise<{ id: number }> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      const json = {
        id,
      };

      ipcRenderer
        .invoke("apiDeleteProject", JSON.stringify(json))
        .then((result: any) => {
          console.log(result);
          resolve(result);
        });
    });
  };

  return {
    getProject,
    getProjects,
    saveProject,
    deleteProject,
    getNextProjectId,
  };
};
