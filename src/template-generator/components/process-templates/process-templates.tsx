import React, {
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import cx from "classnames";
import { cloneDeep, forEach, last, omit } from "lodash-es";
import { connect } from "react-redux";
import { Dialog } from "@blueprintjs/core";
import { IStore } from "../../../store/store";
import css from "./process-template.module.scss";
import { IObject } from "webslider-sdk/lib/objects/i-object";

const supportedLanguages = {
  eng: "en", // English
  spa: "es", // Spanish
  fra: "fr", // French
  por: "pt", // Portuguese
  deu: "de", // German
  srp: "sr", // Serbian
  ita: "it", // Italian
};

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

import { IMeta } from "../../../store/reducers/meta";

import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IEditor } from "../../../store/reducers/editor";
import { useAiPrompt } from "../../hooks/useTemplateGenerator";
import { AiProcessingStatus, AiPromptKind } from "../../types/ai-prompts";
import { useLayoutHook } from "../../../panels/layouts-panel/useLayoutHook";
import { updateTemplate } from "../../utils/update-layout-utils";
import { AITemplatePreview } from "../ai-template-preview/ai-template-preview";
import { resizeProportionally } from "../../../utils/common-calculation/common-calculation";
import { generateImages } from "../../../player/image-generator-utils";
import { blobToBase64 } from "../../../utils/file/file-utils";
import { usePublicTemplate } from "../../hooks/usePublicTemplate";

export const PREVIEW_WIDTH = 500;

interface IProcessTemplatesProps {
  onRequestClose?: () => void;
  open?: boolean;
  forUserUid?: string;
}

export type IProcessTemplatesMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IProcessTemplatesProps;

const ProcessTemplates = (
  props: IProcessTemplatesMergedProps
): ReactElement => {
  const {
    open,
    onRequestClose,
    forUserUid,
    // layers,
    // objects,
    // breakpointConfig,
    // settings,
    // breakpoints,
    _updateProjectMeta,
    _updateEditor,

    // selectedDevice,
    themeClass,
    // pages,
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

  const { getTemplateGeneratorPrompts, updatePrompt } = useAiPrompt(); // <<< here
  const { getLayout } = useLayoutHook();

  const [thumbSize, setThumbSize] = useState({ width: 0, height: 0, scale: 1 });
  const [thumbnailBase64, setThumbnailBase64] = useState<string>();

  const previewUIDRef = useRef();
  const [template, setTemplate] = useState<any>();
  const templateRef = useRef(template);
  templateRef.current = template;

  const { addPublicTemplate } = usePublicTemplate();

  const process = async () => {
    const aiPromptResponse = await getTemplateGeneratorPrompts({
      limit: "1",
      page: "1",
      perPage: "1",
      processingStatus: AiProcessingStatus.APPROVED,
      processingComplete: true,
      promptKind: AiPromptKind.TEMPLATE,
      templateGenerated: false,
      forUserUID: forUserUid,
    });

    if (aiPromptResponse.data.length === 0) return;

    console.log("PROCESS _____");

    const imagePrompts =
      aiPromptResponse.data[0].childPrompts?.filter((childPrompt) => {
        return childPrompt.promptKind === AiPromptKind.IMAGE;
      }) ?? [];

    const vectorPrompts =
      aiPromptResponse.data[0].childPrompts?.filter((childPrompt) => {
        return childPrompt.promptKind === AiPromptKind.VECTOR;
      }) ?? [];

    const oneAiPrompt = aiPromptResponse.data[0];

    const layoutResponse = await getLayout(aiPromptResponse.data[0].layoutId);
    const layoutResponseProject = layoutResponse.project;

    // OVDE ----

    previewUIDRef.current = "";

    for (const lang of Object.values(supportedLanguages)) {
      await multiLanguageProcess({
        layoutResponseProject,
        oneAiPrompt: cloneDeep(oneAiPrompt),
        imagePrompts,
        vectorPrompts,
        lang,
      });
    }

    process().then();
  };

  const multiLanguageProcess = ({
    layoutResponseProject,
    oneAiPrompt,
    imagePrompts,
    vectorPrompts,
    lang,
  }: {
    layoutResponseProject: any;
    oneAiPrompt: any;
    imagePrompts: any;
    vectorPrompts: any;
    lang: string;
  }) => {
    return new Promise<void>((resolve) => {
      // debugger;

      const translation = JSON.parse(oneAiPrompt.textTranslation);

      // apply translation
      forEach(translation[lang] ?? [], (trans, index) => {
        let obj = oneAiPrompt.aiResponseJson.objects.find(
          (fObj) => fObj.objectId === trans.objectId
        );
        obj.properties.text = trans.properties.text;
      });

      // debugger;
      const newTemplate = updateTemplate(
        layoutResponseProject,
        layoutResponseProject,
        oneAiPrompt.aiResponseJson!,
        oneAiPrompt.aiResponseJson!.brandColors, // color palette
        imagePrompts
          .filter((vp) => vp.processingStatus !== AiProcessingStatus.REJECTED)
          .map((ip) => ip.metadata) as any,
        vectorPrompts
          .filter((vp) => vp.processingStatus !== AiProcessingStatus.REJECTED)
          .map((ip) => ip.metadata) as any,
        oneAiPrompt.overrideObjectProperties
          ? JSON.parse(oneAiPrompt.overrideObjectProperties)
          : undefined
      );

      console.log("update template");
      setTemplate(newTemplate);

      // debugger;

      setTimeout(async () => {
        const { imageBase64, extension } = await takeScreenShot();

        const imageBase64Data = `data:image/${extension};base64,${imageBase64}`;

        const addedTemplateResp = await addPublicTemplate({
          // industryStr: oneAiPrompt.industry.name,
          // documentTypeStr: oneAiPrompt.documentType.name,
          promptStr:
            imagePrompts?.[0]?.prompt ?? vectorPrompts?.[0]?.prompt ?? "",
          aiPromptId: oneAiPrompt.id,
          documentTypeId: oneAiPrompt.documentTypeId,
          industryId: oneAiPrompt.industryId,
          previewImageBase64: imageBase64Data,
          language: lang,
          previewUid: previewUIDRef.current,
          template: JSON.stringify(newTemplate),
        });

        // debugger;
        if (addedTemplateResp?.data?.previewUid) {
          previewUIDRef.current = addedTemplateResp.data?.previewUid;
        }

        await updatePrompt(oneAiPrompt.id, { templateGenerated: true });

        resolve();
      }, 1000);
    });
  };

  const takeScreenShot = async () => {
    const breakpointConfig: BreakpointConfiguration | undefined = last(
      templateRef.current.settings.breakpoints.breakpointsConfiguration.filter(
        (bc) => bc.enabled
      )
    );
    const exportSize = resizeProportionally(
      {
        width: breakpointConfig!.normal.maxSliderSize.width,
        height: breakpointConfig!.normal.maxSliderSize.height,
      },
      PREVIEW_WIDTH
    );

    // const scale =
    //   exportSize.width < exportSize.height
    //     ? exportSize.height / breakpointConfig!.normal.maxSliderSize.height
    //     : exportSize.width / breakpointConfig!.normal.maxSliderSize.width;

    setThumbSize({ ...exportSize, scale: 1 });

    const blobImages = await generateImages({
      breakpointConfig: breakpointConfig!,
      breakpoints: templateRef.current.settings.breakpoints,
      layers: templateRef.current.layers,
      objects: templateRef.current.objects,
      pages: templateRef.current.pages,
      selectedDevice: "device-independent",
      settings: templateRef.current.settings,
      extensions: [],
      imageType: "jpeg",
      imageQuality: 90,
      exportWidth: exportSize.width,
      exportHeight: exportSize.height,
    });

    const imageBlob = blobImages[0];
    let extension = "png";
    extension = imageBlob.type.indexOf("jpeg") !== -1 ? "jpeg" : extension;
    extension = imageBlob.type.indexOf("webp") !== -1 ? "webp" : extension;

    const imageBase64 = await blobToBase64(imageBlob);

    return { imageBase64, extension };
  };

  useEffect(() => {
    if (open) {
      process().then();
    }
  }, [open]);

  if (!template) return null;

  console.log(template, "-----template-----");

  return (
    <Dialog
      className={cx("bp5-dark", css.dialog)}
      isOpen={open}
      onClose={() => {
        onRequestClose?.();
      }}
      title="Process templates"
      canOutsideClickClose={false}
    >
      <div style={{ width: "500px", height: "500px" }}>
        <AITemplatePreview currentProject={template} width={PREVIEW_WIDTH} />
      </div>
    </Dialog>
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
    // project: omit({ ...state.project }, "diff", "clipboard"), //, "selection"
    // meta: state.meta,
    // slides: state.project.pages,
    // layers: state.project.layers,
    // objects: state.project.objects,
    // breakpointConfig,
    // settings: state.project.settings,
    // breakpoints: state.project.settings.breakpoints,
    themeClass: state.project.settings.themeClass,
    // selectedDevice: state.stage.selectedDevice,
    // pages: state.project.pages,
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

export default connect(mapStateToProps, mapDispatchToProps)(ProcessTemplates);
