import React, { useContext, useEffect, useMemo, useState } from "react";
import cx from "classnames";
import { cloneDeep, last, noop, omit, round, uniq, pick } from "lodash-es";
import { connect } from "react-redux";
import { Button, Classes, Dialog, Spinner } from "@blueprintjs/core";
import { IStore } from "../../store/store";
import css from "./LayoutToTemplatePanel.module.scss";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import industries from "../../jsons/industries-with-sub-sub.json";
import documents from "../../panels/create-panel/document.json";

import {
  updateProjectMeta,
  updateEditor,
  replaceObject,
} from "../../store/actions/actions";
import { IntegrationContext } from "../../integration";
import {
  getSelectField,
  getTextArea,
  getTextField,
} from "../../inputs/input-utils";
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
import { blobToBase64 } from "../../utils/file/file-utils";
import {
  collectLayoutObjectsPrompts,
  createLayout2TemplateAIPrompt,
} from "./layout2template-utils";
import { TEXT } from "../../objects/text/text";
import { RECTANGLE } from "../../objects/rectangle/rectangle";
import { useLayoutHook } from "../layouts-panel/useLayoutHook";
import { useTemplateGenerator } from "./useTemplateGenerator";
import { PagePreviewInternal } from "../pages-simplified/PagePreview";
import { createObject } from "../../objects/create-object-factory";
import { useImagesGenerator } from "./useImagesGenerator";
import { IMAGE } from "../../objects/image/image";

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
    // _replaceObject,
  } = props;

  const { getLayouts, getLayout } = useLayoutHook();

  const { generateTemplate } = useTemplateGenerator(); // <<< here
  const { generateImages } = useImagesGenerator(); // <<< here

  const [layoutOptions, setLayoutOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    getLayouts(1, "", 10000).then((response) => {
      const options = response.data.map((item: any) => ({
        label: item.name,
        value: item.id,
      }));

      setLayoutOptions(options);
      setFormState({
        ...formState,
        layout: options.find((o) => o.label === "layout-1000").value,
      });
    });
  }, []);

  const [iaResponse, setIaResponse] = useState("");

  const industriesOptions = industries.industries.reduce<
    {
      label: string;
      value: string;
    }[]
  >((acc, cur, idx) => {
    acc.push({ label: idx + 1 + ". " + cur.name, value: cur.name });

    return cur.subsectors.reduce((acc2, cur2, idx2) => {
      acc2.push({
        label:
          "  " +
          (idx + 1) +
          "." +
          (idx2 + 1) +
          ". " +
          // cur.name +
          // " - " +
          cur2.name,
        value: cur.name + " - " + cur2.name,
      });

      return cur2.subsubsectors.reduce((acc3, cur3, idx3) => {
        acc2.push({
          label:
            "    " +
            (idx + 1) +
            "." +
            (idx2 + 1) +
            "." +
            (idx3 + 1) +
            ". " +
            //+ cur.name + " - " + cur2.name + " - "
            cur3.name,
          value: cur.name + " - " + cur2.name + " - " + cur3.name,
        });
        return acc3;
      }, acc2);

      // return acc2;
    }, acc);
  }, []);

  industriesOptions.unshift({ label: "Select industry...", value: "" });

  // -----

  const documentsOptions = documents.reduce<
    {
      label: string;
      value: string;
    }[]
  >((acc, cur, idx) => {
    acc.push({ label: idx + 1 + ". " + cur.category, value: cur.category });

    return cur.items.reduce((acc2, cur2, idx2) => {
      acc2.push({
        label:
          "  " +
          (idx + 1) +
          "." +
          (idx2 + 1) +
          ". " +
          // cur.name +
          // " - " +
          cur2.category,
        value: cur.category + " - " + cur2.category,
      });

      return cur2.items.reduce((acc3, cur3, idx3) => {
        acc2.push({
          label:
            "    " +
            (idx + 1) +
            "." +
            (idx2 + 1) +
            "." +
            (idx3 + 1) +
            ". " +
            //+ cur.name + " - " + cur2.name + " - "
            cur3.name,
          value: cur.category + " - " + cur2.category + " - " + cur3.name,
        });
        return acc3;
      }, acc2);

      // return acc2;
    }, acc);
  }, []);

  documentsOptions.unshift({ label: "Select document...", value: "" });

  // -----
  const [formState, setFormState] = useState<{
    industry?: string;
    document?: string;
    layout?: string;
    prompt?: string;
  }>({
    document: "Social Media - Instagram - Square Post",
    industry: "Banking & Finance - Retail Banking - Personal Banking",
    layout: "layout-1000",
  });

  const generatePrompt = (formState: any) => {
    const prompt =
      "Generate a complete, stylistically cohesive '" +
      formState.document +
      "'" +
      " for " +
      "'" +
      formState.industry +
      "' based on a provided layout JSON.";

    return prompt;
  };
  useEffect(() => {
    if (!formState.document || !formState.industry) {
      setFormState({ ...formState, prompt: "" });
      return;
    }

    const prompt = generatePrompt(formState);

    console.log(formState);
    setFormState({ ...formState, prompt });
  }, [formState.document, formState.industry]);

  const [layoutJsonRequest, setLayoutJsonRequest] = useState("");
  const [currentLayout, setCurrentLayout] = useState<any>({});
  const [currentTemplate, setCurrentTemplate] = useState<any>({});

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!formState.layout) return;

    getLayout(formState.layout).then((response) => {
      console.log("---- resp");

      console.log(response.project.pages);
      const page1Id = response.project.pages.pages[0];
      if (page1Id) {
        const page1 = response.project.pages.pageById[page1Id];
        const layer1Id = page1.layerIds[0];
        const layer = response.project.layers.layerById[layer1Id];

        const p = createLayout2TemplateAIPrompt(
          response.project.objects.objectById,
          layer.objectIds
        );

        setLayoutJsonRequest(p);
        setCurrentLayout(response);
        setCurrentTemplate(cloneDeep(response));
      }
    });

    // const page1Id = slides.pages[0];
    // if (page1Id) {
    //   const page1 = slides.pageById[page1Id];
    //   const layer1Id = page1.layerIds[0];
    //   const layer = layers.layerById[layer1Id];

    //   return createLayout2TemplateAIPrompt(objects.objectById, layer.objectIds);
    // }
    // return;
  }, [formState.layout]);

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

      <div style={{ display: "flex", gap: "30px" }}>
        <section style={{ width: "500px" }}>
          <div className={css.layout2TemplateHolder}>
            <div className={cx("input100percent-force", css.inputHolder)}>
              {getSelectField(
                "Document",
                formState.document,
                documentsOptions,
                (document) => {
                  setFormState({ ...formState, document });
                },
                { placeholder: "Select industry" }
              )}
            </div>

            <div className={cx("input100percent-force", css.inputHolder)}>
              {getSelectField(
                "Industry",
                formState.industry,
                industriesOptions,
                (industry) => {
                  setFormState({ ...formState, industry });
                },
                { placeholder: "Select industry" }
              )}
            </div>

            <div className={cx("input100percent-force", css.inputHolder)}>
              {getSelectField(
                "Layout",
                formState.layout,
                layoutOptions,
                (layout) => {
                  setFormState({ ...formState, layout });
                },
                { placeholder: "Select layout" }
              )}
            </div>

            <div className={cx("input100percent-force", css.inputHolder)}>
              {getTextArea(
                "Prompt base on Document and Industry",
                formState.prompt,
                (prompt) => {
                  setFormState({ ...formState, prompt });
                },
                "",
                { rows: 3 }
              )}
            </div>

            <div className={cx("input100percent-force", css.inputHolder)}>
              {getTextArea(
                "Simplified Layout for AI",
                layoutJsonRequest,
                () => {},
                "",
                {
                  disabledDebounce: true,
                  rows: 3,
                  readOnly: true,
                }
              )}
            </div>
            <div className={css.actionRow}>
              <div>
                <Button
                  disabled={meta.inSaving}
                  intent="primary"
                  icon="floppy-disk"
                  onClick={async () => {
                    const prompt = generatePrompt(formState);
                    setLoading(true);
                    const response = await generateTemplate({
                      whatToCreate: prompt!,
                      layout: layoutJsonRequest!,
                    });

                    setLoading(false);

                    setIaResponse(
                      JSON.stringify(response.output!, undefined, 2)
                    );
                  }}
                >
                  {"Generate"}
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
                  rows: 3,
                }
              )}
            </div>
            <div className={css.actionRow}>
              <div>
                <Button
                  disabled={meta.inSaving || !iaResponse}
                  intent="primary"
                  icon="floppy-disk"
                  onClick={() => {
                    const newCurrentTemplate = cloneDeep(currentLayout);

                    try {
                      const obj = JSON.parse(iaResponse);
                      obj.objects.forEach((obj) => {
                        const objectId = obj.id;
                        //   const layoutObj = JSON.parse(formState.layout!)
                        //  const objectId = layoutObj[idx].objectId
                        const existingObj =
                          newCurrentTemplate.project.objects.objectById[
                            obj.objectId
                          ];

                        if (obj.type === "text") {
                          replaceLayoutObject(
                            newCurrentTemplate.project,
                            existingObj,
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
                            replaceLayoutObject(
                              newCurrentTemplate.project,
                              existingObj,
                              RECTANGLE,
                              pick(
                                existingObj,
                                "left",
                                "top",
                                "width",
                                "height"
                              ),

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
                      debugger;
                      //asd
                    }

                    setCurrentTemplate(newCurrentTemplate);
                  }}
                >
                  {"Apply"}
                </Button>
                <Button
                  onClick={async () => {
                    setLoading(true);

                    const iaImagesRequest: any[] = [];
                    try {
                      const obj = JSON.parse(iaResponse);
                      obj.objects.forEach((obj) => {
                        if (obj.type === "image" || obj.subType === "image") {
                          const objectId = obj.objectId;
                          const prompt = obj.aiPrompt;
                          iaImagesRequest.push({ objectId, prompt });
                        }
                      });
                    } catch (ex) {
                      debugger;
                    }

                    const response = await generateImages(iaImagesRequest);

                    response.data?.forEach(({ objectId, mediaId }) => {
                      const existingObj =
                        currentTemplate.project.objects.objectById[objectId!];

                      replaceLayoutObject(
                        currentTemplate.project,
                        existingObj,
                        IMAGE,

                        pick(existingObj, "left", "top", "width", "height"),

                        {
                          image: getImageProperties(mediaId!),
                        }
                      );
                    });

                    setCurrentTemplate(cloneDeep(currentTemplate));
                  }}
                >
                  Generate images
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section style={{ width: "500px" }}>
          {currentTemplate.project ? (
            <>
              <PagePreviewInternal
                width={450}
                {...currentTemplate.project}
                page={
                  currentTemplate.project!.pages.pageById[
                    currentTemplate.project!.pages.pages[0]
                  ]
                }
                // layers,
                // objects,

                // breakpointConfig,
                // breakpoints,
                // settings,

                selectedDevice={"device-independent"}
                breakpoints={currentTemplate.project.settings.breakpoints}
                breakpointConfig={
                  currentTemplate.project.settings.breakpoints
                    .breakpointsConfiguration[0]
                }
              />
            </>
          ) : null}
        </section>

        <section> {loading ? "Loading ..." : null}</section>
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

function replaceLayoutObject(
  project: any,
  replaceObject: IObject,
  type: string,
  objectProps: Partial<IObject<{}>>,
  values?: {
    [key: string]: any;
  }
): IObject {
  let object: IObject = {
    ...createObject(type, objectProps, {
      ...values,
      //text: "Sample test",
    }),
    layerId: replaceObject.layerId,
    parentId: replaceObject.layerId,
  };

  object.id = replaceObject.id;

  project.objects.objectById[object.id] = object;
}

function getImageProperties(objectId: string, mediaId: string) {
  return {
    width: 1024,
    height: 1024,
    sourceType: "local",
    sizeType: "original",
    mediaSizes: [
      {
        sizeType: "thumbnail",
        width: 80,
        height: 80,
        sourceFilename: objectId + "-thumbnail.webp",
      },
      {
        sizeType: "small",
        width: 150,
        height: 150,
        sourceFilename: objectId + "-small.webp",
      },
      {
        sizeType: "medium",
        width: 300,
        height: 300,
        sourceFilename: objectId + "-medium.webp",
      },
      {
        sizeType: "large",
        width: 600,
        height: 600,
        sourceFilename: objectId + "-large.webp",
      },
      {
        sizeType: "xlarge",
        width: 900,
        height: 900,
        sourceFilename: objectId + "-xlarge.webp",
      },
      {
        sizeType: "xxlarge",
        width: 1200,
        height: 1200,
        sourceFilename: objectId + "-xxlarge.webp",
      },
      {
        sizeType: "original",
        width: 1024,
        height: 1024,
        sourceFilename: objectId + ".webp",
      },
    ],
    id: objectId,
  };
}
