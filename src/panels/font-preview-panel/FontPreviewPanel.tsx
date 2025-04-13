import {
  Button,
  Card,
  Elevation,
  Icon,
  Label,
  Spinner,
} from "@blueprintjs/core";
import React, {
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
import css from "./FontPreviewPanel.module.scss";
import {
  addNewObject,
  setExternalFontLoaded,
} from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";

import { load } from "webfontloader";
import { getGlobals } from "../../globals";
import { TEXT, TextType } from "../../objects/text/text";

import FontsPreview from "../../utils/fonts2/google-font-image.png";
import { getTextField } from "../../inputs/input-utils";

import { Virtuoso } from "react-virtuoso";
import { settings } from "../../store/reducers/settings";
import { IntegrationContext } from "../../integration";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";
import { addStyle } from "../../utils/doom-utils/css-utils";
import { debounce, isArray } from "lodash-es";
import { getMediaSrc } from "../../integration/utils/local-media";

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

interface IFontPreviewPanelProps {
  onRequestClose: () => void;
  editObjectId?: string;
}

export type IFontPreviewPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IFontPreviewPanelProps;

const FontPreviewPanel = (props: IFontPreviewPanelMergedProps) => {
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

  const [myFonts, setMyFonts] = useState<SaaSMediaData[]>([]);

  const globalContext = useContext(IntegrationContext);

  const { fetchMedias } = globalContext.useMyMediaHook();

  const fetchData = useCallback(
    (searchString?: string) => {
      fetchMedias({
        type: "font",
        tags: [],
        from: 1,
        perPage: 200,
        search: searchString,
      }).then(
        (result) => {
          // TODO: response can be error, like AUTH.
          if (isArray(result.data)) {
            setMyFonts(result.data);
          }
        },

        (error) => {
          logger.app.error(error);
        }
      );
    },
    [fetchMedias]
  );

  useEffect(() => {
    fetchData();
  }, []);

  //const inputRef = useRef<HTMLInputElement>(null);

  // useEffect(() => {
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
    [FontSections.MyFonts]: true,
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
      const source = _selectedFont.source; //=== "google-fonts" ? "google" : "custom";

      if (source === "my-fonts") {
        // add css first
        // debugger;
        addStyle(`
          @font-face{
            font-family: "${_selectedFont.fontFamily}";
            src: url("${_selectedFont.fontUrl}");
          }
        `);
      }

      const loadSource = source === "my-fonts" ? "custom" : "google";

      if (loadSource === "custom") {
        setTimeout(() => {
          setPreviewFont(_selectedFont);
          _setExternalFontLoaded(_selectedFont.fontFamily);

          setLoadingFont(null);

          if (selectedFontObj?.add) addObjectToStage(_selectedFont);
        }, 200);
      } else {
        load({
          [loadSource]: {
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
    }

    loadFont({ ...selectedFont });
  }, [selectedFontObj]);

  const [googleFonts, setGoogleFonts] = useState<IFontPreview[]>([]);
  const [visibleFontsInx, setVisibleFontsIdx] = useState<boolean[]>([]);
  const [searchString, setSearchString] = useState<string>("");

  const debounceFetchData = debounce(
    (searchString?: string) => fetchData(searchString),
    200
  );

  useEffect(() => {
    debounceFetchData(searchString);
  }, [searchString]);

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

  // const systemFonts: IFontPreview[] = getGlobals()
  //   .getFonts()
  //   .filter((font) => font.source === "system-fonts")
  //   .sort();

  const previewSizes = [
    { previewText: "Heading XL", size: 49, textType: TextType.H1 },
    { previewText: "Heading L", size: 39, textType: TextType.H2 },
    { previewText: "Heading", size: 31, textType: TextType.H3 },
    { previewText: "Heading S", size: 25, textType: TextType.H4 },
    { previewText: "Heading XS", size: 20, textType: TextType.H5 },
    { previewText: "Body", size: 16, textType: TextType.Body },
    { previewText: "Caption", size: 13, textType: TextType.Caption },
    { previewText: "Tiny", size: 11, textType: TextType.Tiny },

    // { size: 40 },
    // { size: 35 },
    // { size: 30 },
    // { size: 25 },
    // { size: 20 },
    // { size: 15 },
    // { size: 10 },
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
        // onClick={() => {
        //   setSelectedFont({ font, add: true });
        // }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedFont({ font });
          setPreview(true);
        }}

        // onClick={() => {

        // }}
      >
        {/* {font.fontFamily} */}{" "}
        {/* {loadedFontFamilies &&
      loadedFontFamilies.indexOf(font.fontFamily) !== -1 ? (
        <Icon icon="tick" />
      ) : null} */}
        {/* <Button
          small
          minimal
          outlined
          rightIcon={"play"}
          className={css.previewFontBtn}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFont({ font });
            setPreview(true);
          }}
        >
          Size
        </Button> */}
        {loadingFont === font.fontFamily ? <Spinner size={16} /> : null}
      </div>
    );
  };
  return (
    <div className={cx(themeClass, css.fontPreviewPanel)}>
      <div className={css.fontList}>
        <div className={css.searchFontHolder}>
          {getTextField("", searchString, filterFonts, "", {
            placeholder: "Search fonts",
            autoFocus: true,
          })}
        </div>

        <section
          style={{ flexGrow: 0, minHeight: "10%" }}
          className={cx({
            [css.open]: visibleSectionIds[FontSections.MyFonts],
          })}
        >
          <div
            className={css.sectionHeader}
            onClick={() => toggleSection(FontSections.MyFonts)}
          >
            <Button
              minimal
              small={true}
              icon={
                visibleSectionIds[FontSections.MyFonts]
                  ? "caret-down"
                  : "caret-right"
              }
            ></Button>
            <span>My Fonts</span>

            <div style={{ float: "right" }}>
              <Button
                // minimal
                small={true}
                icon={"add"}
                onClick={() => {
                  const event = new CustomEvent("OPEN_MEDIA_FONTS");
                  window.dispatchEvent(event);
                }}
              >
                Upload font
              </Button>
            </div>
          </div>

          {visibleSectionIds[FontSections.MyFonts] && (
            <div className={cx(css.panel, css.myFontsPanel)}>
              {myFonts.length === 0 && (
                <>
                  {/* <div>No custom fonts found.</div> */}
                  <Label>
                    It looks like you haven’t uploaded any custom fonts yet. To
                    use custom fonts, please upload them.
                  </Label>
                </>
              )}
              {myFonts.map((font) => {
                const previewFileName = font.previewSizes.find(
                  (size) => size.sizeType === "original"
                )?.sourceFilename;
                const previewImageUrl = getMediaSrc(
                  font,
                  "original",
                  "previewSizes"
                );
                // `/api/v1/media/${previewFileName}`;

                // const fontFileName = font.mediaSizes.find(
                //   (size) => size.sizeType === "original"
                // )?.sourceFilename;

                const fontUrl = getMediaSrc(font); //`/api/v1/media/${fontFileName}`;

                // debugger;

                return (
                  <div
                    key={font.id}
                    className={cx(css.fontListItem, css.myFontListItem, {
                      [css.active]:
                        font.name === selectedFontObj?.font.fontFamily,
                    })}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFont({
                        font: {
                          fontFamily: font.name,
                          source: "my-fonts",
                          mediaId: font.id,
                          fontUrl,
                        },
                      });
                      setPreview(true);
                    }}
                  >
                    <img src={previewImageUrl} alt={font.name}></img>
                    {loadingFont === font.name ? <Spinner size={16} /> : null}

                    {/* <Button
                      small
                      minimal
                      outlined
                      rightIcon={"play"}
                      className={css.previewFontBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFont({
                          font: {
                            fontFamily: font.name,
                            source: "my-fonts",
                            mediaId: font.id,
                            fontUrl,
                          },
                        });
                        setPreview(true);
                      }}
                    >
                      Size
                    </Button> */}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section
          className={cx(css.googleFontsSection, {
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
                  className={css.virtuoso}
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

        {/* <section
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

         
        </section> */}
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
                      type: previewSize.textType,
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
                {previewSize.previewText}
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
