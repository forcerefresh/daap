import { remove } from "lodash-es";
import { Preset, PresetGroup } from "../../../inputs/types";

export const usePresets = () => {
  const getPresets = (type: PresetGroup): Promise<Preset<any>[]> => {
    const presets: any[] = JSON.parse(
      localStorage.getItem(`presets-${type}`) || "[]"
    );

    return new Promise((resolve) => {
      resolve(presets);
    });
  };

  const addPreset = (
    type: PresetGroup,
    preset: Preset<any>
  ): Promise<Preset<any>[]> => {
    const presets: any[] = JSON.parse(
      localStorage.getItem(`presets-${type}`) || "[]"
    );

    presets.push(preset);
    localStorage.setItem(`presets-${type}`, JSON.stringify(presets));

    return new Promise((resolve, reject) => {
      resolve(presets);
    });
  };

  const deletePreset = (
    type: PresetGroup,
    name: string
  ): Promise<Preset<any>[]> => {
    const presets: any[] = JSON.parse(
      localStorage.getItem(`presets-${type}`) || "[]"
    );

    remove(presets, (presets: any) => {
      return presets.name === name;
    });

    localStorage.setItem(`presets-${type}`, JSON.stringify(presets));

    return new Promise((resolve) => {
      resolve(presets);
    });
  };

  const updatePreset = (
    type: PresetGroup,
    preset: Preset<any>
  ): Promise<Preset<any>[]> => {
    const presets: any[] = JSON.parse(
      localStorage.getItem(`presets-${type}`) || "[]"
    );

    let presetItem = presets.find((p) => p.name === preset.name);
    let presetItemIndex = presets.indexOf(presetItem);
    presets[presetItemIndex].value = preset.value;

    localStorage.setItem(`presets-${type}`, JSON.stringify(presets));

    return new Promise((resolve) => {
      resolve(presets);
    });
  };

  return {
    getPresets,
    addPreset,
    updatePreset,
    deletePreset,
  };
};
