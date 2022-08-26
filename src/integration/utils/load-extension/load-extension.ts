/**
 * used for dev mode only, returns code from local storage
 */
export function addExtensionCode(type: string): Promise<void> {
  const extensionsStorage = JSON.parse(
    localStorage.getItem("extensionStorage") || "{}"
  );

  const { appObjectSource, playerObjectSource } = extensionsStorage[type] || {};

  var script = document.createElement("script");
  script.innerHTML = appObjectSource || "";
  document.getElementsByTagName("head")[0].appendChild(script);

  var script = document.createElement("script");
  script.innerHTML = playerObjectSource || "";
  document.getElementsByTagName("head")[0].appendChild(script);

  return Promise.resolve();
}
