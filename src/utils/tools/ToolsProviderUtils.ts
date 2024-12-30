export function getCanvas(): HTMLDivElement {
  return document.getElementsByClassName(
    "MainToolCanvas"
  )[0]! as HTMLDivElement;
}

export function getStage(): HTMLDivElement {
  return document.getElementsByClassName("StagePanel")[0]! as HTMLDivElement;
}
