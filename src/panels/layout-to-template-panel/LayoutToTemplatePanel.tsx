import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import cx from "classnames";
import {
  cloneDeep,
  last,
  noop,
  omit,
  round,
  uniq,
  pick,
  isEmpty,
  isEqual,
  forOwn,
} from "lodash-es";
import { connect } from "react-redux";
import { Alert, Button, Classes, Dialog, Spinner } from "@blueprintjs/core";
import { IStore } from "../../store/store";
import css from "./LayoutToTemplatePanel.module.scss";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import documents from "../../panels/create-panel/document.json";

import {
  updateProjectMeta,
  updateEditor,
  replaceObject,
} from "../../store/actions/actions";
import { IntegrationContext } from "../../integration";
import {
  getCheckboxField,
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
import { useIndustry } from "./useIndustry";
import { getIndustriesOptionFromThree } from "./industry-utils";
import { useColorSetsGenerator } from "./useColorSetsGenerator";
import { ColorPaletteRow } from "../../inputs/color-input/color-palette-row";
import { hexToRGB } from "../../utils/utils";
import { useLayoutGenerator } from "./useLayoutGenerator";

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
  const { getIndustryTree } = useIndustry();
  const { generateTemplate } = useTemplateGenerator(); // <<< here
  const { generateImages, generateVectors } = useImagesGenerator(); // <<< here
  const { generateColorSets } = useColorSetsGenerator();
  const { generateLayout } = useLayoutGenerator();

  const [layoutOptions, setLayoutOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [industriesOptions, setIndustriesOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [selectedColorSetIdx, setSelectedColorSetIdx] = useState(-1);
  const [selectedColorSet, setSelectedColorSet] = useState({});

  const [brandColors, setBrandColors] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const industryThree = await getIndustryTree();
      const options = getIndustriesOptionFromThree(industryThree.industries);
      setIndustriesOptions(options);
    };

    load();
  }, []);

  useEffect(() => {
    getLayouts(1, "", 10000).then((response) => {
      const options = response.data.map((item: any) => ({
        label: item.name,
        value: item.id,
      }));

      options.unshift({ label: "Select layout...", value: "" });

      setLayoutOptions(options);
      setFormState({
        ...formState,
        layout:
          localStorage.getItem("ai-generator-layout") ?? options[0]?.value, //.find((o) => o.label === "layout-1000").value,
      });
    });
  }, []);

  const [iaResponse, setIaResponse] = useState("");
  const [iaColorSetResponse, setColorSetResponse] = useState("");
  const [colorSets, setColorSets] = useState<{
    colors?: Record<string, string>[];
  }>({ colors: [] });

  useEffect(() => {
    try {
      const parsed = JSON.parse(iaColorSetResponse);
      setColorSets(parsed);
    } catch (ex) {
      console.log(ex);
    }
  }, [iaColorSetResponse]);
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
    promptForColorScheme?: string;
    neutralColors?: boolean;
  }>({
    document:
      localStorage.getItem("ai-generator-document") ??
      "Social Media - Instagram - Square Post",
    industry:
      localStorage.getItem("ai-generator-industry") ??
      "Banking & Finance - Retail Banking - Personal Banking",
    layout: localStorage.getItem("ai-generator-layout") ?? "layout-1000",
  });

  const generatePromptForTemplate = (formState: any) => {
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

  const generatePromptForColorSets = (formState: any) => {
    const prompt =
      "Generate 10 color schemes, that are stylistically cohesive for '" +
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

    const prompt = generatePromptForTemplate(formState);
    const promptForColorScheme = generatePromptForTemplate(formState);

    console.log(formState);
    setFormState({ ...formState, prompt, promptForColorScheme });
  }, [formState.document, formState.industry]);

  const [layoutJsonRequest, setLayoutJsonRequest] = useState("");
  const [currentLayout, setCurrentLayout] = useState<any>({});
  const [currentTemplate, setCurrentTemplate] = useState<any>({});

  const [generatedLayout, setGeneratedLayout] = useState<any>({});

  const [generateTemplateLoading, setGenerateTemplateLoading] =
    useState<boolean>(false);
  const [generateColorsLoading, setGenerateColorsLoading] =
    useState<boolean>(false);
  const [generateImagesLoading, setGenerateImagesLoading] =
    useState<boolean>(false);
  const [generateVectorsLoading, setGenerateVectorsLoading] =
    useState<boolean>(false);

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

  useEffect(() => {
    if (
      !isEmpty(selectedColorSet) ||
      (iaResponse && JSON.parse(iaResponse)?.brandColors)
    ) {
      apply();
    }
  }, [selectedColorSet, iaResponse]);

  const apply = useCallback(() => {
    const newCurrentTemplate = cloneDeep(
      !isEmpty(currentTemplate) ? currentTemplate : currentLayout
    );

    // TODO brandColors?.[0]
    let colors =
      JSON.parse(iaResponse).brandColors?.[0] ??
      JSON.parse(iaResponse).brandColors;

    if (!isEmpty(selectedColorSet)) {
      colors = selectedColorSet;
    }

    let aiResponseUpdated = iaResponse;
    forOwn(colors, (color, alias) => {
      if (!color) {
        console.log(color);
        console.log(colors);
        console.log(iaResponse);
      }
      console.log(`{COLOR_${alias.toUpperCase()}}`);

      aiResponseUpdated = aiResponseUpdated.replaceAll(
        `"{COLOR_${alias.toUpperCase()}}"`,
        JSON.stringify(hexToRGB(color))
      );
    });

    console.log(aiResponseUpdated);
    try {
      const obj = JSON.parse(aiResponseUpdated);
      obj.objects.forEach((obj) => {
        const objectId = obj.id;
        //   const layoutObj = JSON.parse(formState.layout!)
        //  const objectId = layoutObj[idx].objectId
        const existingObj =
          newCurrentTemplate.project.objects.objectById[obj.objectId];

        if (obj.type === "text") {
          replaceLayoutObject(
            newCurrentTemplate.project,
            existingObj,
            TEXT,

            pick(existingObj, "left", "top", "width", "height", "rotation"),

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
              pick(existingObj, "left", "top", "width", "height", "rotation"),

              {
                strokeWidth: 0,
                strokeColor: undefined,
                fill: obj.properties.color,
              }
            );
          } else if (obj.subType === "gradient") {
            replaceLayoutObject(
              newCurrentTemplate.project,
              existingObj,
              RECTANGLE,
              pick(existingObj, "left", "top", "width", "height", "rotation"),

              {
                strokeWidth: 0,
                strokeColor: undefined,
                fill: {
                  points: obj.properties.gradient.points,
                  angle: 0,
                },
              }
            );
          }
        }
      });
    } catch (ex) {
      debugger;
      //asd
    }

    setCurrentTemplate(cloneDeep(newCurrentTemplate));
  }, [
    currentTemplate,
    iaResponse,
    selectedColorSet,
    replaceLayoutObject,
    setCurrentTemplate,
  ]);

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
        <section style={{ width: "300px" }}>
          <div className={css.layout2TemplateHolder}>
            <div className={cx("input100percent-force", css.inputHolder)}>
              {getSelectField(
                "Document",
                formState.document,
                documentsOptions,
                (document) => {
                  setFormState({ ...formState, document });
                  localStorage.setItem("ai-generator-document", document!);
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
                  localStorage.setItem("ai-generator-industry", industry!);
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
                  localStorage.setItem("ai-generator-layout", layout!);
                },
                { placeholder: "Select layout" }
              )}
            </div>

            <div className={cx("input60", css.inputHolder)}>
              {getCheckboxField(
                "Use neutral colors",
                formState.neutralColors,
                (neutralColors) => {
                  setFormState({ ...formState, neutralColors });
                },
                "",
                { alignIndicator: "left" }
              )}
            </div>
          </div>

          <div className={css.actionRow}>
            <div>
              <Button
                disabled={meta.inSaving}
                intent="primary"
                icon="floppy-disk"
                onClick={async () => {
                  const prompt = generatePromptForTemplate(formState);
                  setGenerateTemplateLoading(true);

                  generateTemplate({
                    whatToCreate: prompt!,
                    layout: layoutJsonRequest!,
                    neutralColors: formState.neutralColors ? "true" : "false",
                  })
                    .then((response) => {
                      setIaResponse(
                        JSON.stringify(response.output!, undefined, 2)
                      );

                      setBrandColors(response.output!.brandColors?.[0] ?? {});
                    })
                    .catch((ex) => {
                      AppToaster.show({
                        intent: "warning",
                        message: "Template generate has fail.",
                      });
                      console.error(ex);
                    })
                    .finally(() => {
                      setGenerateTemplateLoading(false);
                    });

                  const promptColors = generatePromptForColorSets(formState);
                  setGenerateColorsLoading(true);

                  generateColorSets({
                    whatToCreate: promptColors!,
                    layout: layoutJsonRequest!,
                  })
                    .then((response) => {
                      setColorSetResponse(
                        JSON.stringify(response.output!, undefined, 2)
                      );
                    })
                    .catch((ex) => {
                      AppToaster.show({
                        intent: "warning",
                        message: "Color set generate has fail.",
                      });
                      console.error(ex);
                    })
                    .finally(() => {
                      setGenerateColorsLoading(false);
                    });
                }}
              >
                {"Generate"}
              </Button>
            </div>
          </div>

          {brandColors && !isEmpty(brandColors) ? (
            <div>
              <ColorPaletteRow
                small
                onClick={() => {
                  setSelectedColorSetIdx(-1);
                  setSelectedColorSet({});

                  // setTimeout(() => apply(), 500);
                }}
                selected={selectedColorSetIdx === -1}
                colors={[
                  brandColors.primary,
                  brandColors.secondary,
                  brandColors.background,
                  brandColors.text,
                  brandColors.accent,
                  brandColors.attention,
                ]}
              />
            </div>
          ) : null}
          <div>
            {!isEmpty(colorSets)
              ? colorSets?.colors?.map((colorSet, idx) => (
                  <ColorPaletteRow
                    small
                    onClick={() => {
                      if (selectedColorSetIdx === idx) {
                        setSelectedColorSetIdx(-1);
                        setSelectedColorSet({});
                      } else {
                        setSelectedColorSetIdx(idx);
                        setSelectedColorSet(colorSet);
                      }

                      // setTimeout(() => apply(), 500);
                    }}
                    selected={isEqual(colorSet, selectedColorSet)}
                    colors={[
                      colorSet.primary,
                      colorSet.secondary,
                      colorSet.background,
                      colorSet.text,
                      colorSet.accent,
                      colorSet.attention,
                    ]}
                  />
                ))
              : null}
          </div>

          <div className={css.layout2TemplateHolder}>
            <div className={css.actionRow}>
              <div>
                <Button
                  disabled={meta.inSaving || !iaResponse}
                  intent="primary"
                  icon="floppy-disk"
                  onClick={() => apply()}
                >
                  {"Apply"}
                </Button>
                <Button
                  onClick={async () => {
                    setGenerateImagesLoading(true);

                    const iaImagesRequest: {
                      objectId: string;
                      prompt: string;
                      type: "image";
                      width: string;
                      height: string;
                    }[] = [];
                    try {
                      const obj = JSON.parse(iaResponse);

                      obj.objects.forEach((obj) => {
                        const existingObj: IObject =
                          currentLayout.project.objects.objectById[
                            obj.objectId!
                          ];

                        if (obj.type === "image" || obj.subType === "image") {
                          const objectId = obj.objectId;
                          const prompt = obj.aiPrompt;
                          iaImagesRequest.push({
                            objectId,
                            prompt,
                            type: "image",
                            width: existingObj.width?.toString()!,
                            height: existingObj.height?.toString()!,
                          });
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

                        pick(
                          existingObj,
                          "left",
                          "top",
                          "width",
                          "height",
                          "rotation"
                        ),

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
                <Button
                  onClick={async () => {
                    setGenerateVectorsLoading(true);

                    const iaVectorRequest: {
                      objectId: string;
                      prompt: string;
                      type: "vector";
                    }[] = [];
                    try {
                      const obj = JSON.parse(iaResponse);
                      obj.objects.forEach((obj) => {
                        if (obj.type === "vector" || obj.subType === "vector") {
                          const objectId = obj.objectId;
                          const prompt = obj.aiPrompt;
                          iaVectorRequest.push({
                            objectId,
                            prompt,
                            type: "vector",
                          });
                        }
                      });
                    } catch (ex) {
                      debugger;
                    }

                    const response = await generateVectors(iaVectorRequest);

                    response.data?.forEach(({ objectId, mediaId }) => {
                      const existingObj =
                        currentTemplate.project.objects.objectById[objectId!];

                      replaceLayoutObject(
                        currentTemplate.project,
                        existingObj,
                        IMAGE,

                        pick(
                          existingObj,
                          "left",
                          "top",
                          "width",
                          "height",
                          "rotation"
                        ),

                        {
                          image: getVectorProperties(mediaId!),
                        }
                      );
                    });

                    setCurrentTemplate(cloneDeep(currentTemplate));
                  }}
                >
                  Generate vectors
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section style={{ width: "500px" }}>
          {currentTemplate.project ? (
            <div style={{ height: "360px" }}>
              <PagePreviewInternal
                width={350}
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
            </div>
          ) : null}
          <div>
            <Button
              onClick={async () => {
                const response = await generateLayout({
                  project: JSON.stringify(currentLayout.project, undefined, 2),
                });

                const newLayout = cloneDeep(currentLayout);
                newLayout.project = response.output;

                setGeneratedLayout(newLayout);
              }}
            >
              Generate similar layout
            </Button>
          </div>
          <div>
            {getTextArea(
              "Layout generated",
              JSON.stringify(generatedLayout?.project, undefined, 2),
              (resp: any) => {
                setColorSetResponse(resp);
              },
              "",
              {
                disabledDebounce: true,
                rows: 3,
              }
            )}
          </div>
          <div>
            {generatedLayout.project ? (
              <div style={{ height: "400px" }}>
                <PagePreviewInternal
                  width={350}
                  {...generatedLayout.project}
                  page={
                    generatedLayout.project!.pages.pageById[
                      generatedLayout.project!.pages.pages[0]
                    ]
                  }
                  // layers,
                  // objects,

                  // breakpointConfig,
                  // breakpoints,
                  // settings,

                  selectedDevice={"device-independent"}
                  breakpoints={generatedLayout.project.settings.breakpoints}
                  breakpointConfig={
                    generatedLayout.project.settings.breakpoints
                      .breakpointsConfiguration[0]
                  }
                />
              </div>
            ) : null}
          </div>
        </section>

        <section style={{ width: "500px" }}>
          {generateImagesLoading ? <p>Generate images ...</p> : null}
          {generateColorsLoading ? <p>Generate colors ...</p> : null}
          {generateTemplateLoading ? <p>Generate template ...</p> : null}
          {generateVectorsLoading ? <p>Generate vectors ...</p> : null}

          <div className={cx("input100percent-force", css.inputHolder)}>
            {getTextArea(
              "Prompt for ColorsSet base on Document and Industry",
              formState.promptForColorScheme,
              (promptForColorScheme) => {
                setFormState({ ...formState, promptForColorScheme });
              },
              "",
              { rows: 3 }
            )}
          </div>

          {/* <div className={css.actionRow}>
            <div>
              <Button
                disabled={meta.inSaving}
                intent="primary"
                icon="floppy-disk"
                onClick={async () => {
                  const prompt = generatePromptForColorSets(formState);
                  setLoading(true);
                  const response = await generateColorSets({
                    whatToCreate: prompt!,
                    layout: layoutJsonRequest!,
                  });

                  setLoading(false);

                  setColorSetResponse(
                    JSON.stringify(response.output!, undefined, 2)
                  );
                }}
              >
                {"Generate"}
              </Button>
            </div>
          </div> */}
          <div className={cx("input100percent-force", css.inputHolder)}>
            {getTextArea(
              "AI Response",
              iaColorSetResponse,
              (resp: any) => {
                setColorSetResponse(resp);
              },
              "",
              {
                disabledDebounce: true,
                rows: 3,
              }
            )}
          </div>
        </section>
        <section style={{ width: "300px" }}>
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
        </section>
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

function getImageProperties(mediaId: string) {
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
        sourceFilename: mediaId + "-thumbnail.webp",
      },
      {
        sizeType: "small",
        width: 150,
        height: 150,
        sourceFilename: mediaId + "-small.webp",
      },
      {
        sizeType: "medium",
        width: 300,
        height: 300,
        sourceFilename: mediaId + "-medium.webp",
      },
      {
        sizeType: "large",
        width: 600,
        height: 600,
        sourceFilename: mediaId + "-large.webp",
      },
      {
        sizeType: "xlarge",
        width: 900,
        height: 900,
        sourceFilename: mediaId + "-xlarge.webp",
      },
      {
        sizeType: "xxlarge",
        width: 1200,
        height: 1200,
        sourceFilename: mediaId + "-xxlarge.webp",
      },
      {
        sizeType: "original",
        width: 1024,
        height: 1024,
        sourceFilename: mediaId + ".webp",
      },
    ],
    id: mediaId,
  };
}

function getVectorProperties(mediaId: string) {
  return {
    width: 1024,
    height: 1024,
    sourceType: "local",
    sizeType: "original",
    mediaSizes: [
      {
        sizeType: "original",
        width: 1024,
        height: 1024,
        sourceFilename: mediaId + ".svg",
      },
    ],
    id: mediaId,
  };
}
