import { SnapGuide } from "./snap-engine";

export function clearSnapGuides(): void {
  const snapHolder = document.querySelector(".StagePanel-SnapHolder") as HTMLElement | null;
  if (snapHolder) snapHolder.innerHTML = "";

  Array.from(document.getElementsByClassName("snap-highlight-object")).forEach((el) => {
    el.classList.remove("snap-highlight-object");
  });
}

export function renderSnapGuides(
  guides: SnapGuide[],
  snappedObjectIds: string[],
  stageScale: number,
  objectScale: number,
): void {
  const snapHolder = document.querySelector(".StagePanel-SnapHolder") as HTMLElement | null;
  if (!snapHolder) {
    return;
    return;
  }
  guides.forEach((guide) => {
    if (guide.isHorizontal) {
      snapHolder.innerHTML += `<div style="
        position:absolute;
        left:-10000px;
        top:${guide.position}px;
        right:-10000px;
        height:0px;
        border-top:${1 / stageScale}px solid #ce58d1;
        overflow:visible;
      "></div>`;
    } else {
      snapHolder.innerHTML += `<div style="
        position:absolute;
        top:-10000px;
        left:${guide.position}px;
        bottom:-10000px;
        width:0px;
        border-left:${1 / stageScale}px solid #ce58d1;
        overflow:visible;
      "></div>`;
    }
  });

  snappedObjectIds.forEach((objectId) => {
    const el = document.querySelector(`.object-holder-${objectId} > .object-selection`);
    if (el) {
      (el as HTMLElement).style.setProperty("--snap-border-width", `${1.2 / objectScale}px`);
      el.classList.add("snap-highlight-object");
    }
  });
}
