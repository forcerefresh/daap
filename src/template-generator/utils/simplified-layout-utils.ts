import { createLayout2TemplateAIPrompt } from "../components/layout-to-template-panel/layout2template-utils";

export function convertLayout2SimplifiedLayout(layoutResponse: any) {
  const page1Id = layoutResponse.project.pages.pages[0];
  if (page1Id) {
    const page1 = layoutResponse.project.pages.pageById[page1Id];
    const layer1Id = page1.layerIds[0];
    const layer = layoutResponse.project.layers.layerById[layer1Id];

    const simplifiedLayout = createLayout2TemplateAIPrompt(
      layoutResponse.project.objects.objectById,
      layer.objectIds
    );

    return simplifiedLayout;
  }
  return null;
}
