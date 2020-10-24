import React, { RefObject, useEffect, useRef, useState } from "react";
import { IColorInput, IUpdateInput } from "../types";
import { RGBColor, SketchPicker } from "react-color";
import styles from "./color-input-form.module.scss";
import { isEqual } from "lodash-es";

export const ColorInputForm: React.FC<IColorInput & IUpdateInput> = (props) => {
  const { displayName, value, defaultValue, onChange } = props;
  console.log(value);
  const [state, setState] = useState<{
    displayColorPicker: boolean;
    color: RGBColor;
  }>({
    displayColorPicker: false,
    color: (value || defaultValue) as RGBColor,
  });

  // update state when props.value is changed
  useEffect(() => {
    if (!isEqual(value || defaultValue, state.color)) {
      setState({ ...state, color: (value || defaultValue) as RGBColor });
    }
  }, [value, defaultValue]);

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

  console.log(value);
  console.log(defaultValue);
  console.log(state);

  //o nKeyPress={this.handleKeyPress}

  useEventListener("keypress", (event: any) => {
    console.log(event);
  });

  return (
    <div>
      <div className={styles.swatch} onClick={handleClick} tabIndex={1}>
        <div className={styles.color} style={style} />
      </div>
      {state.displayColorPicker ? (
        <div
          className={styles.popover}
          onKeyPress={(event) => {
            console.log(event);
          }}
        >
          <div className={styles.cover} onClick={handleClose} />
          <SketchPicker color={state.color} onChange={handleChange} />
        </div>
      ) : null}
    </div>
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
