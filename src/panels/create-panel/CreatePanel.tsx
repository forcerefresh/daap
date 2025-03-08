import {
  Button,
  Card,
  Divider,
  Elevation,
  Radio,
  RadioGroup,
} from "@blueprintjs/core";
import React, { useCallback, useContext, useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./CreatePanel.module.scss";
import {
  activateSlide,
  addNewObject,
  CreateNewProjectActionPayload,
  doClearHistory,
  openProject,
  selectForProperties,
  selectForPropertiesProps,
  selectSlides,
  setDevice,
  updateEditor,
  updateProjectMeta,
} from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { getAppObjectDefinitionsByGroup } from "webslider-sdk/lib/objects/objects-register";
import SVG from "react-inlinesvg";
import { IntegrationContext } from "../../integration";
import { getTextField, getUnitNumericFiled } from "../../inputs/input-utils";
import ChangeCheckerButton from "../../utils/components/change-checker-button/ChangeCheckerButton";
import {
  setupNewProject,
  setupNewProjectFromExisting,
} from "../../store/actions/multi-actions";
import {
  PanelHeader,
  RightPanelHeader,
} from "../common/panel-header/PanelHeader";
import e from "express";
import {
  generatePlayerData,
  getAllAssetsUrls,
  getAllFonts,
} from "../../export/export-html";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IMeta } from "../../store/reducers/meta";
import { ISettings } from "../../store/reducers/i-settings";
import { cloneDeep, last } from "lodash-es";

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
  const {
    onRequestClose,
    themeClass,
    _setupNewProject,
    project,
    breakpointConfig,
    settings,
    breakpoints,
    _updateProjectMeta,
    _doClearHistory,
    _openProject,
    _setDevice,
    _activateSlide,
    _selectSlides,
    _selectForProperties,
    _updateEditor,
    _setupNewProjectFromExisting,
  } = props;

  const globalContext = useContext(IntegrationContext);
  const { getInstalledExtensions } = globalContext.useExtensionsHook();

  const [content, setContent] = useState<"empty" | "copy">("empty");

  const renderObjectsCardsGroup = (group: string) => {
    const newDeffs = getDocuments(group);
    return renderObjectsCards(newDeffs);
  };

  const createNewProject = useCallback(
    async ({
      width,
      height,
      name,
    }: {
      width: string;
      height: string;
      name: string;
    }) => {
      if (content === "empty") {
        _setupNewProject({
          width,
          height,
          name,
        });
        return;
      }

      _setupNewProjectFromExisting({
        width,
        height,
        name,
      });

      const slideIdToSelect = project.pages.pages[0];
      if (slideIdToSelect) {
        _activateSlide(slideIdToSelect);
        _selectSlides([slideIdToSelect]);
        _selectForProperties({ id: slideIdToSelect, type: "slide" });
      }

      _doClearHistory();
      _updateEditor({ sliderChanged: true, isExistingProject: false });
      _doClearHistory();
    },
    [
      _doClearHistory,
      _setupNewProject,
      _setupNewProjectFromExisting,
      _updateEditor,
      content,
    ]
  );

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
                createNewProject({
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
                    {deff.ratio?.vertical}:{deff.ratio?.horizontal}
                  </div>

                  {/* <SVG src={deff.meta.icon || ""} /> */}
                </div>

                <p className={css.name}>{deff.name}</p>
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
            Content
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <RadioGroup
            onChange={(e) =>
              setContent(e.currentTarget.value as "empty" | "copy")
            }
            selectedValue={content}
          >
            <Radio label="Empty document" value="empty" />
            <Radio label="Copy current document" value="copy" />
          </RadioGroup>
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
                createNewProject(newProjectData);
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
  const breakpointConfig: BreakpointConfiguration | undefined = last(
    state.project.settings.breakpoints.breakpointsConfiguration.filter(
      (bc) => bc.enabled
    )
  );

  return {
    settings: state.project.settings,
    breakpoints: state.project.settings.breakpoints,
    breakpointConfig,
    project: state.project,
    themeClass: state.project.settings.themeClass,
  };
};

const mapDispatchToProps = {
  _setupNewProject: (props: CreateNewProjectActionPayload) =>
    setupNewProject(props),

  _setupNewProjectFromExisting: (props: CreateNewProjectActionPayload) =>
    setupNewProjectFromExisting(props),

  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>,
    values?: { [key: string]: any }
  ) => addNewObject(layerId, type, objectProps, values),
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
  _openProject: (project: any) => openProject(project),
  _doClearHistory: () => doClearHistory(),
  _activateSlide: (id: string): any => activateSlide(id),
  _selectSlides: (ids: string[]): any => selectSlides(ids),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
  _setDevice: setDevice,
  _updateEditor: updateEditor,
};

export default connect(mapStateToProps, mapDispatchToProps)(CreatePanel);
