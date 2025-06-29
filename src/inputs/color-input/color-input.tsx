import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { debounce, isEqual, noop, throttle } from "lodash-es";
import cx from "classnames";
import {
  Button,
  FormGroup,
  Icon,
  Popover,
  Tab,
  Tabs,
  TabsExpander,
} from "@blueprintjs/core";
import { IColorInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";
import { RGBColor } from "react-color";
import ColorPicker from "react-pick-color";
import css from "./color-input.module.scss";
import BackgroundSVG from "./transparent-bg.svg?react";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { createInputLabel } from "../input-helpers";
import { hexToRGB } from "../../utils/utils";
import ColorPickerIcon from "../../assets/icons/color-picker-icon.svg?react";
import CoulorPalette from "../../assets/icons/colour-palette.svg?react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import { addRecentColor, collectColors } from "../../store/actions/actions";
import ColorPaletteIcon from "./assets/color-palette.svg?react";
import { CustomColorPicker } from "./custom-color-picker";
import { ColorPaletteRow } from "./color-palette-row";
import ColorPanel from "../../panels/color-panel/ColorPanel";

enum ColorsPopupSection {
  RecentColors = "Recent Colors",
  UsedInDocument = "Used In Document",
  DefaultColors = "Default Colors",
  BaseColors = "Base colors",
}

type IColorInputForm = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IColorInput &
  IUpdateInput;

const ColorInputForm: React.FC<IColorInputForm> = (props) => {
  const {
    value,
    defaultValue,
    propertyName,
    displayName,
    helperText,
    onChange,
    onPreview,
    inputProps,
    _addRecentColor,
    recentColors,
    _collectColors,
    usedInDocument,
  } = props;

  const onPreviewRef = useRef(onPreview);
  onPreviewRef.current = onPreview;

  const colorFromProp = value as RGBColor | undefined;

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
    // handleClose();
    setOpen(false);
  };
  const colorPickerHolderRef = useRef<HTMLElement>(null);
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

  // const handleClose = () => {
  //   setState({
  //     color: state.initialColor,
  //     initialColor: state.initialColor,
  //     displayColorPicker: false,
  //   });
  //   onPreview?.(state.initialColor);
  // };

  const { initialColor, color } = state;

  const style = {
    background: initialColor
      ? `rgba(${initialColor.r}, ${initialColor.g}, ${initialColor.b}, ${initialColor.a})`
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

  const [open, setOpen] = useState(false);

  console.log("value C");
  console.log(value);

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
          <div ref={colorPickerHolderRef} className="QWEQWE">
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
        {/* </Popover> */}
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

const mapStateToProps = (state: IStore) => ({
  recentColors: state.project.colors.recentColors,
  usedInDocument: state.project.colors.usedInDocument,
});

const mapDispatchToProps = {
  _addRecentColor: (color: RGBColor) => addRecentColor(color),
  _collectColors: () => collectColors(),
};

export default connect(mapStateToProps, mapDispatchToProps)(ColorInputForm);
