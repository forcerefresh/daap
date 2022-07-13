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
  let objectContentElement = root.querySelector(
    ".object-content"
  ) as HTMLDivElement;

  // TODO: THIS IS QUICK FIX FOR LAYER
  if (root.className.indexOf("layer") !== -1) {
    objectContentElement = root;
  }

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
      <div class="tile" style="
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

export function updateTilesSize(
  tiles: HTMLDivElement[],
  size: { w: number; h: number },
  grid: { r: number; c: number }
) {
  let counter = 0;
  const tilesWidth = size.w / grid.c;
  const tilesHeight = size.h / grid.r;

  for (let i = 0; i < grid.r; i++) {
    for (let j = 0; j < grid.c; j++) {
      const tile = tiles[counter];
      tile.style.width = tilesWidth + "px";
      tile.style.height = tilesHeight + "px";
      tile.style.left = j * tilesWidth + "px";
      tile.style.top = i * tilesHeight + "px";

      const child = tile.children[0] as HTMLDivElement;
      if (child) {
        child.style.left = -j * tilesWidth + "px";
        child.style.top = -i * tilesHeight + "px";
        child.style.width = size.w + "px";
        child.style.height = size.h + "px";
      }

      counter++;
      /*
      html += `
      <div class="tile" style="
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
      </div>`;*/
    }
  }
}
