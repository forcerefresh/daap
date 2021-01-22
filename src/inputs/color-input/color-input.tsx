import React, { RefObject, useEffect, useRef, useState } from "react";
import { isEqual } from "lodash-es";
import { FormGroup } from "@blueprintjs/core";
import { IColorInput, IUpdateInput } from "../types";
import { RGBColor, SketchPicker } from "react-color";
import css from "./color-input.module.scss";

export const ColorInputForm: React.FC<IColorInput & IUpdateInput> = (props) => {
  const { value, defaultValue, displayName, onChange } = props;

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

  // update state when props.value is changed
  useEffect(() => {
    if (!isEqual(colorFromProp, state.color)) {
      setState({ ...state, color: colorFromProp, initialColor: colorFromProp });
    }
  }, [colorFromProp, state]);

  const handleClick = () => {
    setState({ ...state, displayColorPicker: !state.displayColorPicker });
  };

  const handleClose = () => {
    setState({ ...state, displayColorPicker: false });
  };

  const handleChange = (color: any) => {
    setState({ ...state, color: color.rgb });
    onChange(color.rgb);
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
      onChange(state.color);
      setState({
        ...state,
        displayColorPicker: false,
      });
    }
  });

  return (
    <FormGroup label={displayName} labelFor="color-input" inline>
      <div
        id="color-input"
        className={css.swatch}
        onClick={handleClick}
        tabIndex={1}
      >
        <div className={css.color} style={style} />
      </div>
      {state.displayColorPicker ? (
        <div className={css.popover}>
          <div className={css.cover} onClick={handleClose} />
          <div>
            <SketchPicker color={state.color} onChange={handleChange} />
          </div>
        </div>
      ) : null}
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
