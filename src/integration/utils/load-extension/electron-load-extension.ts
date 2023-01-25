export function addExtensionCode(type: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const { ipcRenderer } = window.require("electron");

    // const app = `webslider-fp://my-uploads/my-extensions/${type}/${type}-app.js`;
    // const player = `webslider-fp://my-uploads/my-extensions/${type}/${type}-player.js`;

    // await import(/* @ts-ignore */ /* webpackIgnore: true */ app);
    // await import(/* @ts-ignore */ /* webpackIgnore: true */ player);

    ipcRenderer
      .invoke("Extensions::LoadExtension", JSON.stringify({ type }))
      .then(() => {
        resolve();
      });
  });
}
