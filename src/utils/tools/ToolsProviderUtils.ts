export function getCanvas(): HTMLDivElement {
  return document.getElementsByClassName(
    "MainToolCanvas"
  )[0]! as HTMLDivElement;
}
