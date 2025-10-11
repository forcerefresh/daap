import { useMemo, useState } from "react";
import { ColorPaletteRow } from "../../../inputs/color-input/color-palette-row";
import { AiPrompt } from "../../types/ai-prompts";
import PromptCard, { SelectedColorPaletteType } from "./prompt-card";
import { ColorTheme } from "../../types/colors";
import { cloneDeep, isEqual } from "lodash-es";
import { Checkbox } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";

export const ColorSetPromptCard = ({
  onSelect,
  promptId,
  aiPrompt,
  title,
  selectedColorPalette,
  colorPaletteStatuses,
  setColorPaletteStatus,
}: {
  onSelect: (colorTheme: ColorTheme) => void;
  title: string;
  promptId: string;
  aiPrompt: AiPrompt;
  selectedColorPalette: ColorTheme | null;
  colorPaletteStatuses: Record<string, boolean>;
  setColorPaletteStatus: (
    promptId: string,
    idx: number,
    status: boolean | undefined,
    ct: ColorTheme[]
  ) => void;
}) => {
  const colorPalettes = useMemo(() => {
    return aiPrompt.aiResponseJson as { colors: ColorTheme[] };
  }, [aiPrompt]);

  return (
    <ColorSetPromptCardView
      selectedColorPalette={selectedColorPalette}
      onSelect={onSelect}
      title={title}
      promptId={promptId}
      colorPalettes={colorPalettes?.colors}
      setColorPaletteStatus={setColorPaletteStatus}
      colorPaletteStatuses={colorPaletteStatuses}
    />
  );
};

export const ColorSetPromptCardView = ({
  colorPalettes,
  promptId,
  title,
  onSelect,
  selectedColorPalette,
  colorPaletteStatuses,
  setColorPaletteStatus,
}: {
  title: string;
  promptId: string;
  colorPalettes?: ColorTheme[];
  onSelect: (colorTheme: ColorTheme) => void;
  selectedColorPalette: ColorTheme | null;
  colorPaletteStatuses?: Record<string, boolean>;
  setColorPaletteStatus?: (
    promptId: string,
    idx: number,
    status: boolean | undefined,
    ct: ColorTheme[]
  ) => void;
}) => {
  if (!colorPalettes) return null;

  return (
    <div>
      <h4>{title}</h4>
      {colorPalettes.map((colorSet, idx) => (
        <div style={{ display: "flex", padding: "5px" }}>
          {!!setColorPaletteStatus && (
            <Checkbox
              style={{ borderLeft: "10px solid green" }}
              large
              disabled={!isEqual(selectedColorPalette, colorSet)}
              checked={colorPaletteStatuses?.[idx] === true}
              onChange={(e) => {
                const cpsClone = cloneDeep(colorPaletteStatuses) ?? {};

                if (e.target.checked) {
                  cpsClone[idx] = true;

                  const approvedColorSets = colorPalettes.filter(
                    (cp, idx) => !!cpsClone[idx]
                  );
                  setColorPaletteStatus(promptId, idx, true, approvedColorSets);
                } else {
                  delete cpsClone[idx];
                  const approvedColorSets = colorPalettes.filter(
                    (cp, idx) => !!cpsClone[idx]
                  );
                  setColorPaletteStatus(
                    promptId,
                    idx,
                    undefined,
                    approvedColorSets
                  );
                }
              }}
            />
          )}
          {/* <Checkbox
            style={{ borderLeft: "10px solid red" }}
            large
            disabled={!isEqual(selectedColorPalette, colorSet)}
            checked={colorPaletteStatuses[idx] === false}
            onChange={(e) => {
              if (e.target.checked) {
                setColorPaletteStatus(promptId, idx, false);
              } else {
                setColorPaletteStatus(promptId, idx, undefined);
              }
            }}
          /> */}
          <ColorPaletteRow
            small
            onClick={() => {
              onSelect(colorSet);
            }}
            selected={isEqual(selectedColorPalette, colorSet)}
            colors={[
              colorSet.primary,
              colorSet.secondary,
              colorSet.background,
              colorSet.text,
              colorSet.accent,
              colorSet.attention,
            ]}
          />
        </div>
      ))}
    </div>
  );
};
