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
import { after, cloneDeep, set } from "lodash-es";
import { string } from "yup";

export type SelectedColorPaletteType = {
  promptId: string;
  idx: number;
};

interface PromptCardProps {
  prompt: AiPrompt;
  onGenerateAll?: (id: string) => void;
  onGenerateColors?: (id: string) => void;
  onGenerateImages?: (id: string) => void;
  onGenerateVectors?: (id: string) => void;
  isChild?: boolean;
}

const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onGenerateAll,
  onGenerateImages,
  onGenerateColors,
  onGenerateVectors,
  isChild,
}) => {
  const [isExpanded, setIsExpanded] = useState(
    !isChild && prompt.childPrompts?.length === 0
  );

  // const aiResponseJsonObj = useMemo(
  //   () => JSON.parse(prompt.aiResponseJson!),
  //   [prompt.aiResponseJson]
  // );

  const [selectedColorPalette, setSelectedColorPalette] = useState<ColorTheme>(
    prompt.aiResponseJson?.brandColors
  );

  const [approvedColorPalette, setApprovedColorPalette] = useState<{
    [promptId: string]: { [idx: string]: boolean };
  }>({ [prompt.id]: { 0: true } });

  const [approvedImages, setApproverImages] = useState<{
    [promptId: string]: boolean;
  }>({});

  const setColorPaletteStatus = (
    promptId: string,
    idx: number,
    status: boolean | undefined
  ) => {
    const newApproved = set(
      cloneDeep(approvedColorPalette),
      `${promptId}.${idx}`,
      status
    );
    setApprovedColorPalette(newApproved);
  };

  const setImageStatus = (promptId: string, status: boolean | undefined) => {
    const newApproved = set(cloneDeep(approvedImages), `${promptId}`, status);
    setApproverImages(newApproved);
    debugger;
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

  const { getLayout } = useLayoutHook();

  const [layout, setLayout] = useState<any | undefined>();
  const [template, setTemplate] = useState<any | undefined>();
  const [texts, setTexts] = useState<{ text: string; tag: string }[]>([]);

  useEffect(() => {
    console.log("EXECUTE");
    // only if its template
    if (prompt.promptKind === AiPromptKind.TEMPLATE)
      getLayout(prompt.layoutId).then((layoutResponse) => {
        console.log(layoutResponse);
        // debugger;
        setLayout(layoutResponse.project);

        const newTemplate = updateTemplate(
          layoutResponse.project,
          layoutResponse.project,
          prompt.aiResponseJson!,
          selectedColorPalette,
          imagePrompts.map((ip) => ip.metadata) as any,
          vectorPrompts.map((ip) => ip.metadata) as any
        );

        console.log("update template");
        setTemplate(newTemplate);

        const textArr = collectTextFromIaResponse(prompt.aiResponseJson);
        // debugger;
        setTexts(textArr);
      });
  }, [
    imagePrompts,
    prompt.layoutId,
    prompt.aiResponseJson,
    prompt.promptKind,
    selectedColorPalette,
    setTexts,
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
      case AiProcessingStatus.PROCESSED:
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
            <H5>
              <Icon
                icon={getPromptKindIcon(prompt.promptKind)}
                size={16}
                style={{ marginRight: 8 }}
              />
              <strong>{prompt.promptKind}:</strong>{" "}
              {prompt.layout?.name || "Unnamed Layout"}{" "}
              {/* <H5 style={{ margin: 0 }}>Prompt: {prompt.id}</H5> */}
            </H5>
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
            </ControlGroup>
            {!isChild && (
              <div
                style={{ display: "flex", gap: "10px", alignItems: "start" }}
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
                    All
                  </Button>
                ) : null}
              </div>
            )}
          </div>
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
                height: "calc(100vh - 200px)",
                gap: "20px",
              }}
            >
              <section>
                <h4>Preview</h4>
                <div
                  style={{
                    height: "290px",
                    width: "360px",
                    paddingTop: "20px",
                  }}
                >
                  {template && (
                    <AITemplatePreview currentProject={template} width={350} />
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
                <div>
                  <ColorSetPromptCardView
                    selectedColorPalette={selectedColorPalette}
                    title={"Template colors"}
                    colorPalettes={[prompt.aiResponseJson!.brandColors]}
                    promptId={prompt.id}
                    onSelect={(colorTheme) => {
                      setSelectedColorPalette(colorTheme);
                    }}
                    colorPaletteStatuses={approvedColorPalette[prompt.id] ?? {}}
                    setColorPaletteStatus={setColorPaletteStatus}
                  />
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
                <div>
                  <h4>Texts</h4>

                  {texts.map((text) => {
                    return (
                      <div style={{ margin: "4px" }}>
                        <span>{text.text}</span>{" "}
                        <Tag minimal large>
                          {text.tag}
                        </Tag>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <ImagePromptListView
                    title="Images"
                    prompts={imagePrompts}
                    setImageStatus={setImageStatus}
                    approvedImages={approvedImages}
                    // onApply={() => onApplyImages(imagePrompts)}
                  />
                  <ImagePromptListView
                    title="Vectors"
                    prompts={vectorPrompts}
                    approvedImages={approvedImages}
                    setImageStatus={setImageStatus}
                    // onApply={() => onApplyImages(imagePrompts)}
                  />
                </div>
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
