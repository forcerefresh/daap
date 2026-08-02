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
import {
  getCheckboxField,
  getTextField,
  getUnitNumericFiled,
} from "../../inputs/input-utils";
import ChangeCheckerButton from "../../utils/components/change-checker-button/ChangeCheckerButton";
import {
  setupNewProject,
  setupNewProjectFromExisting,
} from "../../store/actions/multi-actions";
import {
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

import documents from "./document.json";
import { calculateAspectRatio, generateFilename } from "./utils";

interface ICreatePanelProps {
  onRequestClose: () => void;
  // onRequestFontPreview: () => void;
}

// type DocumentType = "instagram" | "facebook" | "pinterest" | string;

// export interface IDocumentDeff {
//   type: DocumentType;
//   name: string;
//   description?: string;
//   size?: { width: number; height: number };
//   ratio?: { vertical: number; horizontal: number; approximate?: boolean };
// }

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

  const [content, setContent] = useState<"empty" | "copy">("empty");

  const createNewProject = useCallback(
    async ({
      width,
      height,
      name,
      margins,
    }: {
      width: string;
      height: string;
      name: string;
      margins: { left: number; top: number; bottom: number; right: number };
    }) => {
      if (content === "empty") {
        _setupNewProject({
          width,
          height,
          name,
          margins,
        });
        return;
      }

      _setupNewProjectFromExisting({
        width,
        height,
        name,
        margins,
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

  const dimensionSetToValue = (value?: DimensionSet) => {
    return value?.px ?? value?.mm ?? value?.inch;
  };

  const valueSetToValue = (value?: ValueSet) => {
    return value?.px ?? value?.mm ?? value?.inch ?? 0;
  };

  const renderObjectsCards = (newDeffs: DocumentItem[], docType: string) => {
    return (
      <>
        {newDeffs.map((deff) => {
          const docSize = dimensionSetToValue(deff?.dimensions) ?? {
            width: 100,
            height: 100,
          };

          const margins = deff.margin.common
            ? {
                left: valueSetToValue(deff.margin.common),
                top: valueSetToValue(deff.margin.common),
                bottom: valueSetToValue(deff.margin.common),
                right: valueSetToValue(deff.margin.common),
              }
            : deff.margin.left
            ? {
                left: valueSetToValue(deff.margin.left),
                top: valueSetToValue(deff.margin.top),
                bottom: valueSetToValue(deff.margin.bottom),
                right: valueSetToValue(deff.margin.right),
              }
            : {
                left: 0,
                top: 0,
                bottom: 0,
                right: 0,
              };

          const size = { ...docSize };
          const max = Math.max(docSize.width, docSize.height);
          size.width = (docSize.width / max) * 100;
          size.height = (docSize.height / max) * 100;

          const ratio = calculateAspectRatio(size.width, size.height);

          return (
            <ChangeCheckerButton
              minimal
              onAllow={() => {
                createNewProject({
                  height: (docSize?.height ?? 1080) + "px",
                  width: (docSize?.width ?? 1080) + "px",
                  margins,
                  name:
                    docType + " " + deff.name + " " + new Date().toDateString(),
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
                key={"create_new_card_" + docType}
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
                    {ratio?.horizontal}:{ratio?.vertical}
                  </div>

                  {/* <SVG src={deff.meta.icon || ""} /> */}
                </div>

                <p className={css.name}>{deff.name}</p>
                <p className={css.description}>
                  {docSize?.width}x{docSize?.height}
                </p>

                {/* <p className={css.description}>{deff.description}</p> */}
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
    name: generateFilename("Square Post"),
  });

  return (
    <div className={cx(themeClass, css.createPanel)}>
      <RightPanelHeader title="CREATE DOCUMENT" />

      {/* <section>
        <div>
          <div
            className={css.sectionHeader}
          >
          
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
            <Radio label="New document" value="empty" />
            <Radio label="Copy current document" value="copy" />
          </RadioGroup>
        </div>
      </section> */}

      <section>
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

            <div style={{ display: "flex", gap: "20px" }}>
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
            </div>

            <div className="">
              {getCheckboxField(
                "Copy content from current document",
                content === "copy",
                (value: boolean) => {
                  setContent(value ? "copy" : "empty");
                },
                undefined,
                { alignIndicator: "left" }
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

      {documents.map((rootCat) => {
        return (
          <section key={rootCat.category}>
            <h3 style={{ marginBottom: "0px" }}>{rootCat.category}</h3>
            {rootCat.items.map((cat) => {
              return (
                <React.Fragment key={rootCat.category + cat.category}>
                  <div>
                    <div className={css.sectionHeader}>{cat.category}</div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {renderObjectsCards(cat.items, cat.category)}
                  </div>
                </React.Fragment>
              );
            })}
          </section>
        );
      })}
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
