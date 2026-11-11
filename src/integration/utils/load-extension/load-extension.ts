/**
 * used for dev mode only, returns code from local storage
 */
export function addExtensionCode(type: string): Promise<void> {
  const extensionsStorage = JSON.parse(
    localStorage.getItem("extensionStorage") || "{}"
  );

  const { appObjectSource, playerObjectSource } = extensionsStorage[type] || {};

  const appScript = document.createElement("script");
  appScript.innerHTML = appObjectSource || "";
  document.getElementsByTagName("head")[0].appendChild(appScript);

  const playerScript = document.createElement("script");
  playerScript.innerHTML = playerObjectSource || "";
  document.getElementsByTagName("head")[0].appendChild(playerScript);

  return Promise.resolve();
}
