import { isArray, isEmpty, noop, uniq, uniqWith } from "lodash-es";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { RGBColor } from "react-color";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { rgbColor2cssRgba } from "../../utils/utils";
import { getButtonGroupField, getColorField } from "../input-utils";
import { ISVGInput, IUpdateInput } from "../types";
import css from "./svg-input.module.scss";

const MAX_COLORS = 50;

export const SVGCustomColorsForm: React.FC<ISVGInput & IUpdateInput> = (
  props
) => {
  const { displayName, value, onChange = noop } = props;

  useEffect(() => {
    if (!value.colors) {
      const colors = getColors(value.source);
      onChange({ ...value, colors });
    }
  }, [value]);

  const [libraryOpen, setLibraryOpen] = useState(false);

  // logic for handling click outside
  const sharedRef = useRef(null);
  const handleClickOutside = () => {
    setLibraryOpen(false);
  };
  useOnClickOutside(sharedRef, handleClickOutside, [
    "image-preview-popover",
    "color-picker-holder",
    "bp3-overlay-scroll-container", // alert
  ]);

  const [customColors, setCustomColors] = useState<RGBColor[]>([]);

  const getColorsMemo = useMemo(() => {
    return uniqWith(getColors(value.source), (col1: any, col2: any) => {
      return rgbColor2cssRgba(col1) === rgbColor2cssRgba(col2);
    });
  }, [value.source]);

  if (isArray(value.colors) && isEmpty(value.colors))
    return <div>SVG does not contain colors for editing.</div>;

  const uniqueColors = uniqWith(value.colors, (col1: any, col2: any) => {
    return rgbColor2cssRgba(col1) === rgbColor2cssRgba(col2);
  });

  const arrayToShow =
    value.colorsType === "unique" ? uniqueColors : value?.colors || [];

  if (getColorsMemo.length > MAX_COLORS) {
    if (!value.disableCustomColors) {
      onChange({ ...value, disableCustomColors: true });
    }
    return (
      <div>
        Note: Colors editing is not allowed if SVG has more that {MAX_COLORS}{" "}
        different colors. <br />
        Explanation: This limitation is there to keep app and slider performant.
      </div>
    );
  }

  return (
    <div>
      {getButtonGroupField(
        "List",
        value.colorsType,
        (colorsType) => {
          const colors = getColors(value.source);
          onChange({ ...value, colors, colorsType: colorsType });
        },
        [
          {
            value: "unique",
            label: `Unique (${getColorsMemo.length})`,
          },
          { value: "all", label: `All (${value.colors?.length})` },
        ],
        "Switch between 'Unique' and 'All' resets colors to original"
      )}
      {arrayToShow.map((color: any, idx: number) => {
        return getColorField(`Color ${idx + 1}`, color, (newCol) => {
          if (value.colors) {
            let newColors = [...value.colors];

            if (value.colorsType === "all") {
              newColors[idx] = newCol;
            } else {
              const oldColor = uniqueColors[idx];
              newColors = newColors.map((col) => {
                if (rgbColor2cssRgba(col) === rgbColor2cssRgba(oldColor)) {
                  return { ...newCol };
                }
                return col;
              });
            }

            onChange({ ...value, colors: newColors });
          }
        });
      })}
    </div>
  );
};

function getColors(svgSource: string): RGBColor[] {
  let colors: string[] = [];
  /*  svgSource.replace(/fill:(#[abcdef0-9]{3,6})/gi, function (v, c: string) {
    console.log(c);
    colors.push(c);
    return v;
  });
  svgSource.replace(/fill="(#[abcdef0-9]{3,6})/gi, function (v, c: string) {
    console.log(c);
    colors.push(c);
    return v;
  });
  */
  svgSource.replace(/(#[abcdef0-9]{3,6})/gi, function (v, c: string) {
    console.log(c);
    colors.push(c);
    return v;
  });

  //colors = uniq(colors);

  console.log(colors);
  return colors.map((c) => hexToRGB(c, 1));
}

function hexToRGB(hex: string, a?: number) {
  let r, g, b;
  if (hex.length === 4) {
    r = parseInt(hex.slice(1, 2) + hex.slice(1, 2), 16);
    g = parseInt(hex.slice(2, 3) + hex.slice(2, 3), 16);
    b = parseInt(hex.slice(3, 4) + hex.slice(3, 4), 16);
  } else {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }

  if (a) {
    return { r, g, b, a };
  } else {
    return { r, g, b, a: 1 };
  }
}
