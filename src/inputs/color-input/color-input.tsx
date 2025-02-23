import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { debounce, isEqual, throttle } from "lodash-es";
import cx from "classnames";
import { Button, FormGroup, Icon, Popover } from "@blueprintjs/core";
import { IColorInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";
import { RGBColor, SketchPicker } from "react-color";
import css from "./color-input.module.scss";
import BackgroundSVG from "./transparent-bg.svg?react";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { createInputLabel } from "../input-helpers";
import { hexToRGB } from "../../utils/utils";
import ColorPickerIcon from "../../assets/icons/color-picker-icon.svg?react";

export const ColorInputForm: React.FC<IColorInput & IUpdateInput> = (props) => {
  const {
    value,
    defaultValue,
    propertyName,
    displayName,
    helperText,
    onChange,
    onPreview,
    inputProps,
  } = props;

  const onPreviewRef = useRef(onPreview);
  onPreviewRef.current = onPreview;

  const debounceOnChange = useCallback(
    throttle((value: any) => onPreviewRef.current?.(value), 250),
    []
  );

  const colorFromProp = (value || defaultValue) as RGBColor;

  const [state, setState] = useState<{
    displayColorPicker: boolean;
    initialColor?: RGBColor;
    color?: RGBColor;
  }>({
    displayColorPicker: false,
    color: colorFromProp,
    initialColor: colorFromProp,
  });

  const handleClickOutside = () => {
    handleClose();
  };
  const colorPickerHolderRef = useRef(null);
  useOnClickOutside(colorPickerHolderRef, handleClickOutside);

  // update state when props.value is changed
  useEffect(() => {
    if (
      !state.displayColorPicker &&
      !isEqual(colorFromProp, state.initialColor)
    ) {
      setState({ ...state, initialColor: colorFromProp });
    }
  }, [colorFromProp, state]);

  const handleClick = () => {
    setState({
      color: colorFromProp,
      initialColor: colorFromProp,
      displayColorPicker: !state.displayColorPicker,
    });
  };

  const handleClose = () => {
    setState({
      color: state.initialColor,
      initialColor: state.initialColor,
      displayColorPicker: false,
    });
    onPreview?.(state.initialColor);
  };

  const handleApply = () => {
    setState({ ...state, displayColorPicker: false });
    onChange(state.color);
  };

  const handleChange = (color: { rgb: RGBColor }) => {
    setState({ ...state, color: color.rgb });
    debounceOnChange?.(color.rgb);
  };

  const { initialColor, color } = state;
  const style = {
    background: initialColor
      ? `rgba(${initialColor.r}, ${initialColor.g}, ${initialColor.b}, ${initialColor.a})`
      : "transparent",
  };

  const styleCurrent = {
    background: color
      ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
      : "transparent",
  };

  useEventListener("keydown", (event: any) => {
    if (event.keyCode === 27) {
      // ESC
      setState({
        ...state,
        color: state.initialColor,
        displayColorPicker: false,
      });
    } else if (event.keyCode === 13) {
      // ENTER
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
        isOpen={state.displayColorPicker}
        portalClassName="color-picker-popover"
        minimal
        content={
          <div
            className={cx("color-picker-holder", css.popoverContent)}
            ref={colorPickerHolderRef}
          >
            <section>
              <div>
                <SketchPicker color={state.color} onChange={handleChange} />
              </div>
              <div className={css.actionHolder}>
                <div className={css.buttonHolder}>
                  <Button
                    className={cx(css.colorButton)}
                    //  icon="tick"
                    onClick={handleApply}
                    icon={
                      <div
                        id="color-input"
                        className={cx(css.swatch, css.squareSwatch)}
                        tabIndex={1}
                      >
                        <BackgroundSVG style={{ position: "absolute" }} />
                        <div className={css.color} style={styleCurrent} />
                      </div>
                    }
                  >
                    Apply
                  </Button>
                  <Button
                    icon={
                      <div
                        id="color-input"
                        className={cx(css.swatch, css.squareSwatch)}
                        tabIndex={1}
                      >
                        <BackgroundSVG style={{ position: "absolute" }} />
                        <div className={css.color} style={style} />
                      </div>
                    }
                    className={css.colorButton}
                    onClick={handleClose}
                    intent="none"
                    minimal
                  >
                    Cancel
                  </Button>
                </div>

                <Button
                  className={cx(css.colorButton)}
                  //  icon="tick"
                  minimal
                  onClick={() => {
                    onChange(undefined);
                    setState({
                      color: undefined,
                      initialColor: undefined,
                      displayColorPicker: false,
                    });
                  }}
                  icon={<Icon size={20} icon="disable" intent="danger" />}
                />

                <Button
                  icon={<ColorPickerIcon style={{ width: "20px" }} />}
                  minimal
                  onClick={() => {
                    if (!EyeDropperClass) {
                      return;
                    }

                    const eyeDropper = new EyeDropperClass();

                    eyeDropper
                      .open()
                      .then((result: any) => {
                        handleChange({ rgb: hexToRGB(result.sRGBHex) });
                      })
                      .catch((_e: any) => {});
                  }}
                />
              </div>
            </section>
          </div>
        }
      >
        <div
          id="color-input"
          className={cx({
            [css.swatch]: true,
            [inputProps?.swatchClassName!]: true,
          })}
          onClick={handleClick}
          tabIndex={1}
        >
          {color ? (
            <>
              <BackgroundSVG style={{ position: "absolute" }} />
              <div className={css.color} style={style} />
            </>
          ) : (
            <Icon
              size={18}
              icon="disable"
              intent="danger"
              className={css.noColor}
            />
          )}
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
