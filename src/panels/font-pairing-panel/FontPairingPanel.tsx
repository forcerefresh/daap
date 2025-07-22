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
import css from "./FontPairingPanel.module.scss";
import {
  addNewObject,
  replaceObject,
  setExternalFontLoaded,
} from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";

import { load } from "webfontloader";
import { getGlobals } from "../../globals";
import { TEXT, TextType } from "../../objects/text/text";

import { getSelectField, getTextField } from "../../inputs/input-utils";

import { Virtuoso } from "react-virtuoso";
import { settings } from "../../store/reducers/settings";
import { IntegrationContext } from "../../integration";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";
import { addStyle } from "../../utils/doom-utils/css-utils";
import { debounce, isArray } from "lodash-es";
import { getMediaSrc } from "../../integration/utils/local-media";
import { GlobalEventsContext } from "../../utils/global-events/GlobalEvents";

import urbanFontPairing from "../../jsons/pairing/urban-font-pairing.json";
import brutalistFontPairing from "../../jsons/pairing/brutalist-font-pairing.json";
import sportFontPairing from "../../jsons/pairing/sport-font-pairing.json";
import luxuryFontPairing from "../../jsons/pairing/luxury-font-pairing.json";
import artistFontPairing from "../../jsons/pairing/artistic-font-pairing.json";
import corporateFontPairing from "../../jsons/pairing/corporate-font-pairing.json";
import creativeFontPairing from "../../jsons/pairing/creative-font-pairing.json";
import educationFontPairing from "../../jsons/pairing/education-font-pairing.json";
import environmentalFontPairing from "../../jsons/pairing/environmental-font-pairing.json";
import futuristicFontPairing from "../../jsons/pairing/futuristic-font-pairing.json";

import globalFontPairing from "../../jsons/pairing/global-font-pairing.json";
import handMadeFontPairing from "../../jsons/pairing/handmade-font-pairing.json";

import healthcareFontPairing from "../../jsons/pairing/healthcare-font-pairing.json";
import industrialFontPairing from "../../jsons/pairing/industrial-font-pairing.json";
import minimalistFontPairing from "../../jsons/pairing/minimalistic-font-pairing.json";
import mysticalFontPairing from "../../jsons/pairing/mystical-font-pairing.json";

import { FontPreloader } from "../../objects/font-preloader";

// const fontPairing = urbanFontPairing.futuristic_pairings[0].fontPairing;

// const pairings = urbanFontPairing.urban_pairings
// const pairings = futuristicFontPairing.futuristic_pairings
// const pairings = brutalistFontPairing.brutalist_pairings;
// const pairings = artistFontPairing.artistic_pairings;
// const pairings = healtcareFontPairing.healthcare_pairings;
//
// const luxuryPairings = luxuryFontPairing.luxury_pairings;
// const artisticPairings = artistFontPairing.artistic_pairings;
// const brutalistPairing = brutalistFontPairing.brutalist_pairings;
// const corporatePairing = corporateFontPairing.corporate_pairings;
// const creativePairing = creativeFontPairing.creative_pairings;
// const educationPairing = educationFontPairing.education_pairings;

const fontsPairings = [
  { pairing: luxuryFontPairing.luxury_pairings, name: "Luxury" },
  { pairing: artistFontPairing.artistic_pairings, name: "Artist" },
  { pairing: brutalistFontPairing.brutalist_pairings, name: "Brutalist" },
  { pairing: corporateFontPairing.corporate_pairings, name: "Corporate" },
  { pairing: creativeFontPairing.creative_pairings, name: "Creative" },
  { pairing: educationFontPairing.education_pairings, name: "Education" },
  {
    pairing: environmentalFontPairing.environmental_pairings,
    name: "Environmental",
  },
  { pairing: futuristicFontPairing.futuristic_pairings, name: "Futuristic" },
  { pairing: globalFontPairing.global_pairings, name: "Global" },
  { pairing: handMadeFontPairing.handmade_pairings, name: "Handmade" },
  { pairing: industrialFontPairing.industrial_pairings, name: "Industrial" },
  { pairing: healthcareFontPairing.healthcare_pairings, name: "Healthcare" },
  {
    pairing: minimalistFontPairing.minimalist_pairings,
    name: "Minimalistic",
  },
  { pairing: mysticalFontPairing.mystical_pairings, name: "Mystical" },
].map((item) => {
  const options = item.pairing.map((item, idx) => {
    return { label: item.name, value: idx };
  });

  options.unshift({ label: "Select font pairing", value: -1 });

  return {
    ...item,
    options,
  };
});

let top = 100;

// const luxurySelectOptions = luxuryPairings.map((item, idx) => {
//   return { label: item.name, value: idx };
// });
// luxurySelectOptions.unshift({ label: "Select font pairing", value: -1 });

// const artisticSelectOptions = artisticPairings.map((item, idx) => {
//   return { label: item.name, value: idx };
// });
// artisticSelectOptions.unshift({ label: "Select font pairing", value: -1 });

// const brutalistSelectOptions = brutalistPairing.map((item, idx) => {
//   return { label: item.name, value: idx };
// });
// brutalistSelectOptions.unshift({ label: "Select font pairing", value: -1 });

// const corporateSelectOptions = corporatePairing.map((item, idx) => {
//   return { label: item.name, value: idx };
// });
// corporateSelectOptions.unshift({ label: "Select font pairing", value: -1 });

// const creativeSelectOptions = creativePairing.map((item, idx) => {
//   return { label: item.name, value: idx };
// });
// creativeSelectOptions.unshift({ label: "Select font pairing", value: -1 });

const defaultStyle = {
  h1: {
    type: "h1",
    fontSize: "36px",
  },
  h2: {
    type: "h2",
    fontSize: "28px",
  },
  h3: {
    type: "h3",
    fontSize: "22px",
  },
  body: {
    type: "body",
    fontSize: "16px",
  },
  caption: {
    type: "caption",
    fontSize: "14px",
  },
  quotes: {
    type: "quotes",
    fontSize: "20px",
  },
};

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

interface IFontPairingPanelProps {
  onRequestClose: () => void;
  editObjectId?: string;
}

export type IFontPairingPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IFontPairingPanelProps;

const FontPairingPanel = (props: IFontPairingPanelMergedProps) => {
  const {
    onRequestClose,
    // documentSize,
    editObjectId,
    activeLayerId,
    loadedFontFamilies,
    _addNewObject,
    _setExternalFontLoaded,
    themeClass,
    _replaceObject,
  } = props;

  const { replaceItem } = useContext(GlobalEventsContext);

  const loadGoogleFont = (fontFamily: string) => {
    const loadSource = "google";

    const fontPreloader = new FontPreloader();

    fontPreloader.subscribe(fontFamily).then(() => {});

    // load({
    //   [loadSource]: {
    //     families: [fontFamily],
    //   },
    //   classes: false,
    //   fontloading: (familyName: string, fvd: string) => {
    //     console.log("loading");
    //   },
    //   fontactive: (familyName: string, fvd: string) => {
    //     console.log("fontactive: " + familyName);
    //   },
    // });
  };

  const addObjectsToStage = async (
    fontPairing: Record<
      string,
      {
        font_family: string;
        font_weight: string;
        font_style: string;
        usage: string[];
      }
    >
  ) => {
    if (!activeLayerId) return;

    // ["primary", "secondary", "accent"]

    for (const usageType of ["primary", "secondary", "accent"]) {
      // ["h1", "h2", "h3", "body", "caption"].

      const pairing = fontPairing[usageType as keyof typeof fontPairing];

      const tag = pairing.usage[0] ?? "body";

      const baseValues = defaultStyle[tag as keyof typeof defaultStyle];

      loadGoogleFont(pairing.font_family);

      async function addObject(topInternal: any) {
        await _addNewObject(
          activeLayerId,
          TEXT,
          {
            left: 100, // documentSize.width / 4,
            top: topInternal, // documentSize.height / 4,
            width: 400, //documentSize.width / 2,
            height: 50, //documentSize.height / 2,
          },
          {
            tag,
            ...baseValues,
            font: {
              fontFamily: pairing.font_family,
              source: "google-fonts",
              weight: pairing.font_weight,
            }!,
            autoHeight: true,
            initialAutoWidth: true,
            //fontSize: previewSize.size.toString() + "px",
            text: "Sample text (" + usageType + ")",
            italic: pairing.font_style === "italic",
          }
        );
      }

      // loadGoogleFont(pairing.font_family);

      await addObject(top);

      top += parseInt(baseValues.fontSize, 10) + 10;
    }
  };

  const addObjectToStage = (selectedFont: IFontPreview) => {
    if (activeLayerId) {
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

  const [searchString, setSearchString] = useState<string>("");

  // const filterFonts = (userStr: string) => {
  //   const str = userStr.trim().toLowerCase();

  //   setSearchString(str);
  //   const visIdx = googleFonts.map((gFont) => {
  //     if (str === "" || gFont.fontFamily.toLowerCase().startsWith(str)) {
  //       return true;
  //     }
  //     return false;
  //   });
  //   setVisibleFontsIdx(visIdx);
  // };

  // const previewSizes = [
  //   { previewText: "Heading XL", size: 49, textType: TextType.H1 },
  //   { previewText: "Heading L", size: 39, textType: TextType.H2 },
  //   { previewText: "Heading", size: 31, textType: TextType.H3 },
  //   { previewText: "Heading S", size: 25, textType: TextType.H4 },
  //   { previewText: "Heading XS", size: 20, textType: TextType.H5 },
  //   { previewText: "Body", size: 16, textType: TextType.Body },
  //   { previewText: "Caption", size: 13, textType: TextType.Caption },
  //   { previewText: "Tiny", size: 11, textType: TextType.Tiny },
  // ];

  const handleSearchInputChange = () => {};

  return (
    <div className={cx(themeClass, css.fontPairingPanel)}>
      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
        <Button icon="cross" minimal onClick={onRequestClose} />
      </div>
      <div className={css.fontList}>
        <div className={css.searchFontHolder}>
          {getTextField("", searchString, handleSearchInputChange, "", {
            placeholder: "Search fonts",
            autoFocus: true,
          })}
        </div>

        <section style={{ flexGrow: 0, minHeight: "10%" }}>
          <div className={css.sectionHeader}>
            <span>Font pairings</span>
          </div>

          {fontsPairings.map((pairingItem) => {
            return getSelectField(
              pairingItem.name,
              -1,
              pairingItem.options,
              (idx: number) => {
                addObjectsToStage(pairingItem.pairing[idx].fontPairing);
              }
            );
          })}

          {/* 
          {getSelectField("Luxury", -1, luxurySelectOptions, (idx: number) => {
            addObjectsToStage(
              luxuryFontPairing.luxury_pairings[idx].fontPairing
            );
          })}

          {getSelectField(
            "Artistic",
            -1,
            artisticSelectOptions,
            (idx: number) => {
              addObjectsToStage(
                artistFontPairing.artistic_pairings[idx].fontPairing
              );
            }
          )}

          {getSelectField(
            "Brutalist",
            -1,
            brutalistSelectOptions,
            (idx: number) => {
              addObjectsToStage(
                brutalistFontPairing.brutalist_pairings[idx].fontPairing
              );
            }
          )}

          {getSelectField(
            "Corporate",
            -1,
            corporateSelectOptions,
            (idx: number) => {
              addObjectsToStage(
                corporateFontPairing.corporate_pairings[idx].fontPairing
              );
            }
          )}

          {getSelectField(
            "Creative",
            -1,
            creativeSelectOptions,
            (idx: number) => {
              addObjectsToStage(
                creativeFontPairing.creative_pairings[idx].fontPairing
              );
            }
          )} */}
          {/* <div
            className={cx(css.panel)}
            onClick={() => {
              addObjectsToStage();
            }}
          >
            ADD FONT PAIRING
          </div> */}
        </section>
      </div>
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
  _replaceObject: replaceObject,
};

export default connect(mapStateToProps, mapDispatchToProps)(FontPairingPanel);
