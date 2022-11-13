import { ObjectStorageItem } from "./i-object-storage-hook";

export const useObjectStorageHook = () => {
  const listStorageObjects = (req: {
    projectId?: string;
  }): Promise<ObjectStorageItem[]> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("ObjectStorage::List", JSON.stringify(req))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const listAssignedStorageObjects = (req: {
    projectId: string;
  }): Promise<ObjectStorageItem[]> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("ObjectStorage::ListAssigned", JSON.stringify(req))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const addStorageObject = (
    so: Omit<ObjectStorageItem, "id">
  ): Promise<ObjectStorageItem> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("ObjectStorage::Add", JSON.stringify(so))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const deleteStorageObject = (deleteReq: {
    id: string;
  }): Promise<{ deletedId: string }> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("ObjectStorage::Delete", JSON.stringify(deleteReq))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const uploadPlayerToStorageObject = (uploadReq: {
    id: string;
  }): Promise<{ status: "OK" | "ERROR"; error?: string }> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("ObjectStorage::UploadPlayer", JSON.stringify(uploadReq))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const assignBucketToProject = (req: {
    bucketId: string;
    projectId: number;
  }): Promise<{ status: string }> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("ObjectStorage::AssignBucketToProject", JSON.stringify(req))
        .then(resolve);
    });
  };

  const removeBucketFromProject = (req: {
    bucketId: string;
    projectId: number;
  }): Promise<{ status: string; error?: string }> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("ObjectStorage::RemoveBucketFromProject", JSON.stringify(req))
        .then(resolve);
    });
  };

  const getAssignedBucketIds = (req: {
    projectId: number;
  }): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("ObjectStorage::GetAssignedBuckets", JSON.stringify(req))
        .then(resolve);
    });
  };

  const publishToStorageObject = (req: {
    bucketId: string;
    projectId: number;
    revision: number;
  }): Promise<{ status: string }> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("ObjectStorage::Publish", JSON.stringify(req))
        .then(resolve);
    });
  };

  const subscribeToPublishDetails = (
    callback: (logs: any[]) => void
  ): (() => void) => {
    const { ipcRenderer } = window.require("electron");

    ipcRenderer.on(
      `ObjectStorageRenderer::SubscribeToPublishDetails`,
      function (evt: any, message: any) {
        callback(JSON.parse(message));
      }
    );

    return () => {
      ipcRenderer.removeAllListeners(
        `ObjectStorageRenderer::SubscribeToPublishDetails`
      );
    };
  };

  const getPublishDetails = async (req: {
    bucketId: string;
    projectId: number;
  }): Promise<{ indexUrl: string; jsonUrl: string; playerUrl: string }> => {
    const { shell, ipcRenderer } = window.require("electron");

    const res = await ipcRenderer.invoke(
      "ObjectStorage::GetPublishDetails",
      JSON.stringify(req)
    );

    return res;
  };

  const openPublishUrl = async (req: {
    bucketId: string;
    projectId: number;
    debug?: boolean;
  }): Promise<void> => {
    const { shell, ipcRenderer } = window.require("electron");

    const res = await ipcRenderer.invoke(
      "ObjectStorage::GetPublishDetails",
      JSON.stringify(req)
    );

    shell.openExternal(req.debug ? res.debugUrl : res.indexUrl);
  };

  const downloadPackage = async (req: {
    projectId: number;
  }): Promise<string> => {
    const { ipcRenderer } = window.require("electron");

    return ipcRenderer.invoke("ObjectStorage::Download", JSON.stringify(req));
  };

  return {
    supportStorageObjects: true,
    listStorageObjects,
    listAssignedStorageObjects,
    addStorageObject,
    deleteStorageObject,
    uploadPlayerToStorageObject,
    assignBucketToProject,
    removeBucketFromProject,
    getAssignedBucketIds,
    publishToStorageObject,
    subscribeToPublishDetails,
    openPublishUrl,
    getPublishDetails,
    downloadPackage,
  };
};
