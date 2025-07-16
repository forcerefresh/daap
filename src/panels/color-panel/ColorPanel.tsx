import {
  Button,
  Card,
  Divider,
  Elevation,
  Icon,
  Label,
  Popover,
  PopoverInteractionKind,
  Position,
  Spinner,
} from "@blueprintjs/core";
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./ColorPanel.module.scss";
import {
  addNewObject,
  addRecentColor,
  collectColors,
  colorFromImages,
  setExternalFontLoaded,
  updateBrandColors,
  updateColorsState,
} from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";

import { load } from "webfontloader";
import { getGlobals } from "../../globals";
import { TEXT, TextType } from "../../objects/text/text";

import FontsPreview from "../../utils/fonts2/google-font-image.png";
import { getTextField } from "../../inputs/input-utils";
import { OpacityInputForm } from "../../inputs/opacity-input/opacity-input";

import { ColorButton } from "../../inputs/color-input/color-button";
import { ColorSplitButton } from "../../inputs/color-input/color-split-button";

import { rgbaToHex } from "../../inputs/color-input/color-utils";
import { Virtuoso } from "react-virtuoso";
import { settings } from "../../store/reducers/settings";
import { IntegrationContext } from "../../integration";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";
import { addStyle } from "../../utils/doom-utils/css-utils";
import { cloneDeep, debounce, isArray, isEqual, noop, omit } from "lodash-es";
import { getMediaSrc } from "../../integration/utils/local-media";
import { convertRGBColor2RGBAString } from "webslider-sdk/lib/utils/utils";

import moreColors from "./colors.json";
import baseColors from "./base-colors.json";

import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";
import { hexToRGB } from "../../utils/utils";

import colorNames from "./color-names.json";
import colorPalettes from "./color-palettes.json";

import { IColors, ImageColors } from "../../store/reducers/i-colors";
import { processImagesColors } from "./color-utils";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { ColorButtonWithTooltip } from "../../inputs/color-input/color-button-with-tooltip";
import { ColorSplitButtonWithTooltip } from "../../inputs/color-input/color-split-button-with-tooltip";
import { ColorPanelSection } from "./color-panel-section/color-panel-section";
import { getRelatedColors } from "./related-colors-utils";

enum FontSections {
  MyFonts = "my-fonts",
  SystemFonts = "system-fonts",
  GoogleFonts = "google-fonts",
}

interface IFontPreview {
  fontFamily: string;
  source: "system-fonts" | "google-fonts" | "my-fonts";
  mediaId?: string; // TODO: make union
  fontUrl?: string; // TODO: make union
}

interface IColorPanelProps {
  onRequestClose: () => void;
  editObjectId?: string;
  color: RGBColor | null;
  onColorChange: (color: RGBColor | undefined) => void;
  onColorPreview: (color: RGBColor) => void;
}

export type IColorPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IColorPanelProps;

const ColorPanel = (props: IColorPanelMergedProps) => {
  const {
    onRequestClose,
    // documentSize,
    editObjectId,
    activeLayerId,
    loadedFontFamilies,
    _addNewObject,
    _setExternalFontLoaded,
    themeClass,
    usedInDocument,
    color,
    onColorChange,
    onColorPreview,
    recentColors,
    imagesColors,
    _addRecentColor,
    objectById,
    _colorsFromImages,
    _collectColors,
    documentColorPalettes,
    _updateBrandColors,
  } = props;

  const initialColorRef = useRef(omit(color, "a"));

  const colorWithoutOpacity = color ? omit(color, "a") : color;
  const [currentColor, setCurrentColor] = useState(color);
  const [currentOpacity, setCurrentOpacity] = useState(color?.a ?? 1);

  const [colorHex, setColorHex] = useState(rgbaToHex(colorWithoutOpacity));

  const setCurrentColorHex = (color: string) => {
    setColorHex(color);

    const colorObj = colorNames.find(
      (colorName) => colorName.name === color.toString().toLowerCase()
    );

    if (colorObj) {
      handleColorChange(hexToRGB(colorObj.color)!);
      return;
    }

    const rgba = hexToRGB(color);
    if (rgba) {
      if (!isNaN(rgba.r) && !isNaN(rgba.g) && !isNaN(rgba.b)) {
        handleColorChange(rgba);
      }
    }
  };

  // create used in doc colors
  const colorsFromObjects = usedInDocument.slice(-20).reverse();
  const rowsColorsFromObj = [
    colorsFromObjects.slice(0, 6),
    colorsFromObjects.slice(6, 12),
  ];

  // recent colors
  const lastColors = useMemo(() => recentColors.slice(-20).reverse(), []);
  const rowsRecentColors = [lastColors.slice(0, 6), lastColors.slice(6, 12)];

  const handleColorChange = (color: RGBColor | undefined) => {
    if (!color) {
      onColorChange(undefined);
      setCurrentColor(null);
      setColorHex("");
      return;
    }

    const newColorState = { ...color, a: currentOpacity };
    onColorChange(newColorState);
    setCurrentColor(newColorState);
    setColorHex(rgbaToHex(omit(newColorState, "a"))!);
  };

  const handleOpacityChange = (opacity: number) => {
    if (currentColor) {
      const newColorState = { ...currentColor, a: opacity / 100 };
      onColorChange(newColorState);
      setCurrentColor(newColorState);
    }
  };

  const handleOpacityPreview = (opacity: number) => {
    if (currentColor) {
      const newColorState = { ...currentColor, a: opacity / 100 };
      onColorPreview(newColorState);
      setCurrentColor(newColorState);
    }
  };

  useEffect(() => {
    return () => {
      if (currentColor) {
        const curFullColor = {
          ...currentColor,
          ...(typeof currentOpacity !== "undefined"
            ? { a: currentOpacity }
            : {}),
        };
        // if (!lastColors.find((color) => isEqual(color, curFullColor))) {
        console.log("UPDATEEEE");
        console.log(curFullColor);
        _addRecentColor(curFullColor);
        // }
      }
    };
  }, [currentColor]);

  const processingImageColorsRef = useRef(false);

  useEffect(() => {
    if (processingImageColorsRef.current === true) return;

    processingImageColorsRef.current = true;

    // ----
    let newImagesColors: ImageColors[] = [];
    Object.values(objectById).forEach((obj: IObject) => {
      if (obj.type === "io.forcerefresh.image.object") {
        newImagesColors.push({ objectId: obj.id, colors: null });
      }
    });
    // ----
    processImagesColors({ imagesColors: newImagesColors, objectById }).then(
      (newImageColors) => {
        if (newImageColors) {
          //update
          _colorsFromImages(newImageColors);
        }
        processingImageColorsRef.current = false;
      }
    );
  }, [imagesColors]);

  useEffect(() => {
    _collectColors();
  }, []);

  const addToBrand = (rgbColor: RGBColor) => {
    const addColor = omit(rgbColor, "a");

    const arr = documentColorPalettes[0] ?? {
      name: "Brand colors",
      colors: [],
    };

    const exist = arr.colors.find((c) => isEqual(addColor, c));

    if (exist) {
      AppToaster.show({
        intent: "warning",
        message: `Color ${rgbaToHex(
          addColor
        )} already exists in the brand palette.`,
      });
      return;
    }

    arr.colors.push(addColor!);
    _updateBrandColors([arr]);

    AppToaster.show({
      intent: "success",
      message: `Color ${rgbaToHex(addColor)} has been added to brand colors`,
    });
  };

  const colorPalettesRender = useMemo(() => {
    return (
      <>
        <h3 style={{ marginBottom: "10px" }}>Color palettes</h3>
        {colorPalettes.palettes.map((palette) => {
          return (
            <ColorPanelSection
              title={palette.name}
              colors={[palette.colors]}
              onAddToBrand={addToBrand}
              onColorSelect={handleColorChange}
              // info={`related to ${rgbaToHex(currentColor)}`}
            />
          );
        })}
      </>
    );
  }, []);

  const generateBtn = useMemo(() => {});

  const [refreshColorScheme, setRefreshColorScheme] = useState(1);

  const colorSchemeRenderTitle = useMemo(() => {
    const schemes = getRelatedColors(initialColorRef.current!);

    return (
      <>
        {schemes.length ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ marginBottom: "10px" }}>Color schemes</h3>
              <div>
                {!isEqual(
                  omit(currentColor, "a"),
                  omit(initialColorRef.current, "a")
                ) && (
                  <Button
                    onClick={() => {
                      initialColorRef.current = omit(currentColor, "a");
                      setRefreshColorScheme(refreshColorScheme + 1);
                    }}
                  >
                    Generate for current color
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : null}
      </>
    );
  }, [initialColorRef, refreshColorScheme, currentColor]);

  const colorSchemeRender = useMemo(() => {
    const schemes = getRelatedColors(initialColorRef.current!);

    return (
      <>
        {schemes.length ? (
          <>
            {schemes.map((related) => {
              return (
                <ColorPanelSection
                  title={related.title}
                  colors={related.colors}
                  onAddToBrand={addToBrand}
                  onColorSelect={handleColorChange}
                  info={`related to ${rgbaToHex(initialColorRef.current)}`}
                />
              );
            })}
          </>
        ) : null}
      </>
    );
  }, [initialColorRef, refreshColorScheme]);

  return (
    <div className={cx(themeClass, css.colorPanel)}>
      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
        <Button icon="cross" minimal onClick={onRequestClose} />
      </div>
      <div>
        <section
          className={css.section}
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            gap: "10px",
          }}
        >
          <ColorSplitButtonWithTooltip
            color={currentColor}
            onColorChange={(color: RGBColor) => {
              setColorHex(rgbaToHex(color));
              setCurrentColor(color);
              onColorChange(color);
            }}
            onColorPreview={(color: RGBColor) => {
              // setColorHex(rgbaToHex(color));
              // setCurrentColor(color);
              onColorPreview(color);
            }}
            onAddToBrand={() => addToBrand(currentColor)}
          />

          <Button onClick={noop} minimal>
            <Icon
              icon="disable"
              intent="danger"
              onClick={() => handleColorChange(undefined)}
            />
          </Button>

          <OpacityInputForm
            value={currentOpacity * 100}
            onChange={(opacity: number) => handleOpacityChange(opacity)}
            onPreview={(opacity: number) => handleOpacityPreview(opacity)}
          />

          <div className={cx(css.currentColorHolder)}>
            {getTextField("", colorHex ?? undefined, setCurrentColorHex, "", {
              placeholder: "Enter color",
              autoFocus: true,
            })}
          </div>

          {/* <Popover
            content={<ColorsMoreMenu />}
            placement="bottom-end"
            // tslint:disable-next-line jsx-no-lambda
            renderTarget={({ isOpen, ...p }) => (
              <Button
                minimal
                // style={{ color: "rgb(110 240 239)" }}
                // className={cx(css.button, css.squareButton)}
                icon={
                  <Icon
                    icon={"more"}
                    // style={{ marginRight: "5px", color: "rgb(110 240 239)" }}
                  />
                }
              ></Button>
            )}
          /> */}
        </section>

        <section className={css.section}>
          <div className={css.sectionHeader}>Used in document</div>

          <div className={css.sectionContent}>
            {colorsFromObjects.length === 0 ? (
              <div className={css.sectionNoColor}>
                Your document has no colors yet.
              </div>
            ) : (
              rowsColorsFromObj.map((row, rowIndex) => {
                if (row.length === 0) return null;
                return (
                  <div key={rowIndex} className={css.sectionColorRow}>
                    {row.map((color, index) => {
                      return (
                        <ColorButtonWithTooltip
                          color={color}
                          onClick={() => handleColorChange(color)}
                          onAddToBrand={() => addToBrand(color)}
                        />
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {documentColorPalettes.length > 0 &&
        documentColorPalettes[0].colors?.length > 0 ? (
          <section className={css.section}>
            <div className={css.sectionHeader}>Brand colors</div>

            <div className={css.sectionContent}>
              <div>
                {documentColorPalettes.map((row, rowIndex) => (
                  <div key={rowIndex} className={css.sectionColorRow}>
                    {row.colors.map((color, index) => {
                      return (
                        <ColorButtonWithTooltip
                          color={color}
                          onClick={() => handleColorChange(color)}
                          onDelete={() => {
                            const newDocumentColorPalettes = cloneDeep(
                              documentColorPalettes
                            );
                            const newColors =
                              newDocumentColorPalettes[0].colors?.filter(
                                (col) => {
                                  console.log(col);
                                  console.log(color);

                                  return !isEqual(color, col);
                                }
                              );
                            newDocumentColorPalettes[0].colors = newColors;
                            _updateBrandColors(newDocumentColorPalettes);
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <ColorPanelSection
          title="Recently used colors"
          colors={rowsRecentColors}
          onAddToBrand={addToBrand}
          onColorSelect={handleColorChange}
        />

        {imagesColors.length > 0 && (
          <section className={css.section}>
            <div className={css.sectionHeader}>Colors from photos</div>

            <div className={css.sectionContent}>
              {imagesColors.map((row, rowIndex) => (
                <div key={rowIndex} className={css.sectionColorRow}>
                  {row.colors?.map((color, index) => {
                    return (
                      <ColorButtonWithTooltip
                        color={color}
                        onClick={() => handleColorChange(color)}
                        onAddToBrand={() => addToBrand(color)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className={css.section}>
          <div className={css.sectionHeader}>Base colors</div>

          <div className={css.sectionContent}>
            <div className={css.sectionColorRow}>
              {baseColors.colors.map((hexColor, index) => {
                const baseColorRgb = hexToRGB(hexColor);
                return (
                  <ColorButtonWithTooltip
                    key={"base-color-" + hexColor}
                    color={baseColorRgb}
                    onClick={() => handleColorChange(baseColorRgb)}
                    onAddToBrand={() => addToBrand(baseColorRgb)}
                  />
                );
              })}
            </div>
          </div>
        </section>

        <section className={css.section}>
          <div className={css.sectionHeader}>More colors</div>

          <div className={css.sectionContent}>
            {moreColors.map((row, rowIndex) => (
              <div key={rowIndex} className={css.sectionColorRow}>
                {[...row.colors].reverse().map((color, index) => {
                  return (
                    <ColorButtonWithTooltip
                      color={color}
                      onClick={() => handleColorChange(color)}
                      onAddToBrand={() => addToBrand(color)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {colorSchemeRenderTitle}
        {colorSchemeRender}

        {colorPalettesRender}

        <div style={{ height: "20px" }}></div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  activeLayerId: state.project.selection.activeLayerId,
  loadedFontFamilies: state.fonts.loadedFontFamilies,
  // documentSize: state.project.document.documentSize,
  themeClass: state.project.settings.themeClass,
  usedInDocument: state.project.colors.usedInDocument,
  documentColorPalettes: state.project.colors.documentColorPalettes,
  recentColors: state.project.colors.recentColors,
  imagesColors: state.project.colors.imagesColors,
  objectById: state.project.objects.objectById,
});

const mapDispatchToProps = {
  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>,
    values: { [key: string]: any }
  ) => addNewObject(layerId, type, objectProps, values),
  _setExternalFontLoaded: (fontFamilyName: string) =>
    setExternalFontLoaded(fontFamilyName),
  _addRecentColor: (color: RGBColor) => addRecentColor(color),
  _colorsFromImages: (imagesColors: ImageColors[]) =>
    colorFromImages(imagesColors),
  _collectColors: () => collectColors(),
  _updateBrandColors: (
    brandColors: {
      name: string;
      colors: RGBColor[];
    }[]
  ) => updateBrandColors(brandColors),
};

export default connect(mapStateToProps, mapDispatchToProps)(ColorPanel);
