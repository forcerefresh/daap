import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { debounce, isEqual, throttle } from "lodash-es";
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

  const [visibleColorsPopup, setVisibleColorsPopup] = useState<{
    [key: string]: boolean;
  }>({
    [ColorsPopupSection.RecentColors]: true,
    [ColorsPopupSection.UsedInDocument]: true,
  });

  const toggleSection = (section: string) => {
    setVisibleColorsPopup({
      ...visibleColorsPopup,
      [section]: !visibleColorsPopup[section],
    });
  };

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
    _collectColors();
    if (state.color) {
      _addRecentColor(state.color);
    }
  };

  const handleChange = (rgb: RGBColor) => {
    setState({ ...state, color: rgb });
    debounceOnChange?.(rgb);
    // _addRecentColor(rgb);
    // _collectColors();
  };

  const handlePaletteColor = (color: { rgb: RGBColor }) => {
    setState({ ...state, displayColorPicker: false, color: color.rgb });
    onChange(color.rgb);
    _addRecentColor(color.rgb);
    _collectColors();
  };

  // TODO - how sure how to handle this at the end
  // const handleUsedInDoc = (color: { rgb: RGBColor }) => {
  //   setState({ ...state, displayColorPicker: false, color: color.rgb });
  //   onChange(color.rgb);
  //   _addRecentColor(color.rgb);
  // };

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

  const lastColors = recentColors.slice(-20).reverse();
  const rowsRecentColors = [lastColors.slice(0, 6), lastColors.slice(6, 12)];

  const colorsFromObjects = usedInDocument.slice(-20).reverse();
  const rowsColorsFromObj = [
    colorsFromObjects.slice(0, 6),
    colorsFromObjects.slice(6, 12),
  ];

  return (
    <>
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
              <Tabs
                className={css.tabs}
                defaultSelectedTabId={"palette"}
                // renderActiveTabPanelOnly={true}
              >
                <Tab
                  className={css.tabContent}
                  style={{ marginTop: "0px" }}
                  icon={
                    <ColorPaletteIcon
                      style={{
                        width: "22px",
                        height: "22px",
                        padding: "2px",
                        marginRight: "3px",
                      }}
                    />
                  }
                  id="palette"
                  title={"Palette"}
                  panel={
                    <>
                      <section>
                        <div
                          className={css.sectionHeader}
                          onClick={() =>
                            toggleSection(ColorsPopupSection.RecentColors)
                          }
                        >
                          <Button
                            minimal
                            small={true}
                            icon={
                              visibleColorsPopup[
                                ColorsPopupSection.RecentColors
                              ]
                                ? "caret-down"
                                : "caret-right"
                            }
                          ></Button>
                          Recent colors
                        </div>
                        {visibleColorsPopup[
                          ColorsPopupSection.RecentColors
                        ] && (
                          <div className={css.sectionContent}>
                            {recentColors.length === 0 ? (
                              <div className={css.sectionNoColor}>
                                Your recent colors will appear here once added.
                              </div>
                            ) : (
                              rowsRecentColors.map((row, rowIndex) => (
                                <div
                                  key={rowIndex}
                                  className={css.sectionColorRow}
                                >
                                  {row.map((color, index) => {
                                    const colorStyle = {
                                      backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
                                    };

                                    return (
                                      <div
                                        key={index}
                                        className={css.sectionColor}
                                        style={colorStyle}
                                        onClick={() => {
                                          handlePaletteColor({ rgb: color });
                                        }}
                                      />
                                    );
                                  })}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </section>

                      <section className={css.section}>
                        <div
                          className={css.sectionHeader}
                          onClick={() =>
                            toggleSection(ColorsPopupSection.UsedInDocument)
                          }
                        >
                          <Button
                            minimal
                            small={true}
                            icon={
                              visibleColorsPopup[
                                ColorsPopupSection.UsedInDocument
                              ]
                                ? "caret-down"
                                : "caret-right"
                            }
                          ></Button>
                          Used in document
                        </div>
                        {visibleColorsPopup[
                          ColorsPopupSection.UsedInDocument
                        ] && (
                          <div className={css.sectionContent}>
                            {colorsFromObjects.length === 0 ? (
                              <div className={css.sectionNoColor}>
                                Your document has no colors yet.
                              </div>
                            ) : (
                              rowsColorsFromObj.map((row, rowIndex) => (
                                <div
                                  key={rowIndex}
                                  className={css.sectionColorRow}
                                >
                                  {row.map((color, index) => {
                                    const colorStyle = {
                                      backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
                                    };
                                    return (
                                      <div
                                        key={index}
                                        className={css.sectionColor}
                                        style={colorStyle}
                                        onClick={() =>
                                          handlePaletteColor({ rgb: color })
                                        }
                                      />
                                    );
                                  })}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </section>

                      <section className={css.section}>
                        <div
                          className={css.sectionHeader}
                          onClick={() =>
                            toggleSection(ColorsPopupSection.BaseColors)
                          }
                        >
                          <Button
                            minimal
                            small={true}
                            icon={
                              visibleColorsPopup[ColorsPopupSection.BaseColors]
                                ? "caret-down"
                                : "caret-right"
                            }
                          ></Button>
                          Base colors
                        </div>

                        <ColorPaletteRow
                          colors={[
                            "#FF0000",
                            "#00FF00",
                            "#0000FF",
                            "#FFFF00",
                            "#00FFFF",
                            "#FF00FF",
                            "#FFFFFF",
                            "#000000",
                          ]}
                          onSelect={(color) => {
                            handlePaletteColor({ rgb: color });
                          }}
                        />
                      </section>
                    </>
                  }
                />
                <Tab
                  style={{ marginTop: "0px" }}
                  id="picker"
                  icon={
                    <ColorPickerIcon
                      style={{
                        width: "22px",
                        height: "22px",
                        padding: "2px",
                        marginRight: "3px",
                      }}
                    />
                  }
                  title="Picker"
                  panel={
                    <>
                      <CustomColorPicker
                        color={state.color as Required<RGBColor>}
                        initialColor={state.initialColor as Required<RGBColor>}
                        onApply={handleApply}
                        onCancel={handleClose}
                        onChange={handleChange}
                      />
                    </>
                  }
                />
                <TabsExpander />
                <Button
                  // className={cx(css.colorButton)}
                  style={{ marginRight: "5px" }}
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
                  style={{ marginRight: "5px" }}
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
                        handleChange(hexToRGB(result.sRGBHex));
                      })
                      .catch((_e: any) => {});
                  }}
                />
              </Tabs>
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
