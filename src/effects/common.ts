import { EffectType } from "./types";

export function getMethodByType(
  type: EffectType | undefined,
  inverse = false
): "to" | "from" {
  return !inverse
    ? type === "in" || type === "effect"
      ? "from"
      : "to"
    : type === "in" || type === "effect"
    ? "to"
    : "from";
}

export function getObjectContentElementAndHtml(root: HTMLDivElement) {
  const objectContentElement = root.querySelector(
    ".object-content"
  ) as HTMLDivElement;
  /*if (objectContentElement) {
    objectContentElement.style.visibility = "hidden";
  }*/

  const objectContentHtml = objectContentElement.outerHTML
    .replace("object-content", "object-content-clone")
    .replace("hidden;", "");

  return { objectContentElement, objectContentHtml };
}

export function tilesCompleteHandler(
  type: EffectType | undefined,
  objectContentElement: HTMLDivElement,
  tilesElements: HTMLDivElement[]
) {
  if (type === "in") {
    objectContentElement.style.visibility = "visible";
  }
  tilesElements.forEach((element) => {
    element.style.visibility = "hidden";
  });
}

export function tilesStartHandler(
  type: EffectType | undefined,
  objectContentElement: HTMLDivElement,
  tilesElements: HTMLDivElement[]
) {
  objectContentElement.style.visibility = "hidden";
  //console.log(objectContentElement);
  tilesElements.forEach((element) => {
    element.style.visibility = "visible";
  });
}

export function createTilesFromHtml(
  htmlString: string,
  size: { w: number; h: number },
  grid: { r: number; c: number },
  visible = false
): HTMLDivElement[] {
  const holder = document.createElement("div");
  let html = "";
  const tilesWidth = size.w / grid.c;
  const tilesHeight = size.h / grid.r;
  for (let i = 0; i < grid.r; i++) {
    for (let j = 0; j < grid.c; j++) {
      html += `
      <div style="
        outline: 1px solid transparent;
        transform: translateZ(0);
        width: ${tilesWidth + 0}px; 
        height: ${tilesHeight + 0}px;
        position: absolute; 
        left: ${j * tilesWidth}px;
        top: ${i * tilesHeight}px;
        overflow: hidden;
        visibility: ${visible ? "visible" : "hidden"};
      ">
        <div style="
          position:absolute; 
          left: ${-j * tilesWidth}px; 
          top: ${-i * tilesHeight}px;
          width: ${size.w}px; 
          height: ${size.h}px;
        ">
          ${htmlString}
        </div>
      </div>`;
    }
  }

  holder.innerHTML = html;
  return Array.from(holder.children) as HTMLDivElement[];
}
