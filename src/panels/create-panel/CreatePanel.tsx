import { Card, Elevation } from "@blueprintjs/core";
import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./CreatePanel.module.scss";
import { addNewObject } from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { getAppObjectDefinitionsByGroup } from "webslider-sdk/lib/objects/objects-register";
import SVG from "react-inlinesvg";
import { IntegrationContext } from "../../integration";

interface ICreatePanelProps {
  onRequestClose: () => void;
  onRequestFontPreview: () => void;
}

type DocumentType = "instagram" | "facebook" | "pinterest" | string;

export interface IDocumentDeff {
  type: DocumentType;
  name: string;
  description?: string;
  size?: { width: number; height: number };
  ratio?: { vertical: number; horizontal: number };
}

const documentsDefs: IDocumentDeff[] = [
  // PINTEREST
  {
    type: "pinterest",
    name: "Standard Pin",
    size: { width: 1000, height: 1500 },
    ratio: { vertical: 2, horizontal: 3 },
  },
  {
    type: "pinterest",
    name: "Square Pin",
    size: { width: 1000, height: 1000 },
    ratio: { vertical: 1, horizontal: 1 },
  },
  {
    type: "pinterest",
    name: "Tall Pin",
    size: { width: 1000, height: 2100 },
    ratio: { vertical: 1, horizontal: 2.6 },
  },
  {
    type: "pinterest",
    name: "Profile photo",
    size: { width: 280, height: 280 },
    ratio: { vertical: 1, horizontal: 1 },
  },
  {
    type: "pinterest",
    name: "Profile cover",
    size: { width: 800, height: 450 },
    ratio: { vertical: 16, horizontal: 9 },
  },

  // INSTAGRAM
  {
    type: "instagram",
    name: "Square post",
    size: { width: 1080, height: 1080 },
    ratio: { vertical: 1, horizontal: 1 },
  },
  {
    type: "instagram",
    name: "Landscape post",
    size: { width: 1080, height: 566 },
    ratio: { vertical: 1.91, horizontal: 1 },
  },
  {
    type: "instagram",
    name: "Portrait feed post",
    size: { width: 1080, height: 1350 },
    ratio: { vertical: 4, horizontal: 5 },
  },
];

function getDocuments(documentType: DocumentType) {
  return documentsDefs.filter(
    (documentsDef) => documentsDef.type === documentType
  );
}

export type ICreatePanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ICreatePanelProps;

const CreatePanel: React.FC<ICreatePanelMergedProps> = (props) => {
  const { onRequestClose, themeClass } = props;

  const renderObjectsCards = (group: string) => {
    const newDeffs = getDocuments(group);

    return (
      <>
        {newDeffs.map((deff) => (
          <Card
            key={"create_new_card_" + deff.type}
            interactive={true}
            elevation={Elevation.ONE}
            onClick={() => {
              // if (isObjectDisabledForFree(deff.type)) return;
              // if (activeLayerId) {
              //   _addNewObject(activeLayerId, deff.type, {
              //     left: 100, //(documentSize.width - 960) / 2,
              //     top: 100, //(documentSize.height - 540) / 2,
              //     width: 960,
              //     height: 540,
              //     parentId:
              //       activeObject?.type === "group"
              //         ? activeObject.id
              //         : undefined,
              //   });
              //   onRequestClose();
              // }
            }}
          >
            <div className={css.svgHolder}>
              SVG {deff.size?.width}x{deff.size?.height}
              {/* <SVG src={deff.meta.icon || ""} /> */}
            </div>

            <h3>{deff.name}</h3>
            <p className={css.description}>{deff.description}</p>
            {/* {deff.external && <div className={css.external}>EXT</div>}
            {deff.development && <div className={css.development}>DEV</div>} */}
          </Card>
        ))}
      </>
    );
  };

  return (
    <div className={cx(themeClass, css.createPanel)}>
      <section>
        <div>
          <h1>Instagram</h1>
          <p>Create Feed posts, Reels, Stories ...</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {renderObjectsCards("instagram")}
        </div>
      </section>
      <section>
        <div>
          <h1>Facebook</h1>
          <p>Create Story post, Profile, vertical, horizontal ...</p>
        </div>
        <div>{renderObjectsCards("facebook")}</div>{" "}
      </section>
      <section>
        <div>
          <h1>Pinterest</h1>
          <p>Create Square, Tall pin, Profile Cover ...</p>
        </div>
        <div>{renderObjectsCards("pinterest")}</div>
      </section>

      <section>
        <div>
          <h1>Custom</h1>
          <p>Choose custom size.</p>
        </div>

        <div>{renderObjectsCards("custom")}</div>
      </section>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  return {
    themeClass: state.project.settings.themeClass,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(CreatePanel);
