import { Preset, PresetGroup } from "../../../utils/presets/i-presets";

export const usePresets = () => {
  const getPresets = (type: PresetGroup): Promise<Preset<any>[]> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("Presets::Get", JSON.stringify({ type }))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const addPreset = (
    type: PresetGroup,
    preset: Preset<any>
  ): Promise<Preset<any>[]> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("Presets::Add", JSON.stringify({ type, preset }))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const deletePreset = (
    type: PresetGroup,
    uid: string
  ): Promise<Preset<any>[]> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("Presets::Delete", JSON.stringify({ type, uid }))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const updatePreset = (
    type: PresetGroup,
    preset: Preset<any>
  ): Promise<Preset<any>[]> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("Presets::Update", JSON.stringify({ type, preset }))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  return {
    getPresets,
    addPreset,
    updatePreset,
    deletePreset,
  };
};
