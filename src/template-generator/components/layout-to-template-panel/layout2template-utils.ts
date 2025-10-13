import { cloneDeep } from "lodash-es";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";

export function collectLayoutObjectsPrompts(
  objectById: any,
  objectIds: string[]
): { prompt: string; objectId: string }[] {
  const ret: { prompt: string; objectId: string }[] = [];

  objectIds.forEach((objectId) => {
    const object = objectById[objectId];

    console.log(object);
    console.log(object.type);

    const objectDeff = getAppObjectDefinition(object.type, "latest");

    console.log(objectDeff);

    const tmpObj = objectDeff?.postProcess?.({
      object: {
        ...object,
        properties: { ...object.properties, generateAIPrompt: true },
      },
      prevObject: object,
    });

    console.log(tmpObj);

    ret.push({ prompt: tmpObj?.properties.aiPrompt, objectId: object.id });
  });

  return ret;
}

export function createLayout2TemplateAIPrompt(
  objectById: any,
  objectIds: string[]
): string {
  const prompts = collectLayoutObjectsPrompts(objectById, objectIds);

  //   const promptStr = prompts.reduce((acc, curr, idx) => {
  //     acc += " - " + JSON.stringify(curr.prompt, undefined, 2) + "\n";
  //     return acc;
  //   }, "");

  const promptStr = JSON.stringify(prompts, undefined, 2);
  return promptStr;
}

export function mergeAiTemplateAndSimplifiedLayout(
  simplifiedLayout: any,
  aiResponseJson: any
) {
  const aiResponseJsonClone = cloneDeep(aiResponseJson);

  aiResponseJsonClone.objects.forEach((item) => {
    item.bounds = getBounds(simplifiedLayout, item.objectId);
  });

  debugger;
  return aiResponseJsonClone;
}

function getBounds(simplifiedLayout: any, objectId: string) {
  return simplifiedLayout.find((item) => item.objectId === objectId).prompt
    .bounds;
}
