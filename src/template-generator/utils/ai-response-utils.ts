import { IObject } from "webslider-sdk/lib/objects/i-object";

type aiImageRequestItem = {
  objectId: string;
  prompt: string;
  type: "image";
  width: string;
  height: string;
};

export function createImageJsonRequest(aiResponse: any, layout: any) {
  const iaImagesRequest: aiImageRequestItem[] = [];
  try {
    aiResponse.objects.forEach((obj: any) => {
      const existingObj: IObject =
        layout.project.objects.objectById[obj.objectId!];

      if (obj.type === "image" || obj.subType === "image") {
        const objectId = obj.objectId;
        const prompt = obj.aiPrompt;
        iaImagesRequest.push({
          objectId,
          prompt,
          type: "image",
          width: existingObj.width?.toString()!,
          height: existingObj.height?.toString()!,
        });
      }
    });
  } catch (ex) {
    console.log("ERROR A5");
    console.log(ex);
  }
}
