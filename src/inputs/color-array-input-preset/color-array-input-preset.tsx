import React, { useContext, useEffect, useState } from "react";
import { RGBColor } from "react-color";
import { IntegrationContext } from "../../integration";
import { getColorArrayField, getSelectField } from "../input-utils";
import { IColorArrayInput, IUpdateInput, Preset, PresetGroup } from "../types";

export const ColorArrayInputPresetForm: React.FC<
  IColorArrayInput & IUpdateInput
> = (props) => {
  const { value, onChange } = props;

  const globalContext = useContext(IntegrationContext);
  const { getPresets } = globalContext.usePresets();

  const [presets, setPresets] = useState<Preset<RGBColor[]>[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  useEffect(() => {
    getPresets(PresetGroup.colors).then((response) => {
      setPresets(response);
    });
  }, []);

  const presetOptions = presets.map((preset) => ({
    label: preset.name,
    value: preset.name,
  }));
  presetOptions.unshift({ label: "", value: "" });

  return (
    <>
      {getSelectField(
        "Presets:",
        selectedPreset,
        presetOptions,
        (selectedPresetName) => {
          setSelectedPreset(selectedPresetName);

          // apply preset to value
          const selectedPreset = presets.find(
            (preset) => preset.name === selectedPresetName
          );
          onChange(selectedPreset?.value!);
        }
      )}

      {getColorArrayField("colors:", value, onChange)}
    </>
  );
};
