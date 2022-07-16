export function addExtensionCode(type: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const { ipcRenderer } = window.require("electron");

    ipcRenderer
      .invoke("Extensions::LoadExtension", JSON.stringify({ type }))
      .then(() => {
        resolve();
      });
  });
}
