import {
  Button,
  FormGroup,
  Popover,
  PopoverInteractionKind,
  Position,
  TextArea,
} from "@blueprintjs/core";
import { cloneDeep, debounce, noop, throttle, uniq } from "lodash-es";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RGBColor } from "react-color";
import MediaLibraryPanel, {
  Panels,
} from "../../panels/media-library/MediaLibraryPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import {
  IHTMLInput,
  ISVGInput,
  IUpdateInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import css from "./svg-input.module.scss";

export const HTMLInputForm: React.FC<IHTMLInput & IUpdateInput> = (props) => {
  const { displayName, value, onInput = noop, inputProps = {} } = props;
  const { rows = 5 } = inputProps;

  const throttledOnChange = useCallback(
    debounce((value: any) => onInput({ source: value }), 100),
    [onInput]
  );

  const [localValue, setLocalValue] = useState(value.source);

  useEffect(() => {
    if (localValue !== value.source) {
      setLocalValue(value.source);
    }
  }, [value.source]);

  const handleChange = (value: any) => {
    if (inputProps.disableDebounce) {
      onInput({ source: value });
    } else {
      throttledOnChange(value);
    }
  };

  return (
    <FormGroup label={displayName} labelFor="textarea-input">
      <TextArea
        id="textarea-input"
        growVertically={true}
        rows={rows}
        fill
        value={localValue}
        onChange={(event: any) => {
          setLocalValue(event.target.value);
          handleChange(event.target.value);
        }}
        onInput={(event: any) => {
          setLocalValue(event.target.value);
          handleChange(event.target.value);
        }}
      />
    </FormGroup>
  );
};

function getColors(svgSource: string): RGBColor[] {
  let colors: string[] = [];
  svgSource.replace(/fill:(#[abcdef0-9]{6})/gi, function (v, c: string) {
    colors.push(c);
    return v;
  });
  svgSource.replace(/fill="(#[abcdef0-9]{6})/gi, function (v, c: string) {
    colors.push(c);
    return v;
  });

  colors = uniq(colors);
  return colors.map(hexToRGB);
}

function hexToRGB(hex: string, a?: number) {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (a) {
    return { r, g, b, a };
  } else {
    return { r, g, b, a: 1 };
  }
}
