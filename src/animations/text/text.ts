import { useEffect } from "react";
import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "webslider-sdk/lib/animations/animations-register";
import { IObject, ITransition } from "webslider-sdk/lib/objects/i-object";
import { IItemsData } from "../../export/i-export-html";
import { TextValues } from "../../objects/text/text";
import { textAnimation } from "./text.animation";
import { textDefaults, textDefinition } from "./text.definition";
import { TextAnimationValues, TEXT_ANIMATION } from "./text.types";

export const textDef: IAnimationExtensionDefinition = {
  animationId: TEXT_ANIMATION,
  animationFunc: textAnimation,
};

export const textAppDef: IAnimationExtensionAppDefinition = {
  animationId: TEXT_ANIMATION,
  formDefaults: textDefaults,
  formDefinition: textDefinition,
  getDuration: (object: IObject | IItemsData, config: ITransition) => {
    const effValues = config?.animation?.values! as TextAnimationValues;

    // we can call it from App (IObject) or from Player (IItemsData)
    let values: TextValues | undefined;
    if ((object as unknown as IItemsData).itemValues) {
      values = (object as unknown as IItemsData).itemValues as TextValues;
    } else {
      values = (object as unknown as IObject)?.definition.values as TextValues;
    }

    const wordsArr = values.text.split(" ");
    const charsStr = wordsArr?.join("");

    const dur =
      charsStr.length * parseInt(effValues.delayBetweenChar) +
      parseInt(effValues.durationPerChar);

    return dur;
  },
};
