import { Button } from "@blueprintjs/core";
import { cloneDeep } from "lodash-es";
import React, { useContext, useEffect, useState } from "react";
import { RGBColor } from "react-color";
import { IntegrationContext } from "../../integration";
import { getColorArrayField, getSelectField } from "../input-utils";
import {
  IColorArrayInput,
  IUpdateInput,
  Preset,
  PresetGroup,
} from "../../webslider-sdk/src/inputs/i-inputs";
import css from "./color-array-input-preset.module.scss";

const initalPreset: Preset<RGBColor[]> = {
  name: "default",
  value: [{ r: 256, g: 256, b: 256, a: 1 }],
};

export const ColorArrayInputPresetForm: React.FC<
  IColorArrayInput & IUpdateInput
> = (props) => {
  const { value, onChange } = props;

  const globalContext = useContext(IntegrationContext);
  const { getPresets } = globalContext.usePresets();
  const { addPreset } = globalContext.usePresets();
  const { updatePreset } = globalContext.usePresets();
  const { deletePreset } = globalContext.usePresets();

  const [presets, setPresets] = useState<Preset<RGBColor[]>[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  useEffect(() => {
    getPresets(PresetGroup.colors).then((response) => {
      response.unshift(initalPreset);
      setPresets(response);
    });
  }, []);

  const presetOptions = presets.map((preset) => ({
    label: preset.name,
    value: preset.name,
  }));

  const onClickAdd = () => {
    const newPreset = cloneDeep(initalPreset);
    newPreset.name = "preset" + Math.floor(Math.random() * 100);
    newPreset.created = new Date();
    [...newPreset.value] = value;

    addPreset(PresetGroup.colors, newPreset).then((response) => {
      response.unshift(initalPreset);
      setPresets(response);
      setSelectedPreset(newPreset.name);
    });
  };

  const onClickUpdate = () => {
    const updatedValue = cloneDeep(initalPreset);
    updatedValue.name = selectedPreset;
    [...updatedValue!.value] = value;

    updatePreset(PresetGroup.colors, updatedValue).then((response) => {
      response.unshift(initalPreset);
      setPresets(response);
      setSelectedPreset(updatedValue.name);
    });
  };

  const onClickDelete = () => {
    deletePreset(PresetGroup.colors, selectedPreset).then((response) => {
      response.unshift(initalPreset);
      setPresets(response);
    });
  };

  const renderAddBtn = () => {
    return (
      <Button
        minimal
        onClick={() => onClickAdd()}
        small={true}
        icon="add"
      ></Button>
    );
  };

  const renderUpdateBtn = () => {
    return (
      <Button
        minimal
        onClick={() => onClickUpdate()}
        small={true}
        icon="floppy-disk"
      ></Button>
    );
  };

  const renderDeleteBtn = () => {
    return (
      <Button
        minimal
        onClick={() => onClickDelete()}
        small={true}
        icon="delete"
      ></Button>
    );
  };

  return (
    <>
      <div className={css.colorRow}>
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
        {renderAddBtn()}
        {renderDeleteBtn()}
        {renderUpdateBtn()}
      </div>
      {getColorArrayField("colors:", value, onChange)}
    </>
  );
};
