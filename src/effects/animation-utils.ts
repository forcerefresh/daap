export function getObjectElementById(id: string): HTMLDivElement {
  const el = document.getElementsByClassName(
    `object-${id}`
  )[0] as HTMLDivElement;
  return el;
}
