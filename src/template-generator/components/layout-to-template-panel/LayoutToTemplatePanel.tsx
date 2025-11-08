import React, {
  PropsWithChildren,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  set,
} from "lodash-es";
import { connect } from "react-redux";
import {
  Alert,
  Button,
  Classes,
  Dialog,
  OptionProps,
  Spinner,
} from "@blueprintjs/core";
import { IStore } from "../../../store/store";
import css from "./LayoutToTemplatePanel.module.scss";
import { IObject } from "webslider-sdk/lib/objects/i-object";
// import documents from "../../../panels/create-panel/document.json";

import {
  updateProjectMeta,
  updateEditor,
  replaceObject,
  addNewObject,
  openProject,
  doClearHistory,
  activateSlide,
  selectSlides,
  selectForPropertiesProps,
  selectForProperties,
  setDevice,
} from "../../../store/actions/actions";
import {
  getButtonGroupField,
  getCheckboxField,
  getSelectField,
  getTextArea,
  getTextField,
} from "../../../inputs/input-utils";
import { IMeta } from "../../../store/reducers/meta";

import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { AppToaster } from "../../../utils/components/app-toaster/AppToaster";
import { IEditor } from "../../../store/reducers/editor";
import {
  PanelHeader,
  RightPanelHeader,
} from "../../../panels/common/panel-header/PanelHeader";

import {
  collectLayoutObjectsPrompts,
  createLayout2TemplateAIPrompt,
  mergeAiTemplateAndSimplifiedLayout,
} from "./layout2template-utils";
import { TEXT } from "../../../objects/text/text";
import { RECTANGLE } from "../../../objects/rectangle/rectangle";
import { useAiPrompt } from "../../hooks/useTemplateGenerator";
import { createObject } from "../../../objects/create-object-factory";
import { useImagesGenerator } from "../../hooks/useImagesGenerator";
import { IMAGE } from "../../../objects/image/image";
import { useIndustry } from "../../hooks/useIndustry";
import { getIndustriesOptionFromThree } from "./industry-utils";
import { useColorSetsGenerator } from "./useColorSetsGenerator";
import { ColorPaletteRow } from "../../../inputs/color-input/color-palette-row";
import { hexToRGB } from "../../../utils/utils";
import { useLayoutGenerator } from "../../hooks/useLayoutGenerator";
import { useLayoutHook } from "../../../panels/layouts-panel/useLayoutHook";
import { PagePreviewInternal } from "../../../panels/pages-simplified/PagePreview";
import { useVectorsGenerator } from "../../hooks/useVectorsGenerator";
import { useGeneratorHook } from "../../../panels/layouts-panel/useGeneratorHook";
import { useDocumentsType } from "../../hooks/useDocumentType";
import { getDocumentsOptionFromThree } from "./documents-type-utils";
import {
  AiProcessingStatus,
  AiPrompt,
  AiPromptKind,
  AiPromptStatus,
} from "../../types/ai-prompts";
import { PromptItems } from "../prompts-table/prompt-items";
import { usePolling } from "../../hooks/usePolling";
import { convertLayout2SimplifiedLayout } from "../../utils/simplified-layout-utils";
import { createImageJsonRequest } from "../../utils/ai-response-utils";
import { AITemplatePreview } from "../ai-template-preview/ai-template-preview";
import {
  collectImagesFromIaResponse,
  collectVectorFromIaResponse,
} from "../../utils/update-layout-utils";
import { IndustrySelect } from "./industry-select/industry-select";
import { preloadFonts } from "../../../utils/project/project-utils";
import { getMissingExtensionsFromProject } from "../../../utils/extensions/extensions-utils";
import { ISettings } from "../../../store/reducers/i-settings";
import { IPages } from "../../../store/reducers/i-pages";
import {
  LayoutReviewStatus,
  layoutReviewStatusOptions,
} from "../../types/layout";
import { LayoutSelect } from "./layout-select/layout-select";
import { AdvancedPagination } from "../pagination/pagination";
import ProcessTemplates from "../process-templates/process-templates";

export const THUMB_WIDTH = 200;

interface ILayout2TemplateProps {
  onRequestClose: () => void;
}

export type ILayout2TemplateMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ILayout2TemplateProps;

const LayoutToTemplate = (
  props: PropsWithChildren<ILayout2TemplateMergedProps>
): ReactElement | null => {
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
    _activateSlide,
    _addNewObject,
    _doClearHistory,
    _openProject,
    _replaceObject,
    _resetChangedState,
    _selectForProperties,
    _selectSlides,
    _setDevice,
  } = props;
  const { getLayoutSetsWithLayouts } = useGeneratorHook();

  const [processTemplatesOpen, setProcessTemplatesOpen] = useState(false);

  const { getLayouts, getLayout, patchLayout } = useLayoutHook();
  const { getIndustryTree } = useIndustry();
  const { getDocumentTypeTree } = useDocumentsType();
  const {
    addTemplatePrompt,
    generateTemplate,
    getTemplateGeneratorPrompts,
    addColorSetPrompt,
    addImagePrompt,
    addLayoutPrompt,
    updatePrompt,
    generateImageOrVector,
    generateLayout,
  } = useAiPrompt(); // <<< here
  // const { generateImages } = useImagesGenerator(); // <<< here
  // const { generateVectors } = useVectorsGenerator(); // <<< here

  // const { generateColorSets } = useColorSetsGenerator();
  // const { generateLayout } = useLayoutGenerator();

  const [layoutOptions, setLayoutOptions] = useState<OptionProps[]>([]);

  const [industriesOptions, setIndustriesOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // const [selectedColorSetIdx, setSelectedColorSetIdx] = useState(-1);
  // const [selectedColorSet, setSelectedColorSet] = useState({});

  // const [brandColors, setBrandColors] = useState<any>(null);

  const [formState, setFormState] = useState<{
    industryId?: string;
    documentTypeId?: string;
    layoutId?: string;
    prompt?: string;
    promptForColorScheme?: string;
    neutralColors?: boolean;
    uncrowdedImages?: boolean;
    noAnyWritingsInImages?: boolean;
    noHandsInImages?: boolean;
  }>({
    documentTypeId:
      localStorage.getItem("ai-generator-document") ??
      "Social Media - Instagram - Square Post",
    industryId:
      localStorage.getItem("ai-generator-industry") ??
      "Banking & Finance - Retail Banking - Personal Banking",
    layoutId: localStorage.getItem("ai-generator-layout") ?? "layout-1000",
  });

  useEffect(() => {
    const filter = formState?.documentTypeId
      ? { documentTypeId: formState?.documentTypeId }
      : undefined;

    getLayoutSetsWithLayouts(filter).then((response) => {
      const options: {
        disabled?: boolean;
        label?: string;
        value: string;
        reviewState?: LayoutReviewStatus;
      }[] = [{ label: "Select layout ....", value: "" }];

      response.forEach((layoutSet) => {
        options.push({
          disabled: true,
          label: layoutSet.name,
          value: layoutSet.id,
        });

        layoutSet.layouts.forEach((layout) => {
          options.push({
            // className: css.red,
            label: "    " + layout.name,
            value: layout.id,
            reviewState: layout.reviewState,
          });
        });
      });

      setLayoutOptions(options);

      const exist = !!options.find((value) => {
        return value.value === formState.layoutId;
      });
      if (!exist) {
        setFormState({ ...formState, layoutId: "" });
      }
      console.log(response);
    });
  }, [formState?.documentTypeId]);

  useEffect(() => {
    const load = async () => {
      const industryThree = await getIndustryTree();
      const options = getIndustriesOptionFromThree(industryThree.industries);
      setIndustriesOptions(options);
    };

    load();
  }, []);

  const [documentsOptions, setDocumentsOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    const load = async () => {
      const documentsThree = await getDocumentTypeTree();
      console.log(documentsThree);
      const options = getDocumentsOptionFromThree(documentsThree.documents);
      setDocumentsOptions(options);
    };

    load();
  }, []);

  const [layoutDataById, setLayoutDataById] = useState<
    Record<string, { layout: any; simplifiedLayout: any }>
  >({});

  console.log(layoutDataById, "layoutDataById");

  useEffect(() => {
    if (!formState.layoutId) return;

    getLayout(formState.layoutId).then((layoutResponse) => {
      const simplifiedLayout = convertLayout2SimplifiedLayout(layoutResponse);

      if (simplifiedLayout) {
        setLayoutDataById((prev) => ({
          ...prev,
          ...{
            [formState.layoutId!]: { layout: layoutResponse, simplifiedLayout },
          },
        }));
      } else {
        console.info("Error: Simplified layout is not created.");
        console.info("Layout response:");
        console.log(layoutResponse);
      }
    });
  }, [formState.layoutId]);

  // const [aiPrompts, setAiPrompts] = useState<AiPrompt[]>();

  // useEffect(() => {
  //   getTemplateGeneratorPrompts({}).then((response) => {
  //     setAiPrompts(response.prompts);
  //   });
  // }, []);
  const [filters, setFilters] = useState({
    aiGenPerPage: localStorage?.getItem("aiGenPerPage") ?? "5",
    aiGenCurrentUser: localStorage?.getItem("aiGenCurrentUser"),
    aiGenProcessingComplete: localStorage?.getItem("aiGenProcessingComplete"),
    aiGenProcessingStatus: localStorage?.getItem("aiGenProcessingStatus"),
  });

  const poolingFunc = useCallback(() => {
    return getTemplateGeneratorPrompts({
      ...(filtersRef.current.aiGenProcessingStatus
        ? {
            processingStatus: filtersRef.current
              .aiGenProcessingStatus as AiProcessingStatus,
          }
        : {}),

      ...(filtersRef.current.aiGenProcessingComplete
        ? {
            processingComplete:
              filtersRef.current.aiGenProcessingComplete === "complete",
          }
        : {}),

      ...(filtersRef.current.aiGenCurrentUser
        ? {
            forUserUID: filtersRef.current.aiGenCurrentUser as string,
          }
        : {}),

      limit: (filtersRef.current.aiGenPerPage as string) ?? "10",
      page: (filtersRef.current.aiGenPage as string) ?? "1",
    });
  }, []);

  const {
    data,
    isLoading,
    error,
    pollCount,
    startPolling,
    stopPolling,
    restartPolling: restartPolingOriginal,
    restartWithNewParams,
    refetch,
    isPolling,
  } = usePolling(poolingFunc, undefined, false);

  useEffect(() => {
    restartPolling();
  }, []);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const restartPolling = () => {
    stopPolling();

    setTimeout(() => {
      const perPage = parseInt(
        filtersRef.current.aiGenPerPage ??
          localStorage?.getItem("aiGenPerPage") ??
          "5"
      );
      if (perPage <= 10) {
        restartPolingOriginal();
      } else {
        refetch();
      }
    }, 50);
  };

  const aiPrompts = useMemo(() => {
    return data?.data;
  }, [data]);

  const pagination = useMemo(() => {
    return data?.pagination;
  }, [data]);

  // useEffect(() => {
  //   if (aiPrompts) {
  //     aiPrompts.forEach((aiPrompt) => {
  //       if (aiPrompt.status === AiPromptStatus.INIT) {
  //         generateTemplate(aiPrompt.id);
  //       }
  //       aiPrompt.childPrompts?.forEach((childAiPrompt) => {
  //         if (childAiPrompt.status === AiPromptStatus.INIT) {
  //           generateTemplate(childAiPrompt.id);
  //         }
  //       });
  //     });
  //   }
  // }, [aiPrompts]);

  // useEffect(() => {
  //   const load = async () => {
  //     const industryThree = await getIndustryTree();
  //     const options = getIndustriesOptionFromThree(industryThree.industries);
  //     setIndustriesOptions(options);
  //   };

  //   load();
  // }, []);

  const currentLayoutData = layoutDataById[formState.layoutId!];

  const onGenerateAll = async (parentPromptId: string) => {
    stopPolling();
    await onGenerateColors(parentPromptId);
    await onGenerateImagesOrVectors(parentPromptId, AiPromptKind.IMAGE);
    await onGenerateImagesOrVectors(parentPromptId, AiPromptKind.VECTOR);
    restartPolling();
  };

  const onGenerateColors = async (parentPromptId: string) => {
    const prompt = aiPrompts?.find((p) => p.id === parentPromptId);

    if (prompt) {
      const { documentType, industry, layout } = prompt;

      if (documentType && industry && layout) {
        const response = await addColorSetPrompt({
          parentPromptId: prompt.id,
          promptKind: AiPromptKind.COLOR_PALETTE,
          documentTypeId: documentType.id,
          industryId: industry.id,
          layoutId: layout.id,
          simplifiedLayout: prompt.simplifiedLayout,
        });

        // debugger;
        await generateTemplate(response?.prompt?.id);
      }
    }
  };

  const onGenerateImagesOrVectors = async (
    parentPromptId: string,
    promptKind: AiPromptKind.IMAGE | AiPromptKind.VECTOR
  ) => {
    const aiPrompt = aiPrompts?.find((p) => p.id === parentPromptId);
    // debugger;

    const simplifiedLayoutObj = JSON.parse(aiPrompt.simplifiedLayout);
    // debugger;
    const imagePrompts =
      promptKind === AiPromptKind.IMAGE
        ? collectImagesFromIaResponse(aiPrompt?.aiResponseJson)
        : collectVectorFromIaResponse(aiPrompt?.aiResponseJson);

    if (aiPrompt) {
      const { documentType, industry, layout } = aiPrompt;

      if (documentType && industry && layout) {
        const layoutResponse = await getLayout(layout.id);

        for (const iPrompt of imagePrompts) {
          const existingObj: IObject =
            layoutResponse.project.objects.objectById[iPrompt.objectId!];

          const imageOnePerson = simplifiedLayoutObj.find(
            (item) => item.objectId === iPrompt.objectId
          )?.prompt?.imageOnePerson;

          const response = await addImagePrompt({
            parentPromptId: aiPrompt.id,
            promptKind: promptKind,
            documentTypeId: documentType.id,
            industryId: industry.id,
            layoutId: layout.id,
            simplifiedLayout: aiPrompt.simplifiedLayout,
            neutralColors: aiPrompt.neutralColors ? "true" : "false",
            noAnyWritingsInImages: aiPrompt.noAnyWritingsInImages
              ? "true"
              : "false",
            noHandsInImages: aiPrompt.noHandsInImages ? "true" : "false",
            uncrowdedImages: aiPrompt.uncrowdedImages ? "true" : "false",
            imagePrompt: iPrompt.prompt,
            vectorPrompt: iPrompt.prompt,
            metadata: {
              objectWidth: existingObj.width!,
              objectHeight: existingObj.height!,
              objectId: iPrompt.objectId!,
              vectorColor: (iPrompt as any).color,
              ...("vectorObjectType" in iPrompt
                ? { vectorObjectType: iPrompt.vectorObjectType }
                : {}),
              ...(imageOnePerson ? { imageOnePerson: imageOnePerson } : {}),
            },
          });

          await generateImageOrVector(response?.prompt?.id);
        }
      }
    }
  };

  const onGenerateLayouts = async (parentPromptId: string) => {
    const aiPrompt = aiPrompts?.find((p) => p.id === parentPromptId);
    // debugger;

    const howMany = 5;

    // debugger;
    if (aiPrompt) {
      const { documentType, industry, layout } = aiPrompt;

      if (documentType && industry && layout) {
        const layoutResponse = await getLayout(layout.id);

        const aiTemplateWithSimplifiedLayout =
          mergeAiTemplateAndSimplifiedLayout(
            JSON.parse(aiPrompt.simplifiedLayout),
            aiPrompt.aiResponseJson
          );

        for (let i = 0; i < howMany; i++) {
          const response = await addLayoutPrompt({
            parentPromptId: aiPrompt.id,
            promptKind: AiPromptKind.LAYOUT,
            documentTypeId: documentType.id,
            industryId: industry.id,
            layoutId: layout.id,
            simplifiedLayout: aiPrompt.simplifiedLayout,
            aiTemplateWithSimplifiedLayout,
            neutralColors: aiPrompt.neutralColors ? "true" : "false",
            noAnyWritingsInImages: aiPrompt.noAnyWritingsInImages
              ? "true"
              : "false",
            noHandsInImages: aiPrompt.noHandsInImages ? "true" : "false",
            uncrowdedImages: aiPrompt.uncrowdedImages ? "true" : "false",
          });

          await generateLayout(response?.prompt?.id);
        }
      }
    }
  };

  const onUpdatePrompts = (id: string, prompt: Partial<AiPrompt>) => {
    updatePrompt(id, prompt).then(() => {
      restartPolling();
    });
  };

  const onEditNewLayout = (response: any) => {
    const meta: IMeta = {
      id: undefined, //response.project.id,
      name: response.name,
      description: response.description,
      // modified: response.modified,
      // created: response.created,
      saveRevision: 0,
      //publishRevision: response.project.publishRevision,
    };
    _updateProjectMeta(meta);

    const project: {
      // NOTE: there are other props. We need only settings from project
      settings: ISettings;
      pages: IPages;
    } = response.project;

    // const { updatedProject, fromToIds } = updateProjectWithNewIds(project);

    const updatedProject = project;

    _openProject(updatedProject);

    _setDevice(
      [...updatedProject.settings.breakpoints.breakpointsConfiguration]
        .reverse()
        .find((bc) => bc.enabled)?.type || "device-independent"
    );

    // missing extensions >>>
    const missingExtensions = getMissingExtensionsFromProject(
      response.extensions
    );
    _updateEditor({ missingExtensions });
    if (missingExtensions.length > 0) {
      AppToaster.show({
        intent: "warning",
        message:
          "Missing Extension found! Go to Library > Extensions to install missing extensions.",
      });
    }
    // missing extensions <<<

    _doClearHistory();

    const slideIdToSelect = updatedProject.pages.pages[0];
    if (slideIdToSelect) {
      _activateSlide(slideIdToSelect);
      _selectSlides([slideIdToSelect]);
      _selectForProperties({ id: slideIdToSelect, type: "slide" });
    }

    _updateEditor({ sliderChanged: true, isExistingProject: false });

    _doClearHistory();

    _resetChangedState();

    preloadFonts(response?.fonts ?? []);

    onRequestClose();

    // _createNewProject();
    // _doClearHistory();
    // _initializeSlideAndLayer();
    // _updateEditor({ isExistingProject: false, sliderChanged: false });
    // if (isDiscartConfirmOpen) {
    //   setIsDiscartConfirmOpen(false);
    // }
  };

  return (
    <div className={cx(themeClass, css.layout2TemplatePanel)}>
      <RightPanelHeader>
        <div>
          GENERATE AI TEMPLATE{" "}
          <Button
            small
            onClick={() => {
              setProcessTemplatesOpen(true);
            }}
          >
            Process templates
          </Button>
        </div>
        <div className={css.saving}>
          {meta.inSaving && (
            <>
              <Spinner size={16} /> Saving...
            </>
          )}
        </div>
        <div>
          <AdvancedPagination
            {...pagination}
            onPageChange={(page) => {
              setFilters({ ...filters, aiGenPage: page });
              restartPolling();
            }}
          />
        </div>
        <div style={{ margin: "10px" }}>
          <p>Total prompts: {pagination?.totalCount}</p>
        </div>

        <>
          {getSelectField(
            "",
            filters.aiGenPerPage,
            [
              {
                label: "5 - Recommended",
                value: "5",
              },

              {
                label: "10",
                value: "10",
              },

              {
                label: "50 - Disabled Auto Update",
                value: "50",
              },

              {
                label: "100 - Disabled Auto Update",
                value: "100",
              },
            ],
            (value) => {
              localStorage?.setItem("aiGenPerPage", value);
              setFilters({ ...filters, aiGenPerPage: value });
              restartPolling();
            }
          )}
        </>

        <>
          {getSelectField(
            "",
            localStorage?.getItem("aiGenCurrentUser"),
            [
              {
                label: "Current user",
                value: "",
              },

              {
                label: "Srdjan",
                value: "cb43c3de-6418-4e29-8fa5-bbc5aed56c92",
              },
              { label: "Petar", value: "9e70f8e7-c2fa-441d-bc5f-4de37845e670" },
              {
                label: "Jelena",
                value: "10dea6a6-5b21-4a9f-b946-d54f89f23af4",
              },
            ],
            (value) => {
              localStorage?.setItem("aiGenCurrentUser", value ?? "");
              setFilters({ ...filters, aiGenCurrentUser: value });
              restartPolling();
            }
          )}
        </>

        <>
          {getSelectField(
            "",
            localStorage?.getItem("aiGenProcessingComplete"),
            [
              {
                label: "Completed",
                value: "complete",
              },
              { label: "Not completed", value: "notcompleted" },
            ],
            (value) => {
              localStorage?.setItem("aiGenProcessingComplete", value!);
              setFilters({ ...filters, aiGenProcessingComplete: value });
              restartPolling();
            }
          )}
        </>

        <>
          {getSelectField(
            "",
            localStorage?.getItem("aiGenProcessingStatus"),
            [
              { label: "All", value: "" },
              {
                label: "Not processed",
                value: AiProcessingStatus.NOT_PROCESSED,
              },
              { label: "In progress", value: AiProcessingStatus.IN_PROGRESS },

              { label: "Approved", value: AiProcessingStatus.APPROVED },
              { label: "Rejected", value: AiProcessingStatus.REJECTED },
            ],
            (value) => {
              localStorage?.setItem("aiGenProcessingStatus", value ?? "");
              setFilters({ ...filters, aiGenProcessingStatus: value });
              restartPolling();
            }
          )}
        </>
      </RightPanelHeader>

      <div style={{ display: "flex", gap: "30px" }}>
        <section style={{ width: "380px" }}>
          <div className={css.layout2TemplateHolder}>
            <div className={cx("input100percent-force", css.inputHolder)}>
              {getSelectField(
                "Document",
                formState.documentTypeId,
                documentsOptions,
                (document) => {
                  setFormState({ ...formState, documentTypeId: document });
                  localStorage.setItem("ai-generator-document", document!);
                },
                { placeholder: "Select industry" }
              )}
            </div>
            {/* <div className={cx("input100percent-force", css.inputHolder)}>
              {getSelectField(
                "Layout",
                formState.layoutId,
                layoutOptions,
                (layout) => {
                  setFormState({ ...formState, layoutId: layout });
                  localStorage.setItem("ai-generator-layout", layout!);
                },
                { placeholder: "Select layout" }
              )}
            </div> */}
            <LayoutSelect
              industriesOptions={layoutOptions}
              value={formState.layoutId}
              onChange={(layoutId: string) => {
                setFormState({ ...formState, layoutId: layoutId });
                localStorage.setItem("ai-generator-layout", layoutId!);
              }}
            />

            {/* <div className={cx("input100percent-force", css.inputHolder)}>
              {getSelectField(
                "Industry",
                formState.industryId,
                industriesOptions,
                (industryId) => {
                  setFormState({ ...formState, industryId });
                  localStorage.setItem("ai-generator-industry", industryId!);
                },
                { placeholder: "Select industry" }
              )}
            </div> */}

            <IndustrySelect
              industriesOptions={industriesOptions}
              value={formState.industryId}
              onChange={(industryId: string) => {
                setFormState({ ...formState, industryId });
                localStorage.setItem("ai-generator-industry", industryId!);
              }}
            />

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
            <div className={cx("input60", css.inputHolder)}>
              {getCheckboxField(
                "Uncrowded images",
                formState.uncrowdedImages,
                (uncrowdedImages) => {
                  setFormState({ ...formState, uncrowdedImages });
                },
                "",
                { alignIndicator: "left" }
              )}
            </div>
            <div className={cx("input60", css.inputHolder)}>
              {getCheckboxField(
                "No writings (text, numbers, etc.)",
                formState.noAnyWritingsInImages,
                (noAnyWritingsInImages) => {
                  setFormState({ ...formState, noAnyWritingsInImages });
                },
                "",
                { alignIndicator: "left" }
              )}
            </div>
            <div className={cx("input60", css.inputHolder)}>
              {getCheckboxField(
                "No hands",
                formState.noHandsInImages,
                (noHandsInImages) => {
                  setFormState({ ...formState, noHandsInImages });
                },
                "",
                { alignIndicator: "left" }
              )}
            </div>
          </div>

          <div>
            {currentLayoutData?.layout ? (
              <div style={{ height: "290px", paddingTop: "20px" }}>
                <AITemplatePreview
                  currentProject={currentLayoutData.layout.project}
                />
                {/* <PagePreviewInternal
                  width={250}
                  {...currentLayoutData.layout.project}
                  page={
                    currentLayoutData.layout.project.pages.pageById[
                      currentLayoutData.layout.project.pages.pages[0]
                    ]
                  }
                  selectedDevice={"device-independent"}
                  breakpoints={
                    currentLayoutData.layout.project.settings.breakpoints
                  }
                  breakpointConfig={
                    currentLayoutData.layout.project.settings.breakpoints
                      .breakpointsConfiguration[0]
                  }
                /> */}
              </div>
            ) : null}
          </div>

          {JSON.stringify(layoutDataById?.[formState.layoutId!]?.layout?.id)}
          <div>
            {getButtonGroupField(
              "Layout review",
              layoutDataById[formState.layoutId!]?.layout.reviewState,
              (value) => {
                if (!formState.layoutId) return;

                patchLayout(formState.layoutId, { reviewState: value }).then(
                  () => {
                    const clone = cloneDeep(layoutDataById);
                    set(
                      clone,
                      `${formState.layoutId}.layout.reviewState`,
                      value
                    );

                    setLayoutDataById(clone);

                    //
                    const newLayoutOptions = cloneDeep(layoutOptions);

                    const opt = newLayoutOptions.find(
                      (op) => op.value === formState.layoutId
                    );
                    if (opt) {
                      opt.reviewState = value;
                    }

                    setLayoutOptions(newLayoutOptions);

                    //
                  }
                );
              },
              layoutReviewStatusOptions
            )}
          </div>
          <div className={css.actionRow}>
            <div>
              <Button
                disabled={
                  meta.inSaving ||
                  !layoutDataById[formState.layoutId!]?.simplifiedLayout
                }
                intent="primary"
                icon="floppy-disk"
                onClick={async () => {
                  // const prompt = generatePromptForTemplate(formState);

                  const {
                    documentTypeId,
                    industryId,
                    layoutId,
                    neutralColors,
                    uncrowdedImages,
                    noAnyWritingsInImages,
                    noHandsInImages,
                  } = formState;
                  if (documentTypeId && industryId && layoutId) {
                    addTemplatePrompt({
                      promptKind: AiPromptKind.TEMPLATE,
                      documentTypeId: documentTypeId,
                      industryId: industryId,
                      layoutId: layoutId,
                      neutralColors: neutralColors ? "true" : "false",
                      uncrowdedImages: uncrowdedImages ? "true" : "false",
                      noAnyWritingsInImages: noAnyWritingsInImages
                        ? "true"
                        : "false",
                      noHandsInImages: noHandsInImages ? "true" : "false",
                      simplifiedLayout:
                        layoutDataById[formState?.layoutId!].simplifiedLayout,
                    })
                      .then((response) => {
                        // reload.....
                        generateTemplate(response?.prompt?.id);
                      })
                      .finally(() => {
                        // reload.....
                        restartPolling();
                      });

                    return;
                  }
                  console.log("ERROR A1");
                  // debugger;
                }}
              >
                {"Generate"}
              </Button>
            </div>
          </div>
        </section>

        <section>
          {aiPrompts ? (
            <PromptItems
              aiPrompts={aiPrompts}
              onGenerateAll={onGenerateAll}
              onGenerateColors={onGenerateColors}
              onGenerateImages={(parentPromptId: string) => {
                stopPolling();
                onGenerateImagesOrVectors(parentPromptId, AiPromptKind.IMAGE);
                restartPolling();
              }}
              onGenerateVectors={(parentPromptId: string) => {
                stopPolling();
                onGenerateImagesOrVectors(parentPromptId, AiPromptKind.VECTOR);
                restartPolling();
              }}
              onGenerateLayouts={(parentPromptId: string) => {
                stopPolling();
                onGenerateLayouts(parentPromptId);
                restartPolling();
              }}
              updatePrompt={onUpdatePrompts}
              onEditNewLayout={onEditNewLayout}
            />
          ) : (
            "Loading prompts..."
          )}
        </section>
      </div>
      <ProcessTemplates
        forUserUid={filters.aiGenCurrentUser}
        open={processTemplatesOpen}
        onRequestClose={() => {
          setProcessTemplatesOpen(false);
        }}
      />
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
  _resetChangedState: () =>
    updateEditor({ sliderChanged: false, isExistingProject: true }),
  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>,
    values?: { [key: string]: any }
  ) => addNewObject(layerId, type, objectProps, values),
  _openProject: (project: any) => openProject(project),
  _doClearHistory: () => doClearHistory(),
  _activateSlide: (id: string): any => activateSlide(id),
  _selectSlides: (ids: string[]): any => selectSlides(ids),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
  _setDevice: setDevice,
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
) {
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
