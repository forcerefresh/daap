import { Button, FormGroup, Icon, InputGroup, Intent } from "@blueprintjs/core";
import { isEqual, noop, pick } from "lodash-es";
import React, { useEffect, useRef, useState } from "react";
import { ITransformInput, IUpdateInput } from "../types";
import css from "./transform-input.module.scss";

const SMALL_ICON_SIZE = 18;

export const TransformInputForm: React.FC<ITransformInput & IUpdateInput> = (
  props
) => {
  const { value, onChange = noop, inputProps = {} } = props;

  const [internalValue, setInternalValue] = useState<{
    left: string;
    top: string;
    width: string;
    height: string;
  }>(pick(value, "left", "top", "width", "height") as any);

  const [latestValidValue, setLatestValidValue] = useState<{
    left: string;
    top: string;
    width: string;
    height: string;
  }>(pick(value, "left", "top", "width", "height") as any);

  useEffect(() => {
    if (!isEqual(value, latestValidValue)) {
      setLatestValidValue(pick(value, "left", "top", "width", "height") as any);
      setInternalValue(pick(value, "left", "top", "width", "height") as any);
    }
  }, [value]);

  const [valid, setValid] = useState<{
    left: boolean;
    top: boolean;
    width: boolean;
    height: boolean;
  }>({ left: true, top: true, width: true, height: true });

  const [keepAspectRatio, setKeepAspectRatio] = useState(false);
  const [aspectRatioMultiplier, setAspectRatioMultiplier] = useState<{
    hMultiplier: number;
    vMultiplier: number;
  }>({ hMultiplier: 1, vMultiplier: 1 });

  const updateValue = (
    propertyName: "left" | "top" | "width" | "height",
    propertyValue: string
  ) => {
    internalValue[propertyName] = propertyValue;
    setInternalValue({ ...internalValue });

    const currValid = { ...valid };

    const isNumber = new RegExp("^-?\\d*(\\.\\d+)?$").test(propertyValue);

    //validate is number
    if (isNumber && !isNaN(parseFloat(propertyValue))) {
      //validate is positive for width and height
      const isValidValue =
        propertyName === "width" || propertyName === "height"
          ? parseFloat(propertyValue) >= 0
          : true;

      currValid[propertyName] = isValidValue;

      if (isValidValue) {
        const value2 = { ...value } as any;
        value2[propertyName] = propertyValue;
        setLatestValidValue({ ...value2 });
        if (keepAspectRatio) {
          if (propertyName === "width") {
            const _height =
              aspectRatioMultiplier.hMultiplier * parseFloat(propertyValue);
            internalValue.height = _height.toString();
            setInternalValue({ ...internalValue });
            currValid.height = true;
          }
          if (propertyName === "height") {
            const _width =
              aspectRatioMultiplier.vMultiplier * parseFloat(propertyValue);
            internalValue.width = _width.toString();
            setInternalValue({ ...internalValue });
            currValid.width = true;
          }
        }
      }
    } else {
      currValid[propertyName] = false;
    }

    setValid({ ...currValid });

    onChange({
      ...value,
      ...(currValid.left && { left: parseFloat(internalValue.left) }),
      ...(currValid.top && { top: parseFloat(internalValue.top) }),
      ...(currValid.width && { width: parseFloat(internalValue.width) }),
      ...(currValid.height && { height: parseFloat(internalValue.height) }),
    });
  };

  return (
    <div className={css.main}>
      <div>
        <FormGroup label={"X"} labelFor="text-input-X" inline>
          <InputGroup
            disabled={inputProps.disablePosition}
            inputRef={(el) => {
              if (el) el!.autocomplete = "off";
            }}
            intent={!valid.left ? Intent.WARNING : Intent.NONE}
            id="text-input-X"
            placeholder="Placeholder text"
            value={internalValue?.left?.toString()}
            onChange={(event: any) => updateValue("left", event.target.value)}
            onInput={(event: any) => updateValue("left", event.target.value)}
          />
        </FormGroup>
        <FormGroup label={"Y"} labelFor="text-input-Y" inline>
          <InputGroup
            disabled={inputProps.disablePosition}
            inputRef={(el) => {
              if (el) el!.autocomplete = "off";
            }}
            intent={!valid.top ? Intent.WARNING : Intent.NONE}
            id="text-input-Y"
            placeholder="Placeholder text"
            value={internalValue?.top?.toString()}
            onChange={(event: any) => updateValue("top", event.target.value)}
            onInput={(event: any) => updateValue("top", event.target.value)}
          />
        </FormGroup>
      </div>
      <div>
        <FormGroup label={"W"} labelFor="text-input-W" inline>
          <InputGroup
            disabled={inputProps.selfSize}
            inputRef={(el) => {
              if (el) el!.autocomplete = "off";
            }}
            intent={!valid.width ? Intent.WARNING : Intent.NONE}
            id="text-input-W"
            placeholder="Placeholder text"
            value={internalValue?.width?.toString()}
            onChange={(event: any) => updateValue("width", event.target.value)}
            onInput={(event: any) => updateValue("width", event.target.value)}
          />
        </FormGroup>
        <FormGroup label={"H"} labelFor="text-input-H" inline>
          <InputGroup
            disabled={inputProps.selfSize}
            inputRef={(el) => {
              if (el) el!.autocomplete = "off";
            }}
            intent={!valid.height ? Intent.WARNING : Intent.NONE}
            id="text-input-H"
            placeholder="Placeholder text"
            value={internalValue?.height?.toString()}
            onChange={(event: any) => updateValue("height", event.target.value)}
            onInput={(event: any) => updateValue("height", event.target.value)}
          />
        </FormGroup>
      </div>
      <div>
        <div className={css.linkTop} />
        <Button
          small
          minimal
          onClick={() => {
            setKeepAspectRatio(!keepAspectRatio);
            if (!keepAspectRatio)
              setAspectRatioMultiplier({
                hMultiplier:
                  parseFloat(latestValidValue.height) /
                  parseFloat(latestValidValue.width),
                vMultiplier:
                  parseFloat(latestValidValue.width) /
                  parseFloat(latestValidValue.height),
              });
          }}
          active={keepAspectRatio}
        >
          <Icon icon="link" iconSize={SMALL_ICON_SIZE} color={"gray"} />
        </Button>
        <div className={css.linkBottom} />
      </div>
    </div>
  );
};
