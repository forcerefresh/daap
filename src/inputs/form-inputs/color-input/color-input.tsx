import React, { RefObject, useEffect, useRef, useState } from "react";
import { IColorInput, IUpdateInput } from "../../types";
import { RGBColor, SketchPicker } from "react-color";
import styles from "./color-input.module.scss";
import { isEqual } from "lodash-es";

export const ColorInputForm: React.FC<IColorInput & IUpdateInput> = (props) => {
  const { displayName, value, defaultValue, onChange } = props;

  const _color = (value || defaultValue) as RGBColor;

  const [state, setState] = useState<{
    displayColorPicker: boolean;
    initialColor: RGBColor;
    color: RGBColor;
  }>({
    displayColorPicker: false,
    color: _color,
    initialColor: _color,
  });

  // update state when props.value is changed
  useEffect(() => {
    if (!isEqual(_color, state.color)) {
      setState({ ...state, color: _color, initialColor: _color });
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
    <div>
      <div className={styles.swatch} onClick={handleClick} tabIndex={1}>
        <div className={styles.color} style={style} />
      </div>
      {state.displayColorPicker ? (
        <div className={styles.popover}>
          <div className={styles.cover} onClick={handleClose} />
          <div
            onMouseUp={(event: any) => {
              // event.stopPropagation();
              //event.cancelBubble = true;
            }}
            onMouseDown={(event: any) => {
              // event.stopPropagation();
              //event.cancelBubble = true;
            }}
          >
            <SketchPicker color={state.color} onChange={handleChange} />
          </div>
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
