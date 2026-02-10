import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Elevation,
  H5,
  Text,
  Tag,
  Intent,
  Collapse,
  Button,
  Classes,
  Icon,
  FormGroup,
  ControlGroup,
  IconProps,
  Divider,
  Checkbox,
  Spinner,
  SpinnerSize,
} from "@blueprintjs/core";
import {
  AiProcessingStatus,
  AiPrompt,
  AiPromptKind,
  AiPromptStatus,
} from "../../types/ai-prompts";
import {
  ColorSetPromptCard,
  ColorSetPromptCardView,
} from "./color-set-prompt-card";
import { ColorTheme } from "../../types/colors";
import { AITemplatePreview } from "../ai-template-preview/ai-template-preview";
import { useLayoutGenerator } from "../../hooks/useLayoutGenerator";
import { useLayoutHook } from "../../../panels/layouts-panel/useLayoutHook";
import {
  collectTextFromIaResponse,
  updateTemplate,
} from "../../utils/update-layout-utils";
import { ImagePromptListView } from "./image-prompt-card";
import { after, cloneDeep, pick, set } from "lodash-es";
import { string } from "yup";
import { LayoutPromptListView } from "./layout-prompt-card";
import {
  getButtonGroupField,
  getNumericFiled,
  getTextArea,
  getTextField,
} from "../../../inputs/input-utils";
import { get } from "http";
import { useDebounce } from "../../../utils/hooks/use-debounce";

export type SelectedColorPaletteType = {
  promptId: string;
  idx: number;
};

export interface PromptCardProps {
  prompt: AiPrompt;
  onGenerateAll?: (id: string) => void;
  onGenerateColors?: (id: string) => void;
  onGenerateImages?: (id: string, onlyObjectId?: string) => void;
  onGenerateVectors?: (id: string, onlyObjectId?: string) => void;
  onGenerateLayouts?: (id: string) => void;
  updatePrompt?: (
    id: string,
    prompt: {
      processingStatus?: AiProcessingStatus;
      processingComplete?: boolean;
      metadata?: { approved: ColorTheme[] };
      overrideObjectProperties?: Record<string, any>;
      textTranslation?: string;
    },
  ) => void;
  isChild?: boolean;
  onEditNewLayout: (response: any) => void;
  onCreateKeywords?: (id: string) => void;
  onChangeTemplatePublic?: (id: string, isPublic: boolean) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onGenerateAll,
  onGenerateImages,
  onGenerateColors,
  onGenerateVectors,
  onGenerateLayouts,
  updatePrompt,
  onEditNewLayout,
  onCreateKeywords,
  onChangeTemplatePublic,
  isChild,
}) => {
  const [isExpanded, setIsExpanded] = useState(
    !isChild && prompt.childPrompts?.length === 0,
  );

  // const aiResponseJsonObj = useMemo(
  //   () => JSON.parse(prompt.aiResponseJson!),
  //   [prompt.aiResponseJson]
  // );

  const [selectedColorPalette, setSelectedColorPalette] = useState<ColorTheme>(
    prompt.aiResponseJson?.brandColors,
  );

  const [large, setLarge] = useState(false);

  const [approvedColorPalette, setApprovedColorPalette] = useState<{
    [promptId: string]: { [idx: string]: boolean };
  }>({ [prompt.id]: { 0: true } });

  const [approvedImages, setApproverImages] = useState<{
    [promptId: string]: boolean;
  }>({});

  const [approvedTemplate, setApprovedTemplate] = useState<boolean>(true);

  const setColorPaletteStatus = (
    promptId: string,
    idx: number,
    status: boolean | undefined,
    ct: ColorTheme[],
  ) => {
    const newApproved = set(
      cloneDeep(approvedColorPalette),
      `${promptId}.${idx}`,
      status,
    );
    setApprovedColorPalette(newApproved);
    updatePrompt?.(promptId, {
      metadata: { approved: ct },
      processingStatus:
        ct.length === 0
          ? AiProcessingStatus.REJECTED
          : AiProcessingStatus.APPROVED,
    });
  };

  const setImageProcessingStatus = (
    promptId: string,
    status: AiProcessingStatus | undefined,
  ) => {
    updatePrompt?.(promptId, {
      processingStatus: status,
    });
  };

  // useEffect(() => {
  //   if (prompt.promptKind === AiPromptKind.TEMPLATE) {
  //     setSelectedColorPalette(aiResponseJsonObj.brandColors);
  //     debugger;
  //   }
  // }, [aiResponseJsonObj]);

  const colorSetPrompts = useMemo(() => {
    return (
      prompt.childPrompts?.filter((childPrompt) => {
        return childPrompt.promptKind === AiPromptKind.COLOR_PALETTE;
      }) ?? []
    );
  }, [prompt]);

  const imagePrompts = useMemo(() => {
    return (
      prompt.childPrompts?.filter((childPrompt) => {
        return childPrompt.promptKind === AiPromptKind.IMAGE;
      }) ?? []
    );
  }, [prompt]);

  const vectorPrompts = useMemo(() => {
    return (
      prompt.childPrompts?.filter((childPrompt) => {
        return childPrompt.promptKind === AiPromptKind.VECTOR;
      }) ?? []
    );
  }, [prompt]);

  const layoutPrompts = useMemo(() => {
    return (
      prompt.childPrompts?.filter((childPrompt) => {
        return childPrompt.promptKind === AiPromptKind.LAYOUT;
      }) ?? []
    );
  }, [prompt]);

  const { getLayout } = useLayoutHook();

  const [layoutResponse, setLayoutResponse] = useState<any | undefined>();
  const [template, setTemplate] = useState<any | undefined>();
  const [texts, setTexts] = useState<
    { text: string; tag: string; properties: any; objectId: string }[]
  >([]);

  const [overridesObjectProperties, setOverridesObjectProperties_State] =
    useState<Record<string, any>>(
      prompt.overrideObjectProperties
        ? JSON.parse(prompt.overrideObjectProperties)
        : {},
    );

  const debouncedUpdatePrompt = useDebounce(updatePrompt, 500);

  const setOverridesObjectProperties = (overrides: Record<string, any>) => {
    setOverridesObjectProperties_State(overrides);

    debouncedUpdatePrompt?.(prompt.id, {
      overrideObjectProperties: JSON.stringify(overrides),
    });
  };

  const onLayoutReady = (layoutResponseProject) => {
    if (!prompt.aiResponseJson) {
      console.log("ERROR C3");
      return;
    }
    const newTemplate = updateTemplate(
      layoutResponseProject,
      layoutResponseProject,
      prompt.aiResponseJson!,
      selectedColorPalette,
      imagePrompts
        .filter((vp) => vp.processingStatus !== AiProcessingStatus.REJECTED)
        .map((ip) => ip.metadata) as any,
      vectorPrompts
        .filter((vp) => vp.processingStatus !== AiProcessingStatus.REJECTED)
        .map((ip) => ip.metadata) as any,
      overridesObjectProperties,
    );

    setTemplate(newTemplate);

    const textArr = collectTextFromIaResponse(prompt.aiResponseJson!);
    setTexts(textArr);
  };

  useEffect(() => {
    // only if its template
    if (prompt.promptKind !== AiPromptKind.TEMPLATE) return;

    // fromcache
    if (layoutResponse) {
      onLayoutReady(layoutResponse.project);
      return;
    }

    getLayout(prompt.layoutId).then((layoutResponse) => {
      // debugger;
      setLayoutResponse(layoutResponse);

      onLayoutReady(layoutResponse.project);
    });
  }, [
    imagePrompts,
    prompt.layoutId,
    prompt.aiResponseJson,
    prompt.promptKind,
    selectedColorPalette,
    setTexts,
    overridesObjectProperties,
  ]);

  // const onApplyImages = (aiPrompts: AiPrompt[]) => {
  //   const currentTemplate = cloneDeep(template);

  //   aiPrompts?.forEach((prompt) => {
  //     const { objectId, mediaId } = prompt.metadata ?? {};
  //     if (!objectId || !mediaId) {
  //       debugger;
  //       return;
  //     }

  //     const existingObj = currentTemplate.project.objects.objectById[objectId!];

  //     replaceLayoutObject(
  //       currentTemplate.project,
  //       existingObj,
  //       IMAGE,

  //       pick(existingObj, "left", "top", "width", "height", "rotation"),

  //       {
  //         image: getImageProperties(mediaId!),
  //       }
  //     );
  //   });

  //   updateTemplate(cloneDeep(currentTemplate));
  // };

  const remainingImageForReview = useMemo(() => {
    let count = 0;
    imagePrompts.forEach((prompt) => {
      if (prompt.processingStatus === AiProcessingStatus.NOT_PROCESSED) {
        count++;
      }
    });

    return count;
  }, [imagePrompts]);

  const remainingVectorsForReview = useMemo(() => {
    let count = 0;
    vectorPrompts.forEach((prompt) => {
      if (prompt.processingStatus === AiProcessingStatus.NOT_PROCESSED) {
        count++;
      }
    });

    return count;
  }, [vectorPrompts]);

  // Get status badge intent
  const getStatusIntent = (status: AiPromptStatus): Intent => {
    switch (status) {
      case AiPromptStatus.DONE:
        return Intent.SUCCESS;
      case AiPromptStatus.LOADING:
        return Intent.PRIMARY;
      case AiPromptStatus.ERROR:
        return Intent.DANGER;
      case AiPromptStatus.INIT:
      default:
        return Intent.WARNING;
    }
  };

  // Get processing status badge intent
  const getProcessingStatusIntent = (status: AiProcessingStatus): Intent => {
    switch (status) {
      case AiProcessingStatus.APPROVED:
        return Intent.SUCCESS;
      case AiProcessingStatus.IN_PROGRESS:
        return Intent.PRIMARY;
      case AiProcessingStatus.REJECTED:
        return Intent.DANGER;
      case AiProcessingStatus.NOT_PROCESSED:
      default:
        return Intent.NONE;
    }
  };

  // Get prompt kind icon
  const getPromptKindIcon = (kind: AiPromptKind): IconProps["icon"] => {
    switch (kind) {
      case AiPromptKind.TEMPLATE:
        return "application";
      case AiPromptKind.COLOR_PALETTE:
        return "color-fill";
      case AiPromptKind.IMAGE:
        return "media";
      case AiPromptKind.VECTOR:
        return "vector";
      default:
        return "dot";
    }
  };

  const showGenerateAll =
    !prompt.childPrompts || prompt.childPrompts.length === 0;
  const disableIndividual = showGenerateAll;

  const completeDisabled =
    remainingImageForReview > 0 ||
    remainingVectorsForReview > 0 ||
    (prompt.processingStatus === AiProcessingStatus.NOT_PROCESSED &&
      prompt.status !== AiPromptStatus.ERROR);

  const translatedToArr = useMemo(() => {
    const trObj = JSON.parse(prompt.textTranslation);
    return Object.keys(trObj);
  }, [prompt]);

  return (
    <Card elevation={Elevation.TWO} style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyItems: "center",
              marginBottom: 8,
            }}
          >
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ fontSize: "16px" }}>
                <Icon
                  icon={getPromptKindIcon(prompt.promptKind)}
                  size={16}
                  style={{ marginRight: 8 }}
                />
                <strong>
                  {prompt.promptKind !== AiPromptKind.TEMPLATE
                    ? prompt.promptKind + ": "
                    : ""}{" "}
                  {prompt.layout?.name || "Unnamed Layout"}
                </strong>
              </div>
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                {/* <Button large onClick={() => rejectPrompt?.(prompt.id)}>
                  Reject
                </Button> */}
                {!isChild && (
                  <Button
                    large
                    intent={prompt.processingComplete ? "warning" : "primary"}
                    disabled={completeDisabled}
                    onClick={(e) => {
                      let partial = {};
                      if (prompt.textTranslation === "{}") {
                        partial = {
                          textTranslation: JSON.stringify({
                            en: texts.map((item) =>
                              pick(item, "objectId", "properties"),
                            ),
                          }),
                        };
                      }

                      updatePrompt?.(prompt.id, {
                        processingComplete: prompt.processingComplete
                          ? false
                          : true,
                        ...partial,
                      });
                    }}
                  >
                    {prompt.processingComplete
                      ? "Move to NOT completed"
                      : "Complete"}
                  </Button>
                )}
                {prompt.processingComplete && (
                  <Button
                    large
                    intent={"primary"}
                    disabled={completeDisabled}
                    onClick={(e) => {
                      let partial = {};
                      if (prompt.textTranslation === "{}") {
                        partial = {
                          textTranslation: JSON.stringify({
                            en: texts.map((item) =>
                              pick(item, "objectId", "properties"),
                            ),
                          }),
                        };
                      }

                      updatePrompt?.(prompt.id, {
                        processingComplete: true,
                        ...partial,
                      });
                    }}
                  >
                    Complete again
                  </Button>
                )}
                {remainingImageForReview > 0 ? (
                  <>{remainingImageForReview} image review missing</>
                ) : null}
                {prompt.status === AiPromptStatus.LOADING && (
                  <Spinner size={SpinnerSize.SMALL} />
                )}
                {!completeDisabled && (
                  <Button
                    large
                    intent={"primary"}
                    onClick={(e) => {
                      onGenerateLayouts?.(prompt.id);
                    }}
                  >
                    Create layout variation
                  </Button>
                )}
              </div>
            </div>
            {/* <H5 style={{ margin: 0 }}>Prompt: {prompt.id}</H5> */}
          </div>

          <div>
            {prompt.templateGenerated && (
              <>
                {prompt.hasSearchKeywords ? (
                  <Tag intent={"success"} round>
                    Keywords generated
                  </Tag>
                ) : (
                  <Button
                    large
                    intent={"primary"}
                    onClick={(e) => {
                      onCreateKeywords?.(prompt.id);
                    }}
                  >
                    Create keywords
                  </Button>
                )}
                <Tag intent={"success"} round>
                  Template generated
                </Tag>

                {prompt.PublicTemplate && (
                  <Button
                    large
                    intent={
                      !prompt.PublicTemplate?.[0]?.isPublic
                        ? "primary"
                        : "danger"
                    }
                    onClick={(e) => {
                      onChangeTemplatePublic?.(
                        prompt.PublicTemplate?.[0]?.id,
                        !prompt.PublicTemplate?.[0]?.isPublic,
                      );
                    }}
                  >
                    {prompt.PublicTemplate?.[0]?.isPublic
                      ? "Remove from public"
                      : "Go Public"}
                  </Button>
                )}
              </>
            )}
            {prompt.hasTranslation &&
              translatedToArr.map((lg) => (
                <Tag intent="primary" minimal round>
                  {lg}
                </Tag>
              ))}
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <ControlGroup
              fill={false}
              vertical={false}
              style={{ gap: 16, flexWrap: "wrap", margin: 0, padding: 0 }}
            >
              <FormGroup label="Document Type" style={{ margin: 0 }}>
                <Tag large minimal intent={Intent.PRIMARY}>
                  {prompt.documentType.name}
                </Tag>
              </FormGroup>

              <FormGroup label="Industry" style={{ margin: 0 }}>
                <Tag large minimal intent={Intent.SUCCESS}>
                  {prompt.industry.name}
                </Tag>
              </FormGroup>

              <FormGroup label="Prompt Kind" style={{ margin: 0 }}>
                <Tag large minimal>
                  {prompt.promptKind}
                </Tag>
              </FormGroup>

              <FormGroup label="Neutral Colors" style={{ margin: 0 }}>
                <Tag
                  large
                  minimal
                  intent={prompt.neutralColors ? Intent.PRIMARY : Intent.NONE}
                >
                  {prompt.neutralColors ? "Yes" : "No"}
                </Tag>
              </FormGroup>

              <FormGroup label="Uncrowded" style={{ margin: 0 }}>
                <Tag
                  large
                  minimal
                  intent={prompt.uncrowdedImages ? Intent.PRIMARY : Intent.NONE}
                >
                  {prompt.uncrowdedImages ? "Yes" : "No"}
                </Tag>
              </FormGroup>

              <FormGroup label="No writings" style={{ margin: 0 }}>
                <Tag
                  large
                  minimal
                  intent={
                    prompt.noAnyWritingsInImages ? Intent.PRIMARY : Intent.NONE
                  }
                >
                  {prompt.noAnyWritingsInImages ? "Yes" : "No"}
                </Tag>
              </FormGroup>

              <FormGroup label="No hands" style={{ margin: 0 }}>
                <Tag
                  large
                  minimal
                  intent={prompt.noHandsInImages ? Intent.PRIMARY : Intent.NONE}
                >
                  {prompt.noHandsInImages ? "Yes" : "No"}
                </Tag>
              </FormGroup>
            </ControlGroup>

            <ControlGroup
              fill={false}
              vertical={false}
              style={{ gap: 16, flexWrap: "wrap", margin: 0, padding: 0 }}
            >
              <FormGroup label="Status" style={{ margin: 0 }}>
                <Tag intent={getStatusIntent(prompt.status)}>
                  {prompt.status}
                </Tag>
              </FormGroup>

              <FormGroup label="Processing" style={{ margin: 0 }}>
                <Tag
                  intent={getProcessingStatusIntent(prompt.processingStatus)}
                >
                  {prompt.processingStatus}
                </Tag>
              </FormGroup>

              <FormGroup label="Processed" style={{ margin: 0 }}>
                <Tag intent={prompt.processingComplete ? "success" : undefined}>
                  {prompt.processingComplete ? "Yes" : "No"}
                </Tag>
              </FormGroup>
            </ControlGroup>
          </div>

          {!isChild && prompt.status === AiPromptStatus.DONE && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "start",
                marginTop: "10px",
              }}
            >
              <Button
                intent="primary"
                outlined
                //disabled={disableIndividual}
                onClick={() => {
                  onGenerateColors?.(prompt.id);
                }}
              >
                Colors
              </Button>
              <Button
                intent="primary"
                outlined
                //disabled={disableIndividual}
                onClick={() => {
                  onGenerateImages?.(prompt.id);
                }}
              >
                Images
              </Button>
              <Button
                intent="primary"
                outlined
                // disabled={disableIndividual}
                onClick={() => {
                  onGenerateVectors?.(prompt.id);
                }}
              >
                Vectors
              </Button>

              {showGenerateAll ? (
                <Button
                  intent="primary"
                  onClick={() => {
                    onGenerateAll?.(prompt.id);
                  }}
                >
                  Generate all
                </Button>
              ) : null}

              <div style={{ marginLeft: "50px" }}>
                <Button
                  onClick={() => {
                    setLarge(!large);
                  }}
                >
                  Toggle size
                </Button>
              </div>
            </div>
          )}

          {/* {prompt.layout && (
            <div style={{ marginTop: 12 }}>
              <Text>
                <strong>Layout:</strong>{" "}
                {prompt.layout.name || "Unnamed Layout"}
              </Text>
            </div>
          )} */}

          {/* <div style={{ marginTop: 12 }}>
            <Text className={Classes.TEXT_MUTED}>
              Created: {new Date(prompt.createdAt).toLocaleDateString()}
              {prompt.completedAt &&
                ` • Completed: ${new Date(
                  prompt.completedAt
                ).toLocaleDateString()}`}
            </Text>
          </div> */}
        </div>

        {
          <Button
            minimal
            icon={isExpanded ? "chevron-down" : "chevron-right"}
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              marginLeft: 16,
              position: "absolute",
              top: "10px",
              right: "10px",
            }}
          >
            {prompt.childPrompts?.length ?? 0} child prompt
            {prompt.childPrompts?.length !== 1 ? "s" : ""}
          </Button>
        }
        <br />
        {prompt.id}
      </div>

      {(prompt.status === AiPromptStatus.DONE ||
        (prompt.childPrompts && prompt.childPrompts.length > 0)) && (
        <Collapse isOpen={isExpanded}>
          <Divider style={{ margin: "16px" }} />
          <div

          // style={{
          //   marginTop: 16,
          //   borderTop: "1px solid #E1E8ED",
          //   paddingTop: 16,
          // }}
          >
            {/* <H6 style={{ marginBottom: 12 }}>Child Prompts:</H6> */}

            <div
              style={{
                display: "flex",
                // height: large ? undefined : "calc(100vh - 150px)",
                gap: "20px",
              }}
            >
              <section>
                <h4>Text, colors, typography</h4>
                <div style={{ display: "flex", gap: "16px" }}>
                  <Checkbox
                    style={{ borderLeft: "10px solid green" }}
                    large
                    checked={
                      prompt.processingStatus === AiProcessingStatus.APPROVED
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        updatePrompt?.(prompt.id, {
                          processingStatus: AiProcessingStatus.APPROVED,
                        });
                      }
                    }}
                  >
                    Approve
                  </Checkbox>
                  <Checkbox
                    style={{ borderLeft: "10px solid red" }}
                    large
                    checked={
                      prompt.processingStatus === AiProcessingStatus.REJECTED
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        updatePrompt?.(prompt.id, {
                          processingStatus: AiProcessingStatus.REJECTED,
                        });
                      }
                    }}
                  >
                    Reject
                  </Checkbox>
                </div>
                {prompt.processingStatus === AiProcessingStatus.REJECTED &&
                  imagePrompts.length === 0 && (
                    <Button
                      intent="primary"
                      onClick={(e) => {
                        updatePrompt?.(prompt.id, {
                          processingComplete: true,
                        });
                      }}
                    >
                      Complete
                    </Button>
                  )}
                <ColorSetPromptCardView
                  selectedColorPalette={selectedColorPalette}
                  // title={"Additional colors"}
                  colorPalettes={[prompt.aiResponseJson!.brandColors]}
                  promptId={prompt.id}
                  onSelect={(colorTheme) => {
                    setSelectedColorPalette(colorTheme);
                  }}
                  //colorPaletteStatuses={approvedColorPalette[prompt.id] ?? {}}
                  //setColorPaletteStatus={setColorPaletteStatus}
                />
                <div
                  style={{
                    height: large ? "600px" : "350px",
                    width: large ? "610px" : "360px",
                    paddingTop: "20px",
                  }}
                >
                  {template && (
                    <AITemplatePreview
                      currentProject={template}
                      width={large ? 600 : 350}
                    />
                  )}
                </div>
              </section>

              <section
                style={{
                  display: "flex",
                  gap: "16px",
                  overflow: "auto",
                  width: "100%",
                }}
              >
                <section>
                  <div>
                    <h4> &nbsp;</h4>

                    {texts.map((text) => {
                      return (
                        <div style={{ margin: "4px" }}>
                          <span>{text.text}</span>{" "}
                          {getTextArea(
                            "",
                            overridesObjectProperties[text.objectId]?.text ??
                              text.properties.text,
                            (newText) => {
                              const newState = cloneDeep(
                                overridesObjectProperties,
                              );
                              const prevProperties = newState[text.objectId]
                                ? { ...newState[text.objectId] }
                                : {};
                              prevProperties.text = newText;

                              newState[text.objectId] = prevProperties;

                              setOverridesObjectProperties(newState);
                            },
                            "",
                            { rows: 2 },
                          )}
                          <Tag minimal large>
                            {text.tag}
                          </Tag>
                          <div style={{ display: "flex" }}>
                            {getNumericFiled(
                              "FS",
                              parseInt(
                                overridesObjectProperties[text.objectId]
                                  ?.fontSize ?? text.properties.fontSize,
                              ),
                              (newFontSize) => {
                                const newState = cloneDeep(
                                  overridesObjectProperties,
                                );
                                const prevProperties = newState[text.objectId]
                                  ? { ...newState[text.objectId] }
                                  : {};
                                prevProperties.fontSize = newFontSize + "px";

                                newState[text.objectId] = prevProperties;

                                setOverridesObjectProperties(newState);
                              },
                            )}
                            {getNumericFiled(
                              "LH",
                              parseInt(
                                overridesObjectProperties[text.objectId]
                                  ?.lineHeight ?? text.properties.lineHeight,
                              ),
                              (newLineHeight) => {
                                const newState = cloneDeep(
                                  overridesObjectProperties,
                                );
                                const prevProperties = newState[text.objectId]
                                  ? { ...newState[text.objectId] }
                                  : {};
                                prevProperties.lineHeight = newLineHeight;

                                newState[text.objectId] = prevProperties;

                                setOverridesObjectProperties(newState);
                              },
                            )}

                            {/* const alignArr = ["left", "center", "right", "justify"]; */}
                          </div>
                          <div>
                            {getButtonGroupField(
                              "",
                              overridesObjectProperties[text.objectId]
                                ?.textAlign ?? text.properties.textAlign,
                              (newTextAlign) => {
                                const newState = cloneDeep(
                                  overridesObjectProperties,
                                );
                                const prevProperties = newState[text.objectId]
                                  ? { ...newState[text.objectId] }
                                  : {};
                                prevProperties.textAlign = newTextAlign;

                                newState[text.objectId] = prevProperties;

                                setOverridesObjectProperties(newState);
                              },
                              [
                                { label: "L", value: "left" },
                                { label: "R", value: "right" },
                                { label: "C", value: "center" },
                                { label: "J", value: "justify" },
                              ],
                            )}
                          </div>
                          {overridesObjectProperties?.[text.objectId] && (
                            <Button
                              small
                              intent="primary"
                              onClick={() => {
                                const newState = cloneDeep(
                                  overridesObjectProperties,
                                );
                                delete newState[text.objectId];

                                setOverridesObjectProperties(newState);
                              }}
                            >
                              Reset
                            </Button>
                          )}
                          <Divider />
                        </div>
                      );
                    })}
                  </div>
                  <LayoutPromptListView
                    originalLayoutResponse={layoutResponse}
                    layout={template}
                    title="Layouts"
                    // allowInstantReview={true}
                    prompts={layoutPrompts}
                    parentPrompt={prompt}
                    selectedColorPalette={selectedColorPalette}
                    imagePrompts={imagePrompts ?? []}
                    vectorPrompts={vectorPrompts ?? []}
                    onEditNewLayout={onEditNewLayout}
                    // setLayoutProcessingStatus={setImageProcessingStatus}
                    // onApply={() => onApplyImages(imagePrompts)}
                  />
                </section>
                {!large && (
                  <div>
                    {colorSetPrompts.map((childPrompt, index) => (
                      <ColorSetPromptCard
                        selectedColorPalette={selectedColorPalette}
                        onSelect={(colorTheme) => {
                          setSelectedColorPalette(colorTheme);
                        }}
                        title={"Color sets " + (index + 1)}
                        key={childPrompt.id}
                        promptId={childPrompt.id}
                        aiPrompt={childPrompt}
                        colorPaletteStatuses={
                          approvedColorPalette[childPrompt.id] ?? {}
                        }
                        setColorPaletteStatus={setColorPaletteStatus}
                        // onGenerateAll={onGenerateAll}
                      />
                    ))}
                  </div>
                )}
                {!large && (
                  <div>
                    <ImagePromptListView
                      title="Images"
                      prompts={imagePrompts}
                      setImageProcessingStatus={setImageProcessingStatus}
                      onGenerateImage={(objectId: string) => {
                        onGenerateImages?.(prompt.id, objectId);
                      }}
                      // onApply={() => onApplyImages(imagePrompts)}
                    />
                    <ImagePromptListView
                      title="Vectors"
                      allowInstantReview={true}
                      prompts={vectorPrompts}
                      setImageProcessingStatus={setImageProcessingStatus}
                      onGenerateImage={(objectId: string) => {
                        onGenerateVectors?.(prompt.id, objectId);
                      }}
                      // onApply={() => onApplyImages(imagePrompts)}
                    />
                  </div>
                )}
              </section>
            </div>
            <section>
              {prompt.childPrompts?.map((childPrompt, index) => (
                <PromptCard
                  key={childPrompt.id || index}
                  prompt={childPrompt}
                  isChild={true}
                  // onGenerateAll={onGenerateAll}
                />
              ))}
            </section>
          </div>
        </Collapse>
      )}
    </Card>
  );
};

// You'll also need this H6 component since Blueprint doesn't export it
// const H6: React.FC<{
//   children: React.ReactNode;
//   style?: React.CSSProperties;
// }> = ({ children, style }) => (
//   <h6 className={Classes.HEADING} style={{ margin: 0, ...style }}>
//     {children}
//   </h6>
// );

export default PromptCard;
