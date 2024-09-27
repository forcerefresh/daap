import React, { RefObject, useEffect, useRef, useState } from "react";
import { isEqual } from "lodash-es";
import cx from "classnames";
import { Button, FormGroup, Popover } from "@blueprintjs/core";
import { IColorInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";
import { RGBColor, SketchPicker } from "react-color";
import css from "./color-input.module.scss";
import { ReactComponent as BackgroundSVG } from "./transparent-bg.svg";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { createInputLabel } from "../input-helpers";
import { hexToRGB } from "../../utils/utils";
import { ReactComponent as ColorPickerIcon } from "../../assets/icons/color-picker-icon.svg";

export const ColorInputForm: React.FC<IColorInput & IUpdateInput> = (props) => {
  const {
    value,
    defaultValue,
    propertyName,
    displayName,
    helperText,
    onChange,
    inputProps,
  } = props;

  const colorFromProp = (value || defaultValue) as RGBColor;

  const [state, setState] = useState<{
    displayColorPicker: boolean;
    initialColor: RGBColor;
    color: RGBColor;
  }>({
    displayColorPicker: false,
    color: colorFromProp,
    initialColor: colorFromProp,
  });

  const handleClickOutside = () => handleClose();

  const colorPickerHolderRef = useRef(null);
  useOnClickOutside(colorPickerHolderRef, handleClickOutside);

  // update state when props.value is changed
  useEffect(() => {
    if (!isEqual(colorFromProp, state.color)) {
      setState({ ...state, color: colorFromProp, initialColor: colorFromProp });
    }
  }, []); //colorFromProp, state

  const handleClick = () => {
    setState({
      color: colorFromProp,
      initialColor: colorFromProp,
      displayColorPicker: !state.displayColorPicker,
    });
  };

  const handleClose = () => {
    setState({
      color: colorFromProp,
      initialColor: colorFromProp,
      displayColorPicker: false,
    });
  };

  const handleApply = () => {
    setState({ ...state, displayColorPicker: false });
    onChange(state.color);
  };

  const handleChange = (color: any) => {
    setState({ ...state, color: color.rgb });
    //onChange(color.rgb);
  };

  const { color } = state;
  const style = {
    background: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
  };

  useEventListener("keydown", (event: any) => {
    if (event.keyCode === 27) {
      setState({
        ...state,
        color: state.initialColor,
        displayColorPicker: false,
      });
    } else if (event.keyCode === 13) {
      //onChange(state.color);
      setState({
        ...state,
        displayColorPicker: false,
      });
    }
  });

  const EyeDropperClass = (window as any).EyeDropper;

  return (
    <FormGroup
      className={cx(css.colorInput, inputProps?.className)}
      label={createInputLabel(displayName, propertyName)}
      labelFor="color-input"
      inline
      helperText={!!helperText && helperText}
    >
      <Popover
        //position="top"
        isOpen={state.displayColorPicker}
        portalClassName="color-picker-popover"
        minimal
        content={
          <div
            className={cx("color-picker-holder", css.popoverContent)}
            ref={colorPickerHolderRef}
          >
            <div>
              <SketchPicker color={state.color} onChange={handleChange} />
            </div>
            <div className={css.actionHolder}>
              <div className={css.buttonHolder}>
                <Button icon="tick" onClick={handleApply} intent="success">
                  Apply
                </Button>
                <Button
                  icon="cross"
                  onClick={handleClose}
                  intent="none"
                  minimal
                >
                  Cancel
                </Button>
              </div>
              <Button
                icon={<ColorPickerIcon style={{ width: "20px" }} />}
                minimal
                onClick={() => {
                  if (!EyeDropperClass) {
                    return;
                  }

                  const eyeDropper = new (window as any).EyeDropper();

                  eyeDropper
                    .open()
                    .then((result: any) => {
                      setState({
                        ...state,
                        color: hexToRGB(result.sRGBHex),
                      });
                    })
                    .catch((_e) => {});
                }}
              />
            </div>
          </div>
        }
      >
        <div
          id="color-input"
          className={cx(css.swatch, inputProps?.swatchClassName)}
          onClick={handleClick}
          tabIndex={1}
        >
          <BackgroundSVG style={{ position: "absolute" }} />
          <div className={css.color} style={style} />
        </div>
      </Popover>
    </FormGroup>
  );
};

// Hook
function useEventListener<T extends HTMLElement = HTMLDivElement>(
  eventName: string,
  handler: Function,
  element?: RefObject<T>
) {
  // Create a ref that stores handler
  const savedHandler = useRef<Function>();
  useEffect(() => {
    // Define the listening target
    const targetElement: T | Window = element?.current || window;
    if (!(targetElement && targetElement.addEventListener)) {
      return;
    }
    // Update saved handler if necessary
    if (savedHandler.current !== handler) {
      savedHandler.current = handler;
    }
    // Create event listener that calls handler function stored in ref
    const eventListener = (event: Event) => {
      // eslint-disable-next-line no-extra-boolean-cast
      if (!!savedHandler?.current) {
        savedHandler.current(event);
      }
    };
    targetElement.addEventListener(eventName, eventListener);
    // Remove event listener on cleanup
    return () => {
      targetElement.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element, handler]);
}
