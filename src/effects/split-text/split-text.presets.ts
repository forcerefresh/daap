import { IEffectBase } from "../types";
import { ISplitTextEffect, SplitTextEffectValues } from "./split-text.types";

const effectBase: IEffectBase = {} as IEffectBase;
type ISplitTextPresetProperties = Exclude<
  ISplitTextEffect,
  keyof typeof effectBase
>;

export interface ISplitTextPreset {
  id: string;
  name: string;
  values: SplitTextEffectValues;
}

export const presets: ISplitTextPreset[] = [];
