import React, {
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { isEqual } from "lodash-es";
import cx from "classnames";
import {
  FormGroup,
  Icon,
} from "@blueprintjs/core";
import { IColorInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";
import { RGBColor } from "react-color";
import css from "./color-input.module.scss";
import BackgroundSVG from "./transparent-bg.svg?react";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { createInputLabel } from "../input-helpers";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import { addRecentColor, collectColors } from "../../store/actions/actions";
import ColorPanel from "../../panels/color-panel/ColorPanel";

type IColorInputForm = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IColorInput &
  IUpdateInput;

const ColorInputForm: React.FC<IColorInputForm> = (props) => {
  const {
    value,
    propertyName,
    displayName,
    helperText,
    onChange,
    onPreview,
    inputProps,
    _addRecentColor,
    _collectColors,
  } = props;

  const onPreviewRef = useRef(onPreview);
  onPreviewRef.current = onPreview;

  const colorFromProp = value as RGBColor | undefined;

  const [state, setState] = useState<{
    initialColor?: RGBColor;
    color?: RGBColor;
  }>({
    color: colorFromProp,
    initialColor: colorFromProp,
  });

  const handleClickOutside = () => {
    setOpen(false);
  };
  const colorPickerHolderRef = useRef<HTMLElement>(null);
  useOnClickOutside(colorPickerHolderRef, handleClickOutside, [
    "opacity-popover",
    "color-picker",
    "bp5-popover-content",
  ]);

  // update state when props.value is changed
  useEffect(() => {
    if (!isEqual(colorFromProp, state.initialColor)) {
      setState({ ...state, initialColor: colorFromProp });
    }
  }, [colorFromProp, state]);

  const { initialColor, color } = state;

  const style = {
    background: initialColor
      ? `rgba(${initialColor.r}, ${initialColor.g}, ${initialColor.b}, ${initialColor.a})`
      : "transparent",
  };

  useEventListener("keydown", (event: any) => {
    if (event.keyCode === 27) {
      setState({ ...state, color: state.initialColor });
    }
  });

  const [open, setOpen] = useState(false);

  return (
    <>
      <FormGroup
        className={cx(css.colorInput, inputProps?.className)}
        label={createInputLabel(displayName, propertyName)}
        labelFor="color-input"
        inline
        helperText={!!helperText && helperText}
      >
        <div
          id="color-input"
          className={cx({
            [css.swatch]: true,
            [inputProps?.swatchClassName!]: true,
          })}
          onClick={() => setOpen(true)}
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
        {open && (
          <div ref={colorPickerHolderRef as unknown as React.RefObject<HTMLDivElement>} className="color-picker">
            <ColorPanel
              onRequestClose={() => {
                _collectColors();

                if (state.color) {
                  _addRecentColor(state.color);
                }
                setOpen(false);
              }}
              color={value}
              onColorChange={(newColor) => {
                const newState = { ...state, color: newColor };
                setState(newState);
                onChange(newState.color);
              }}
              onColorPreview={(newColor) => {
                const newState = { ...state, color: newColor };
                setState(newState);
                onPreview?.(newState.color);
              }}
            />
          </div>
        )}
      </FormGroup>
    </>
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

const mapStateToProps = (_state: IStore) => ({});

const mapDispatchToProps = {
  _addRecentColor: (color: RGBColor) => addRecentColor(color),
  _collectColors: () => collectColors(),
};

export default connect(mapStateToProps, mapDispatchToProps)(ColorInputForm);
