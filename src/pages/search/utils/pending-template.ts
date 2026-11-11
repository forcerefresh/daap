export function getPendingTemplate() {
  let template:
    | { id: string; language: string; previewUid: string }
    | undefined;
  try {
    const templateStr = localStorage.getItem("pendingTemplate");
    if (templateStr) {
      template = JSON.parse(templateStr);
    }
  } catch (ex) {}

  return template;
}
