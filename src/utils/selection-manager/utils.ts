export function updateHandleVisibility(
  handleClassName: "rotation-handle" | "resize-handle",
  visible: boolean
) {
  const handles = Array.from(document.getElementsByClassName(handleClassName));
  handles.forEach((handle) => {
    (handle as HTMLElement).style.opacity = visible ? "1" : "0";
  });
}

export function updateBoxShadow(objectId: string, boxShadow: string = "none") {
  const objectEl = document.getElementsByClassName(
    `object-holder-${objectId}`
  )[0] as HTMLDivElement | null;

  const prevBoxShadow = objectEl?.style.boxShadow;
  if (objectEl) objectEl.style.boxShadow = boxShadow;

  return prevBoxShadow;
}
