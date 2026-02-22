/**
 * used for dev mode only, returns code from local storage
 */
export function addExtensionCode(type: string, version: string): Promise<void> {
  const playerUrl = `${
    import.meta.env.VITE_SAAS_API_URL
  }/public/public-extensions/${type}/${version}/${type}-player.js`;
  const appUrl = `${
    import.meta.env.VITE_SAAS_API_URL
  }/public/public-extensions/${type}/${version}/${type}-app.js`;

  return new Promise((resolve) => {
    let count = 0;
    var script = document.createElement("script");
    script.onload = () => {
      count++;
      if (count === 2) setTimeout(() => resolve(), 500);
    };
    script.src = playerUrl;
    document.getElementsByTagName("head")[0].appendChild(script);

    var script = document.createElement("script");
    script.onload = () => {
      count++;
      if (count === 2) setTimeout(() => resolve(), 500);
    };
    script.src = appUrl;
    document.getElementsByTagName("head")[0].appendChild(script);
  });
}
