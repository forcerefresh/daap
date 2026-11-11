export function scaleApp(zoom: number) {
  const appEl = document.getElementsByClassName(
    "daap-forcerefresh-app",
  )?.[0] as HTMLDivElement;

  if (appEl) {
    const appElRect = appEl.getBoundingClientRect();
    appEl.style.transformOrigin = "top left";
    appEl.style.transform = `scale(${zoom})`;

    const appHeightCssProp = `calc((100vh - ${appElRect.top}px) / ${zoom ?? 1})`;
    const appWidthCssProp = `calc((100vw - ${appElRect.left}px) / ${zoom ?? 1})`;

    appEl.style.setProperty("--daap-forcerefresh-app-height", appHeightCssProp);
    appEl.style.setProperty("--daap-forcerefresh-app-width", appWidthCssProp);
  }
}
