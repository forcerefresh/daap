import { Button, Card, Divider, Elevation } from "@blueprintjs/core";
import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./CreatePanel.module.scss";
import {
  addNewObject,
  CreateNewProjectActionPayload,
} from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { getAppObjectDefinitionsByGroup } from "webslider-sdk/lib/objects/objects-register";
import SVG from "react-inlinesvg";
import { IntegrationContext } from "../../integration";
import { getTextField, getUnitNumericFiled } from "../../inputs/input-utils";
import ChangeCheckerButton from "../../utils/components/change-checker-button/ChangeCheckerButton";
import { setupNewProject } from "../../store/actions/multi-actions";
import {
  PanelHeader,
  RightPanelHeader,
} from "../common/panel-header/PanelHeader";

interface ICreatePanelProps {
  onRequestClose: () => void;
  // onRequestFontPreview: () => void;
}

type DocumentType = "instagram" | "facebook" | "pinterest" | string;

export interface IDocumentDeff {
  type: DocumentType;
  name: string;
  description?: string;
  size?: { width: number; height: number };
  ratio?: { vertical: number; horizontal: number; approximate?: boolean };
}

const documentsDefs: IDocumentDeff[] = [
  // PINTEREST
  {
    type: "Pinterest",
    name: "Standard Pin",
    size: { width: 1000, height: 1500 },
    ratio: { vertical: 2, horizontal: 3 },
  },
  {
    type: "Pinterest",
    name: "Square Pin",
    size: { width: 1000, height: 1000 },
    ratio: { vertical: 1, horizontal: 1 },
  },
  {
    type: "Pinterest",
    name: "Tall Pin",
    size: { width: 1000, height: 2100 },
    ratio: { vertical: 1, horizontal: 2.6 },
  },
  {
    type: "Pinterest",
    name: "Profile photo",
    size: { width: 280, height: 280 },
    ratio: { vertical: 1, horizontal: 1 },
  },
  {
    type: "Pinterest",
    name: "Profile cover",
    size: { width: 800, height: 450 },
    ratio: { vertical: 16, horizontal: 9 },
  },

  // INSTAGRAM
  {
    type: "Instagram",
    name: "Square post",
    size: { width: 1080, height: 1080 },
    ratio: { vertical: 1, horizontal: 1 },
  },
  {
    type: "Instagram",
    name: "Landscape post",
    size: { width: 1080, height: 566 },
    ratio: { vertical: 1.91, horizontal: 1 },
  },
  {
    type: "Instagram",
    name: "Portrait post",
    size: { width: 1080, height: 1350 },
    ratio: { vertical: 4, horizontal: 5 },
  },

  // FACEBOOK
  {
    type: "Facebook",
    name: "Story",
    size: { width: 1080, height: 1920 },
    ratio: { vertical: 9, horizontal: 16 },
  },

  {
    type: "Facebook",
    name: "Feed post",
    size: { width: 1200, height: 630 },
    ratio: { vertical: 2, horizontal: 1, approximate: true },
  },

  {
    type: "Facebook",
    name: "Carousel",
    size: { width: 1200, height: 1200 },
    ratio: { vertical: 1, horizontal: 1 },
  },

  {
    type: "Facebook",
    name: "Ad",
    size: { width: 1080, height: 1080 },
    ratio: { vertical: 1, horizontal: 1 },
  },

  {
    type: "Facebook",
    name: "Fundraiser",
    size: { width: 800, height: 300 },
    ratio: { vertical: 8, horizontal: 3 },
  },
  {
    type: "Facebook",
    name: "Cover photo",
    size: { width: 851, height: 315 },
    ratio: { vertical: 2.7, horizontal: 1, approximate: true },
  },
  {
    type: "Facebook",
    name: "Profile photo",
    size: { width: 180, height: 180 },
    ratio: { vertical: 1, horizontal: 1 },
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
  const { onRequestClose, themeClass, _setupNewProject } = props;

  const renderObjectsCardsGroup = (group: string) => {
    const newDeffs = getDocuments(group);
    return renderObjectsCards(newDeffs);
  };

  const renderObjectsCards = (newDeffs: IDocumentDeff[]) => {
    return (
      <>
        {newDeffs.map((deff) => {
          const size = { width: 100, height: 100 };
          if (deff.size) {
            const max = Math.max(deff.size.width, deff.size.height);
            size.width = (deff.size.width / max) * 100;
            size.height = (deff.size.height / max) * 100;
          }
          return (
            <ChangeCheckerButton
              minimal
              onAllow={() => {
                _setupNewProject({
                  height: (deff.size?.height ?? 1080) + "px",
                  width: (deff.size?.width ?? 1080) + "px",
                  name:
                    deff.type +
                    " " +
                    deff.name +
                    " " +
                    new Date().toDateString(),
                });
                onRequestClose();
              }}
              onDenied={() => {}}
              confirmButtonText={"Discard changes and Create Project"}
              className={css.createNewButton}
              intent="none"
            >
              <Card
                className={css.card}
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
                  <div
                    className={css.docPreview}
                    style={{
                      width: size.width + "px",
                      height: size.height + "px",
                    }}
                  >
                    {" "}
                    {deff.ratio?.vertical}:{deff.ratio?.horizontal}
                  </div>

                  {/* <SVG src={deff.meta.icon || ""} /> */}
                </div>

                <h3>{deff.name}</h3>
                <p className={css.description}>
                  {deff.size?.width}x{deff.size?.height}
                </p>

                <p className={css.description}>{deff.description}</p>
                {/* {deff.external && <div className={css.external}>EXT</div>}
            {deff.development && <div className={css.development}>DEV</div>} */}
              </Card>
            </ChangeCheckerButton>
          );
        })}
      </>
    );
  };

  const [newProjectData, setNewProjectData] = useState({
    width: "1080px",
    height: "1080px",
    name: "Custom " + new Date().toDateString(),
  });

  return (
    <div className={cx(themeClass, css.createPanel)}>
      <RightPanelHeader>
        <div>CREATE DOCUMENT</div>
      </RightPanelHeader>
      <section>
        <div>
          <div
            className={css.sectionHeader}
            // onClick={() => toggleSection(FontSections.GoogleFonts)}
          >
            {/* <Button
              minimal
              small={true}
              icon={
                // visibleSectionIds[FontSections.GoogleFonts]
                // ?
                "caret-down"
                // : "caret-right"
              }
            ></Button> */}
            Custom size
          </div>
          {/* <h1>Custom</h1> */}
          {/* <Divider /> */}
          {/* <p>Create Feed posts, Reels, Stories ...</p> */}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <div style={{ width: "100%" }}>
            <div className={cx("input400-force", css.inputHolder)}>
              {getTextField(
                "Name",
                newProjectData.name,
                (name: any) => {
                  setNewProjectData({ ...newProjectData, name });
                },
                ""
              )}
            </div>

            <div className="">
              {getUnitNumericFiled(
                "Width",
                newProjectData.width,
                (value: string) => {
                  setNewProjectData({ ...newProjectData, width: value });
                },
                undefined,
                { style: { width: "100px" } },
                ["px"]
              )}
            </div>
            <div className="">
              {getUnitNumericFiled(
                "Height",
                newProjectData.height,
                (value: string) => {
                  setNewProjectData({ ...newProjectData, height: value });
                },
                undefined,
                { style: { width: "100px" } },
                ["px"]
              )}
            </div>
            <ChangeCheckerButton
              onAllow={() => {
                _setupNewProject(newProjectData);
                onRequestClose();
              }}
              onDenied={() => {}}
              confirmButtonText={"Discard changes and Create Project"}
              intent="primary"
            >
              Create new document
            </ChangeCheckerButton>
            {/* <Button intent="primary">Create new project</Button> */}
            <div className={css.divider}>or choose document size</div>
          </div>
          {/* {renderObjectsCards([
            { name: "ss", type: "custom", size: { width: 1, height: 1 } },
          ])} */}
        </div>
      </section>

      <section>
        <div>
          <div
            className={css.sectionHeader}
            // onClick={() => toggleSection(FontSections.GoogleFonts)}
          >
            {/* <Button
              minimal
              small={true}
              icon={
                // visibleSectionIds[FontSections.GoogleFonts]
                // ?
                "caret-down"
                // : "caret-right"
              }
            ></Button> */}
            Instagram
          </div>
          {/* <Divider /> */}
          {/* <p>Create Feed posts, Reels, Stories ...</p> */}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {renderObjectsCardsGroup("Instagram")}
        </div>
      </section>
      <section>
        <div>
          <div
            className={css.sectionHeader}
            // onClick={() => toggleSection(FontSections.GoogleFonts)}
          >
            {/* <Button
              minimal
              small={true}
              icon={
                // visibleSectionIds[FontSections.GoogleFonts]
                // ?
                "caret-down"
                // : "caret-right"
              }
            ></Button> */}
            Facebook
          </div>{" "}
          {/* <p>Create Story post, Profile, vertical, horizontal ...</p> */}
        </div>
        <div>{renderObjectsCardsGroup("Facebook")}</div>
      </section>
      <section>
        <div>
          <div
            className={css.sectionHeader}
            // onClick={() => toggleSection(FontSections.GoogleFonts)}
          >
            {/* <Button
              minimal
              small={true}
              icon={
                // visibleSectionIds[FontSections.GoogleFonts]
                // ?
                "caret-down"
                // : "caret-right"
              }
            ></Button> */}
            Pinterest
          </div>
          {/* <Divider /> */}

          {/* <p>Create Square, Tall pin, Profile Cover ...</p> */}
        </div>
        <div>{renderObjectsCardsGroup("Pinterest")}</div>
      </section>

      {/* <section>
        <div>
          <h1>Custom</h1>
          <p>Choose custom size.</p>
        </div>

        <div>{renderObjectsCards("custom")}</div>
      </section> */}
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  return {
    themeClass: state.project.settings.themeClass,
  };
};

const mapDispatchToProps = {
  _setupNewProject: (props: CreateNewProjectActionPayload) =>
    setupNewProject(props),
};

export default connect(mapStateToProps, mapDispatchToProps)(CreatePanel);
