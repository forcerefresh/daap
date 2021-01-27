import { Button, Card, Elevation, Icon } from "@blueprintjs/core";
import React, { useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./FontPreviewPanel.module.scss";
import {
  addNewObject,
  setExternalFontLoaded,
  setStageTool,
} from "../../store/actions/actions";
import { IObject, ObjectType } from "../../objects/types";

import { load } from "webfontloader";
import { indexOf } from "lodash-es";
import { getGlobals } from "../../globals";

enum FontSections {
  SystemFonts = "system",
  GoogleFonts = "google",
}

interface IFontPreview {
  fontFamily: string;
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
    documentSize,
    editObjectId,
    activeLayerId,
    loadedFontFamilies,
    _addNewObject,
    _setExternalFontLoaded,
  } = props;

  const [selectedFont, setSelectedFont] = useState<IFontPreview | null>(null);
  const [previewFont, setPreviewFont] = useState<IFontPreview | null>(null);

  const [visibleSectionIds, setVisibleSectionIds] = useState<{
    [key: string]: boolean;
  }>({
    [FontSections.GoogleFonts]: true,
    [FontSections.SystemFonts]: true,
  });

  const toggleSection = (section: string) => {
    setVisibleSectionIds({
      ...visibleSectionIds,
      [section]: !visibleSectionIds[section],
    });
  };

  useEffect(() => {
    if (!selectedFont) return;

    // if font is already loaded, do not load again
    if (loadedFontFamilies.indexOf(selectedFont?.fontFamily) !== -1) {
      setPreviewFont(selectedFont);
      return;
    }

    // load font
    load({
      google: {
        families: [selectedFont?.fontFamily],
      },
      classes: false,
      fontloading: (familyName: string, fvd: string) => {
        console.log(familyName);
        console.log(fvd);
      },
      fontactive: (familyName: string, fvd: string) => {
        setPreviewFont({ fontFamily: familyName });
        _setExternalFontLoaded(familyName);
      },
    });
  }, [selectedFont]);

  const googleFonts: IFontPreview[] = getGlobals()
    .getExternalFonts()
    .map((fontName) => ({ fontFamily: fontName }));

  const systemFonts: IFontPreview[] = [
    "Times New Roman",
    "Courier New",
    "Courier",
    "Verdana",
    "Georgia",
    "Tahoma",
  ]
    .sort()
    .map((fontName) => ({ fontFamily: fontName }));

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

  return (
    <div className={cx("bp3-dark", css.fontPreviewPanel)}>
      <div className={css.fontList}>
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
                    [css.active]: font.fontFamily === selectedFont?.fontFamily,
                  })}
                  onClick={() => {
                    setSelectedFont(font);
                  }}
                >
                  {font.fontFamily}
                </div>
              ))}
            </div>
          )}
        </section>

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
            Google Fonts
          </div>
          {visibleSectionIds[FontSections.GoogleFonts] && (
            <div className={css.panel}>
              {googleFonts.map((font) => (
                <div
                  key={font.fontFamily}
                  className={cx(css.fontListItem, {
                    [css.active]: font.fontFamily === selectedFont?.fontFamily,
                  })}
                  onClick={() => {
                    setSelectedFont(font);
                  }}
                >
                  {font.fontFamily}
                  {loadedFontFamilies &&
                  loadedFontFamilies.indexOf(font.fontFamily) !== -1 ? (
                    <Icon icon="tick" />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
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
                  ObjectType.TEXT,
                  {
                    left: documentSize.width / 4,
                    top: documentSize.height / 4,
                    width: documentSize.width / 2,
                    height: documentSize.height / 2,
                  },
                  {
                    fontFamily: previewFont?.fontFamily!,
                    fontSize: previewSize.size.toString(),
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
              Preview Text 1234567890
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  activeLayerId: state.project.selection.activeLayerId,
  loadedFontFamilies: state.fonts.loadedFontFamilies,
  documentSize: state.project.document.documentSize,

  //editObjectId: state.project.selection.activeObjectId,
});

const mapDispatchToProps = {
  _addNewObject: (
    layerId: string,
    type: ObjectType,
    objectProps: Partial<IObject>,
    values: { [key: string]: string }
  ) => addNewObject(layerId, type, objectProps, values),
  _setExternalFontLoaded: (fontFamilyName: string) =>
    setExternalFontLoaded(fontFamilyName),
};

export default connect(mapStateToProps, mapDispatchToProps)(FontPreviewPanel);
