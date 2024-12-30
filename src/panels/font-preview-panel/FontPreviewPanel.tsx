import { Button, Card, Elevation, Icon, Spinner } from "@blueprintjs/core";
import React, { useEffect, useMemo, useRef, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./FontPreviewPanel.module.scss";
import {
  addNewObject,
  setExternalFontLoaded,
} from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";

import { load } from "webfontloader";
import { getGlobals } from "../../globals";
import { TEXT } from "../../objects/text/text";

import FontsPreview from "../../utils/fonts2/google-font-image.png";
import { getTextField } from "../../inputs/input-utils";

import { Virtuoso } from "react-virtuoso";
import { settings } from "../../store/reducers/settings";

enum FontSections {
  SystemFonts = "system-fonts",
  GoogleFonts = "google-fonts",
}

interface IFontPreview {
  fontFamily: string;
  source: "system-fonts" | "google-fonts" | string;
}

interface IFontPreviewPanelProps {
  onRequestClose: () => void;
  editObjectId?: string;
}

export type IFontPreviewPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IFontPreviewPanelProps;

const FontPreviewPanel: React.FC<IFontPreviewPanelMergedProps> = (props) => {
  const {
    onRequestClose,
    // documentSize,
    editObjectId,
    activeLayerId,
    loadedFontFamilies,
    _addNewObject,
    _setExternalFontLoaded,
    themeClass,
  } = props;

  //const inputRef = useRef<HTMLInputElement>(null);

  // useEffect(() => {
  //   console.log(inputRef.current);
  //   inputRef.current?.focus?.();
  // }, [inputRef.current]);

  const [selectedFontObj, setSelectedFont] = useState<{
    font: IFontPreview;
    add?: boolean;
  } | null>(null);
  const [previewFont, setPreviewFont] = useState<IFontPreview | null>(null);
  const [loadingFont, setLoadingFont] = useState<string | null>(null);
  const [preview, setPreview] = useState<boolean>(false);

  const [visibleSectionIds, setVisibleSectionIds] = useState<{
    [key: string]: boolean;
  }>({
    [FontSections.GoogleFonts]: true,
    [FontSections.SystemFonts]: false,
  });

  const toggleSection = (section: string) => {
    setVisibleSectionIds({
      ...visibleSectionIds,
      [section]: !visibleSectionIds[section],
    });
  };

  const addObjectToStage = (selectedFont: IFontPreview) => {
    if (activeLayerId && selectedFont) {
      _addNewObject(
        activeLayerId,
        TEXT,
        {
          left: 100, // documentSize.width / 4,
          top: 0, // documentSize.height / 4,
          width: 200, //documentSize.width / 2,
          height: 50, //documentSize.height / 2,
        },
        {
          font: {
            fontFamily: selectedFont.fontFamily,
            source: selectedFont.source,
          }!,
          autoHeight: true,
          initialAutoWidth: true,
          //fontSize: previewSize.size.toString() + "px",
          fontSize: "20px",
          text: "Sample text",
        }
      );
      onRequestClose();
    }
  };

  useEffect(() => {
    if (!selectedFontObj) return;

    const selectedFont = selectedFontObj.font;
    if (
      loadedFontFamilies &&
      selectedFont?.fontFamily &&
      loadedFontFamilies.indexOf(selectedFont?.fontFamily) !== -1
    ) {
      setPreviewFont(selectedFont);
      if (selectedFontObj?.add) addObjectToStage(selectedFont);
      return;
    }

    if (!selectedFont) return;

    setLoadingFont(selectedFont.fontFamily);
    // NOTE: if font is system or already loaded do not load
    if (
      selectedFont.source === "system-fonts" ||
      loadedFontFamilies.indexOf(selectedFont?.fontFamily) !== -1
    ) {
      setPreviewFont(selectedFont);
      return;
    }

    // load font closure
    function loadFont(_selectedFont: IFontPreview) {
      load({
        google: {
          families: [_selectedFont?.fontFamily],
        },
        classes: false,
        fontloading: (familyName: string, fvd: string) => {},
        fontactive: (familyName: string, fvd: string) => {
          setPreviewFont(_selectedFont);
          _setExternalFontLoaded(_selectedFont.fontFamily);

          setLoadingFont(null);

          if (selectedFontObj?.add) addObjectToStage(_selectedFont);
        },
      });
    }

    loadFont({ ...selectedFont });
  }, [selectedFontObj]);

  const [googleFonts, setGoogleFonts] = useState<IFontPreview[]>([]);
  const [visibleFontsInx, setVisibleFontsIdx] = useState<boolean[]>([]);
  const [searchString, setSearchString] = useState<string>("");

  useEffect(() => {
    const gFonts: IFontPreview[] = getGlobals()
      .getFonts()
      .filter((font) => font.source === "google-fonts")
      .sort();
    setGoogleFonts(gFonts);
    setVisibleFontsIdx(gFonts.map(() => true));
  }, []);

  const filterFonts = (userStr: string) => {
    const str = userStr.trim().toLowerCase();

    setSearchString(str);
    const visIdx = googleFonts.map((gFont) => {
      if (str === "" || gFont.fontFamily.toLowerCase().startsWith(str)) {
        return true;
      }
      return false;
    });
    setVisibleFontsIdx(visIdx);
  };

  const systemFonts: IFontPreview[] = getGlobals()
    .getFonts()
    .filter((font) => font.source === "system-fonts")
    .sort();

  const previewSizes = [
    { size: 45 },
    { size: 40 },
    { size: 35 },
    { size: 30 },
    { size: 25 },
    { size: 20 },
    { size: 15 },
    { size: 10 },
  ];

  const filteredFonts = useMemo(
    () =>
      googleFonts
        .map((item, idx) => ({ ...item, idx: idx }))
        .filter((font, idx) => {
          return visibleFontsInx[idx];
        }),
    [googleFonts, visibleFontsInx]
  );

  const renderFont = (font: IFontPreview & { idx: number }) => {
    return (
      <div
        key={font.fontFamily}
        style={{
          backgroundPositionY: -28 * font.idx + "px",
        }}
        className={cx(
          css.fontListItem,
          css.googleFontsItem,
          {
            [css.active]: font.fontFamily === selectedFontObj?.font.fontFamily,
          },
          css.fontsSprite
        )}
        onClick={() => {
          setSelectedFont({ font, add: true });
        }}
        // onClick={() => {

        // }}
      >
        {/* {font.fontFamily} */}{" "}
        {/* {loadedFontFamilies &&
      loadedFontFamilies.indexOf(font.fontFamily) !== -1 ? (
        <Icon icon="tick" />
      ) : null} */}
        <Icon
          className={css.previewFontBtn}
          icon="play"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFont({ font });
            setPreview(true);
          }}
        ></Icon>
        {loadingFont === font.fontFamily ? <Spinner size={16} /> : null}
      </div>
    );
  };
  return (
    <div className={cx(themeClass, css.fontPreviewPanel)}>
      <div className={css.fontList}>
        <section
          className={cx({
            [css.open]: visibleSectionIds[FontSections.GoogleFonts],
          })}
        >
          <div
            className={css.sectionHeader}
            onClick={() => toggleSection(FontSections.GoogleFonts)}
          >
            <Button
              minimal
              small={true}
              icon={
                visibleSectionIds[FontSections.GoogleFonts]
                  ? "caret-down"
                  : "caret-right"
              }
            ></Button>
            Google fonts
          </div>
          <div className={css.searchFontHolder}>
            {getTextField("", searchString, filterFonts, "", {
              placeholder: "Find google fonts",
              autoFocus: true,
            })}
          </div>
          {visibleSectionIds[FontSections.GoogleFonts] && (
            <div className={css.panel}>
              {/* <img src={FontsPreview} /> */}
              <div
                key={searchString}
                style={{
                  overflow: "visible",
                  top: "0px",
                  display: "flex",
                  flexGrow: "1",
                }}
              >
                <Virtuoso
                  data={filteredFonts}
                  style={{ flexGrow: "1", overflowX: "hidden" }}
                  //totalCount={200}
                  itemContent={(
                    index: number,
                    font: IFontPreview & { idx: number }
                  ) => renderFont(font)}
                />
                {googleFonts.map((font, idx) => {
                  if (!visibleFontsInx[idx]) return null;
                })}
              </div>
            </div>
          )}
        </section>

        <section
          className={cx({
            [css.open]: visibleSectionIds[FontSections.SystemFonts],
          })}
        >
          <div
            className={css.sectionHeader}
            onClick={() => toggleSection(FontSections.SystemFonts)}
          >
            <Button
              minimal
              small={true}
              icon={
                visibleSectionIds[FontSections.SystemFonts]
                  ? "caret-down"
                  : "caret-right"
              }
            ></Button>
            System Fonts
          </div>
          {visibleSectionIds[FontSections.SystemFonts] && (
            <div className={css.panel}>
              {systemFonts.map((font) => (
                <div
                  key={font.fontFamily}
                  className={cx(css.fontListItem, {
                    [css.active]:
                      font.fontFamily === selectedFontObj?.font.fontFamily,
                  })}
                  onClick={() => {
                    setSelectedFont({ font, add: true });
                  }}
                >
                  {font.fontFamily}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      {preview && (
        <div className={css.fontPreview}>
          {previewSizes.map((previewSize) => (
            <Card
              interactive={false}
              elevation={Elevation.TWO}
              className={cx(css.card)}
              onClick={() => {
                if (activeLayerId) {
                  _addNewObject(
                    activeLayerId,
                    TEXT,
                    {
                      left: 0, //documentSize.width / 4,
                      top: 0, //documentSize.height / 4,
                      width: 200, //documentSize.width / 2,
                      height: 50, //documentSize.height / 2,
                    },
                    {
                      font: previewFont!,
                      autoHeight: true,
                      initialAutoWidth: true,
                      fontSize: previewSize.size.toString() + "px",
                      text: "Sample text",
                    }
                  );
                  onRequestClose();
                }
              }}
            >
              <p
                style={{
                  fontSize: `${previewSize.size}px`,
                  fontFamily: previewFont?.fontFamily,
                }}
              >
                Preview text
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  activeLayerId: state.project.selection.activeLayerId,
  loadedFontFamilies: state.fonts.loadedFontFamilies,
  // documentSize: state.project.document.documentSize,
  themeClass: state.project.settings.themeClass,
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
};

export default connect(mapStateToProps, mapDispatchToProps)(FontPreviewPanel);
