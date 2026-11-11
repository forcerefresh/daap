import { Button } from "@blueprintjs/core";
import { useEffect, useMemo, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./FontPairingPanel.module.scss";
import { addNewObject } from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";

import { TEXT } from "../../objects/text/text";

import { getTextField } from "../../inputs/input-utils";

import { Virtuoso } from "react-virtuoso";

import allFontsPairings from "../../utils/fonts/all-fonts-pairings.json";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { SectionHeader } from "../common/section-header/SectionHeader";

let top = 100;

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

interface IFontPairingPanelProps {
  onRequestClose: () => void;
  editObjectId?: string;
}

export type IFontPairingPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IFontPairingPanelProps;

const GAP = 14;

const FontPairingPanel = (props: IFontPairingPanelMergedProps) => {
  const {
    onRequestClose,
    activeLayerId,
    _addNewObject,
    themeClass,
  } = props;

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
    if (!activeLayerId) {
      AppToaster.show({
        intent: "warning",
        message: `No layer selected. Please choose a layer first.`,
      });
      return;
    }

    for (const usageType of ["primary", "secondary", "accent"]) {
      const pairing = fontPairing[usageType as keyof typeof fontPairing];

      const tag = pairing.usage[0] ?? "body";

      const baseValues = defaultStyle[tag as keyof typeof defaultStyle];

      async function addObject(topInternal: any) {
        await _addNewObject(
          activeLayerId!,
          TEXT,
          {
            left: 100,
            top: topInternal,
            width: 400,
            height: 50,
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
            text: pairing.font_family,
            italic: pairing.font_style === "italic",
          }
        );
      }

      await addObject(top);

      top += parseInt(baseValues.fontSize, 10) + 10;
    }
  };

  const renderFont = (font: any & { idx: number }) => {
    return (
      <div
        key={font.fontFamily}
        style={{
          position: "relative",
          backgroundPositionY: (-103 - GAP) * font.idx + "px",
          height: "117px",
        }}
        className={cx(css.fontListItem, css.googleFontsItem, css.fontsSprite)}
      >
        <div
          className={css.fontsSpriteInner}
          onClick={async (e) => {
            e.stopPropagation();
            await addObjectsToStage(font.fontPairing);

            onRequestClose();
          }}
        ></div>
      </div>
    );
  };

  useEffect(() => {
    setVisibleFontsIdx(allFontsPairings.font_pairings.map(() => true));
  }, []);

  const [searchString, setSearchString] = useState<string>("");
  const googleFontsPairing = allFontsPairings.font_pairings;
  const [visibleFontsInx, setVisibleFontsIdx] = useState<boolean[]>([]);

  const handleSearch = (searchQuery: string) => {
    const str = searchQuery.trim().toLowerCase();

    setSearchString(str);

    const visIdx = allFontsPairings.font_pairings.map((fontPairing) => {
      if (!str) return true;

      if (fontPairing.name.toLowerCase().startsWith(str)) {
        return true;
      }

      if (
        fontPairing.fontPairing.primary.font_family
          .toLowerCase()
          .startsWith(str)
      ) {
        return true;
      }
      if (
        fontPairing.fontPairing.secondary.font_family
          .toLowerCase()
          .startsWith(str)
      ) {
        return true;
      }
      if (
        fontPairing.fontPairing.accent.font_family.toLowerCase().startsWith(str)
      ) {
        return true;
      }

      return false;
    });

    setVisibleFontsIdx(visIdx);
  };

  const filteredFonts = useMemo(
    () =>
      googleFontsPairing
        .map((item, idx) => ({ ...item, idx: idx }))
        .filter((_font, idx) => {
          return visibleFontsInx[idx];
        }),
    [googleFontsPairing, visibleFontsInx]
  );

  return (
    <div className={cx(themeClass, css.fontPairingPanel)}>
      <div style={{ position: "absolute", top: "2px", right: "2px" }}>
        <Button icon="cross" minimal onClick={onRequestClose} />
      </div>
      <div className={css.fontList}>
        <div className={css.searchFontHolder}>
          {getTextField("", searchString, handleSearch, "", {
            placeholder: "Search fonts",
            autoFocus: true,
            style: { width: "100%" },
          })}
        </div>

        <section style={{ flexGrow: 0, minHeight: "10%", height: "100%" }}>
          <SectionHeader>
            <span>Font pairings</span>
          </SectionHeader>

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
                itemContent={(_index: number, font) => renderFont(font)}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  return {
    activeLayerId: state.project.selection.activeLayerId,
    themeClass: state.project.settings.themeClass,
  };
};

const mapDispatchToProps = {
  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>,
    values: { [key: string]: any }
  ) => addNewObject(layerId, type, objectProps, values),
};

export default connect(mapStateToProps, mapDispatchToProps)(FontPairingPanel);
