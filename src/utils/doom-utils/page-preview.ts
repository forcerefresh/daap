import * as htmlToImage from "html-to-image";

export function createPagePreviewImage({
  page: IPage,
}: {
  url: string;
  name: string;
  type: string;
}) {
  // add rootEl
  const rootEl = document.createElement("div");
  rootEl.style.position = "absolute";
  rootEl.style.zIndex = "-100";
  rootEl.style.overflow = "visible";
  rootEl.style.fontSize = "36px";
  rootEl.style.color = "white";

  //   NOTE: for debug
  rootEl.style.zIndex = "1000";
  rootEl.style.left = "0px";
  rootEl.style.top = "0px";
  rootEl.style.width = "500px";
  rootEl.style.height = "60px";
  rootEl.style.fontFamily = `"${name}"`;

  document.body.appendChild(rootEl);

  const html = `
    <div style="height: 60px; display: flex; align-items: center;">
        <div style="white-space: nowrap;">
             ${name}
        </div>
    </div>
  `;

  rootEl.innerHTML = html;

  const imageBlob = htmlToImage.toBlob(rootEl, {
    canvasHeight: 60,
    canvasWidth: 500,
    height: 60,
    width: 500,
  });

  // remove rootEl
  document.body.removeChild(rootEl);

  return imageBlob;
  //
  // ;
  //
}
