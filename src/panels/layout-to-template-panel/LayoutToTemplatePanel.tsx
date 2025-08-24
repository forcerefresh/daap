import React, { useContext, useEffect, useMemo, useState } from "react";
import cx from "classnames";
import { cloneDeep, last, noop, omit, round, uniq, pick } from "lodash-es";
import { connect } from "react-redux";
import { Button, Classes, Dialog, Spinner } from "@blueprintjs/core";
import { IStore } from "../../store/store";
import css from "./LayoutToTemplatePanel.module.scss";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import {
  updateProjectMeta,
  updateEditor,
  replaceObject,
} from "../../store/actions/actions";
import { IntegrationContext } from "../../integration";
import { getTextArea, getTextField } from "../../inputs/input-utils";
import { IMeta } from "../../store/reducers/meta";
import {
  generatePlayerData,
  getAllAssetsUrls,
  getAllFonts,
} from "../../export/export-html";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { IEditor } from "../../store/reducers/editor";
import {
  updateObjectWithNewIds,
  updateProjectWithNewIds,
} from "../../utils/project/project-utils";
import {
  PanelHeader,
  RightPanelHeader,
} from "../common/panel-header/PanelHeader";
import { resizeProportionally } from "../../utils/common-calculation/common-calculation";
import { generateImages } from "../../player/image-generator-utils";
import { blobToBase64 } from "../../utils/file/file-utils";
import {
  collectLayoutObjectsPrompts,
  createLayout2TemplateAIPrompt,
} from "./layout2template-utils";
import { TEXT } from "../../objects/text/text";
import { RECTANGLE } from "../../objects/rectangle/rectangle";

export const THUMB_WIDTH = 200;

interface ILayout2TemplateProps {
  onRequestClose: () => void;
}

export type ILayout2TemplateMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ILayout2TemplateProps;

const LayoutToTemplate: React.FC<ILayout2TemplateMergedProps> = (props) => {
  const {
    project,
    meta,
    slides,
    layers,
    objects,
    breakpointConfig,
    settings,
    breakpoints,
    _updateProjectMeta,
    _updateEditor,
    onRequestClose,
    selectedDevice,
    themeClass,
    pages,
    _replaceObject,
  } = props;

  const aiPrompt = useMemo(() => {
    const page1Id = slides.pages[0];
    if (page1Id) {
      const page1 = slides.pageById[page1Id];
      const layer1Id = page1.layerIds[0];
      const layer = layers.layerById[layer1Id];

      return createLayout2TemplateAIPrompt(objects.objectById, layer.objectIds);
    }
    return;
  }, []);

  const [iaResponse, setIaResponse] = useState("");

  return (
    <div className={cx(themeClass, css.layout2TemplatePanel)}>
      <RightPanelHeader>
        <div>GENERATE AI TEMPLATE</div>
        <div className={css.saving}>
          {meta.inSaving && (
            <>
              <Spinner size={16} /> Saving...
            </>
          )}
        </div>
      </RightPanelHeader>

      <div className={css.layout2TemplateHolder}>
        <div className={cx("input100percent-force", css.inputHolder)}>
          {getTextArea("AI Prompt", aiPrompt, (description: any) => {}, "", {
            disabledDebounce: true,
            rows: 10,
          })}
        </div>
        <div className={css.actionRow}>
          <div>
            <Button
              disabled={meta.inSaving}
              intent="primary"
              icon="floppy-disk"
              onClick={() => {}}
            >
              {"Propose"}
            </Button>
          </div>
        </div>
      </div>

      <div className={css.layout2TemplateHolder}>
        <div className={cx("input100percent-force", css.inputHolder)}>
          {getTextArea(
            "AI Response",
            iaResponse,
            (resp: any) => {
              setIaResponse(resp);
            },
            "",
            {
              disabledDebounce: true,
              rows: 10,
            }
          )}
        </div>
        <div className={css.actionRow}>
          <div>
            <Button
              disabled={meta.inSaving}
              intent="primary"
              icon="floppy-disk"
              onClick={() => {
                try {
                  const obj = JSON.parse(iaResponse);
                  obj.objects.forEach((obj) => {
                    const existingObj = objects.objectById[obj.objectId];

                    if (obj.type === "text") {
                      _replaceObject(
                        obj.objectId!,
                        TEXT,

                        pick(existingObj, "left", "top", "width", "height"),

                        {
                          ...obj.properties,
                          // font: previewFont!,
                          // autoHeight: true,
                          // initialAutoWidth: true,
                          // fontSize: previewSize.size.toString() + "px",
                          // type: previewSize.textType,
                          // text: "Sample text",
                          // ...replaceItem.values,
                        }
                      );
                    } else if (obj.type === "background") {
                      if (obj.subType === "solid") {
                        _replaceObject(
                          obj.objectId!,
                          RECTANGLE,
                          pick(existingObj, "left", "top", "width", "height"),

                          {
                            strokeWidth: 0,
                            strokeColor: undefined,
                            fill: obj.properties.color,
                          }
                        );
                      }
                    }
                  });
                } catch (ex) {
                  //asd
                }
              }}
            >
              {"Apply"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  // NOTE: get largest enabled
  const breakpointConfig: BreakpointConfiguration | undefined = last(
    state.project.settings.breakpoints.breakpointsConfiguration.filter(
      (bc) => bc.enabled
    )
  );

  return {
    project: omit({ ...state.project }, "diff", "clipboard"), //, "selection"
    meta: state.meta,
    slides: state.project.pages,
    layers: state.project.layers,
    objects: state.project.objects,
    breakpointConfig,
    settings: state.project.settings,
    breakpoints: state.project.settings.breakpoints,
    themeClass: state.project.settings.themeClass,
    selectedDevice: state.stage.selectedDevice,
    pages: state.project.pages,
  };
};

const mapDispatchToProps = {
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
  _updateEditor: (editor: Partial<IEditor>) => updateEditor(editor),
  _replaceObject: replaceObject,
};

export default connect(mapStateToProps, mapDispatchToProps)(LayoutToTemplate);
