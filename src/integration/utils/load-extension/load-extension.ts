/**
 * used for dev mode only, returns code from local storage
 */
export function addExtensionCode(type: string): Promise<void> {
  const extensionsStorage = JSON.parse(
    localStorage.getItem("extensionStorage") || "{}"
  );

  const code = extensionsStorage[type]?.objectApp;

  var script = document.createElement("script");
  script.innerHTML = code || "";
  document.getElementsByTagName("head")[0].appendChild(script);

  return Promise.resolve();
}
