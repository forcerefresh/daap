import {
  Button,
  Card,
  Elevation,
  Label,
  Spinner,
} from "@blueprintjs/core";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./FontPreviewPanel.module.scss";
import {
  addNewObject,
  replaceObject,
  setExternalFontLoaded,
} from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";

import { load } from "webfontloader";
import { getGlobals } from "../../globals";
import { TEXT, TextType } from "../../objects/text/text";

import { getTextField } from "../../inputs/input-utils";

import { Virtuoso } from "react-virtuoso";
import { IntegrationContext } from "../../integration";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";
import { addStyle } from "../../utils/doom-utils/css-utils";
import { debounce, isArray } from "lodash-es";
import { getMediaSrc } from "../../integration/utils/local-media";
import { GlobalEventsContext } from "../../utils/global-events/GlobalEvents";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { SectionHeader } from "../common/section-header/SectionHeader";

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
    activeLayerId,
    loadedFontFamilies,
    _addNewObject,
    _setExternalFontLoaded,
    themeClass,
    _replaceObject,
  } = props;

  const { replaceItem } = useContext(GlobalEventsContext);

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
            setMyFonts(result.data as any);
          }
        },

        (error) => {
          logger.app.error(error);
        },
      );
    },
    [fetchMedias],
  );

  useEffect(() => {
    fetchData();
  }, []);

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
          fontSize: "20px",
          text: "Sample text",
        },
      );
      onRequestClose();
    } else {
      AppToaster.show({
        intent: "warning",
        message: `No layer selected. Please choose a layer first.`,
      });
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
          fontloading: (_familyName: string, _fvd: string) => {},
          fontactive: (_familyName: string, _fvd: string) => {
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
    200,
  );

  useEffect(() => {
    debounceFetchData(searchString);
  }, [searchString]);

  useEffect(() => {
    const gFonts: IFontPreview[] = (getGlobals()
      .getFonts?.() ?? [])
      .filter((font: any) => font.source === "google-fonts")
      .sort() as any;
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

  const previewSizes = [
    { previewText: "Heading XL", size: 49, textType: TextType.H1 },
    { previewText: "Heading L", size: 39, textType: TextType.H2 },
    { previewText: "Heading", size: 31, textType: TextType.H3 },
    { previewText: "Heading S", size: 25, textType: TextType.H4 },
    { previewText: "Heading XS", size: 20, textType: TextType.H5 },
    { previewText: "Body", size: 16, textType: TextType.Body },
    { previewText: "Caption", size: 13, textType: TextType.Caption },
    { previewText: "Tiny", size: 11, textType: TextType.Tiny },
  ];

  const filteredFonts = useMemo(
    () =>
      googleFonts
        .map((item, idx) => ({ ...item, idx: idx }))
        .filter((_font, idx) => {
          return visibleFontsInx[idx];
        }),
    [googleFonts, visibleFontsInx],
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
          css.fontsSprite,
        )}
        // onClick={() => {
        //   setSelectedFont({ font, add: true });
        // }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedFont({ font });
          setPreview(true);
        }}
      >
        {loadingFont === font.fontFamily ? <Spinner size={16} /> : null}
      </div>
    );
  };

  return (
    <div className={cx(themeClass, css.fontPreviewPanel)}>
      <div style={{ position: "absolute", top: "2px", right: "2px" }}>
        <Button icon="cross" minimal onClick={onRequestClose} />
      </div>
      <div className={css.fontList}>
        <div className={css.searchFontHolder}>
          {getTextField("", searchString, filterFonts, "", {
            placeholder: "Search fonts",
            autoFocus: true,
            style: { width: "100%" },
          })}
        </div>

        <section
          style={{ flexGrow: 0, minHeight: "10%" }}
          className={cx({
            [css.open]: visibleSectionIds[FontSections.MyFonts],
          })}
        >
          <SectionHeader
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
                  const event = new CustomEvent("OPEN_MEDIA_FONTS_PANEL");
                  window.dispatchEvent(event);
                }}
              >
                Upload font
              </Button>
            </div>
          </SectionHeader>

          {visibleSectionIds[FontSections.MyFonts] && (
            <div className={cx(css.panel, css.myFontsPanel)}>
              {myFonts.length === 0 && (
                <>
                  <Label>
                    No custom fonts uploaded yet. Upload font files to use them
                    in your designs.
                  </Label>
                </>
              )}
              {myFonts.map((font) => {
                const previewImageUrl = getMediaSrc(
                  font,
                  "original",
                  "previewSizes",
                );

                const fontUrl = getMediaSrc(font);

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
          <SectionHeader
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
          </SectionHeader>

          {visibleSectionIds[FontSections.GoogleFonts] && (
            <div className={css.panel}>
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
                  itemContent={(
                    _index: number,
                    font: IFontPreview & { idx: number },
                  ) => renderFont(font)}
                />
              </div>
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
                if (replaceItem?.type === "text") {
                  _replaceObject(
                    replaceItem.objectId!,
                    TEXT,
                    {
                      ...replaceItem.objectProps,
                    },
                    {
                      font: previewFont!,
                      autoHeight: true,
                      initialAutoWidth: true,
                      fontSize: previewSize.size.toString() + "px",
                      type: previewSize.textType,
                      text: "Sample text",
                      ...replaceItem.values,
                    },
                  );
                  onRequestClose();
                  return;
                }

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
                    },
                  );
                  onRequestClose();
                } else {
                  AppToaster.show({
                    intent: "warning",
                    message: `No layer selected. Please choose a layer first.`,
                  });
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

const mapStateToProps = (state: IStore) => {
  return {
    activeLayerId: state.project.selection.activeLayerId,
    loadedFontFamilies: state.fonts.loadedFontFamilies,
    themeClass: state.project.settings.themeClass,
  };
};

const mapDispatchToProps = {
  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>,
    values: { [key: string]: any },
  ) => addNewObject(layerId, type, objectProps, values),
  _setExternalFontLoaded: (fontFamilyName: string) =>
    setExternalFontLoaded(fontFamilyName),
  _replaceObject: replaceObject,
};

export default connect(mapStateToProps, mapDispatchToProps)(FontPreviewPanel);
