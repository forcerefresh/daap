import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import { cloneDeep, last, omit } from "lodash-es";
import { connect } from "react-redux";
import { Button, Classes, Dialog, Spinner } from "@blueprintjs/core";
import { IStore } from "../../store/store";
import css from "./SavePanel.module.scss";
import { updateProjectMeta, updateEditor } from "../../store/actions/actions";
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
  RightPanelHeader,
} from "../common/panel-header/PanelHeader";
import { resizeProportionally } from "../../utils/common-calculation/common-calculation";
import { generateImages } from "../../utils/image-generator/image-generator-utils";
import { blobToBase64 } from "../../utils/file/file-utils";

export const THUMB_WIDTH = 200;

interface ISavePanelProps {
  onRequestClose: () => void;
  isSaveAs?: boolean;
}

export type ISavePanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ISavePanelProps;

const SavePanel: React.FC<ISavePanelMergedProps> = (props) => {
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
  } = props;

  // api
  const globalContext = useContext(IntegrationContext);
  const { updateProject, createProject } = globalContext.useProjectHook();
  const { saveTemplate } = globalContext.useTemplateHook();

  const { getInstalledExtensions } = globalContext.useExtensionsHook();

  const [thumbnailBase64, setThumbnailBase64] = useState<string>();

  const [thumbSize, setThumbSize] = useState({ width: 0, height: 0, scale: 1 });

  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [templateDialogData, setTemplateDialogData] = useState<{
    name: string;
    description: string;
  }>({ name: "", description: "" });

  // local state
  const [localMeta, setLocalMeta] = useState({
    ...meta,
  });

  useEffect(() => {
    const metaClone = cloneDeep(meta);
    if (!metaClone.id) {
      metaClone.id = undefined;
      metaClone.description = "";
      setLocalMeta(metaClone);
    }
  }, []);

  useEffect(() => {
    const exec = async () => {
      const exportSize = resizeProportionally(
        {
          width: breakpointConfig!.normal.maxSliderSize.width,
          height: breakpointConfig!.normal.maxSliderSize.height,
        },
        THUMB_WIDTH,
      );

      setThumbSize({ ...exportSize, scale: 1 });

      const blobImages = await generateImages({
        breakpointConfig: breakpointConfig!,
        breakpoints,
        layers,
        objects,
        pages,
        selectedDevice,
        settings,
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

      setThumbnailBase64(`data:image/${extension};base64,${imageBase64}`);
    };

    exec().then();
  }, []);

  const onClickSave = async (saveAs?: boolean) => {
    _updateProjectMeta({ inSaving: true });

    const installedExtensions = await getInstalledExtensions();

    const playerData = generatePlayerData(
      { slides, layers, objects },
      { entityType: "project", entityId: "current-project" },
      breakpointConfig!,
      breakpoints,
      settings,
      installedExtensions.data,
      { isSave: true },
    );

    let updatedProject = project;
    let updatedPlayerData = playerData;

    const assetsUrls = getAllAssetsUrls(objects);
    const fonts = getAllFonts(objects);

    const id = saveAs ? undefined : localMeta.id;

    const w =
      project?.settings?.breakpoints?.breakpointsConfiguration?.[0]?.normal
        ?.page?.width;
    const h =
      project?.settings?.breakpoints?.breakpointsConfiguration?.[0]?.normal
        ?.page?.height;
    let documentTypeId;
    if (w === 1080 && h === 1080) {
      documentTypeId = "SocialMedia:Instagram:SquarePost";
    } else {
      documentTypeId = project.settings.documentTypeId;
    }

    if (id) {
      updateProject(id, {
        name: localMeta.name!,
        description: localMeta.description!,
        slides: project.pages.pages.length,
        project: updatedProject,
        preview: {
          width: thumbSize.width,
          height: thumbSize.height,
          scale: thumbSize.scale,
          base64: thumbnailBase64 ?? "",
        },
        playerData: updatedPlayerData,
        assetsUrls,
        fonts,
        extensions: playerData.extensions,
        colors: project.colors.documentColorPalettes,
        documentTypeId,
      } as any)
        .then(
          (res: any) => {
            const { id, name, description, slides, created, modified, saveRevision, assetsUrls } = res;
            _updateProjectMeta({
              id,
              name,
              description,
              slides,
              created,
              modified,
              inSaving: false,
              saveRevision,
              assetsUrls,
            });
            _updateEditor({ sliderChanged: false, isExistingProject: true });
            onRequestClose();
            AppToaster.show({
              intent: "success",
              message: "Slider is successfully saved.",
            });
          },
        )
        .catch(() => {
          _updateProjectMeta({ inSaving: false });
          onRequestClose();
          AppToaster.show({
            intent: "danger",
            message: "Something went wrong. Slider is not saved.",
          });
        });
    } else {
      createProject({
        name: localMeta.name!,
        description: localMeta.description!,
        slides: project.pages.pages.length,
        project: updatedProject,
        preview: {
          width: thumbSize.width,
          height: thumbSize.height,
          scale: thumbSize.scale,
          base64: thumbnailBase64 ?? "",
        },
        playerData: updatedPlayerData,
        assetsUrls,
        fonts,
        extensions: playerData.extensions,
        colors: project.colors.documentColorPalettes,
        documentTypeId,
      } as any)
        .then(
          (res: any) => {
            const { id, name, description, slides, created, modified, saveRevision, assetsUrls } = res;
            if (localStorage?.getItem("aiGenEditLayout_ParentLayoutId")) {
              localStorage?.setItem("aiGenEditLayout_SavedProjectId", id);
            }

            _updateProjectMeta({
              id,
              name,
              description,
              slides,
              created,
              modified,
              inSaving: false,
              saveRevision,
              assetsUrls,
            });
            _updateEditor({ sliderChanged: false, isExistingProject: true });
            onRequestClose();
            AppToaster.show({
              intent: "success",
              message: "Slider is successfully saved.",
            });
          },
        )
        .catch(() => {
          _updateProjectMeta({ inSaving: false });
          onRequestClose();
          AppToaster.show({
            intent: "danger",
            message: "Something went wrong. Slider is not saved.",
          });
        });
    }
  };

  const onSaveTemplate = async () => {
    _updateProjectMeta({ inSaving: true });

    const updatedProject = project;

    const installedExtensions = await getInstalledExtensions();

    const playerData = generatePlayerData(
      { slides, layers, objects },
      { entityType: "project", entityId: "current-project" },
      breakpointConfig!,
      breakpoints,
      settings,
      installedExtensions.data,
      { isSave: true },
    );

    const assetsUrls = getAllAssetsUrls(objects);
    const fonts = getAllFonts(objects);

    const updatedPlayerData = playerData;

    saveTemplate({
      name: templateDialogData.name,
      description: templateDialogData.description,
      project: updatedProject,
      slides: project.pages.pages.length,
      documentTypeId: project.settings.documentTypeId,
      colors: project.colors.documentColorPalettes,
      preview: {
        width: thumbSize.width,
        height: thumbSize.height,
        scale: thumbSize.scale,
        base64: thumbnailBase64,
      },
      playerData: updatedPlayerData,
      assetsUrls,
      fonts,
      extensions: playerData.extensions,
    } as any)
      .then(() => {
        onRequestClose();
        _updateProjectMeta({ inSaving: false });
        AppToaster.show({
          intent: "success",
          message: "Template is successfully saved.",
        });
      })
      .catch(() => {
        _updateProjectMeta({ inSaving: false });
        onRequestClose();
        AppToaster.show({
          intent: "danger",
          message: "Something went wrong. Template is not saved.",
        });
      });
  };

  return (
    <div className={cx(themeClass, css.savePanel)}>
      <div className={cx("bp5-label", css.thumbTitle)}>
        Preview
      </div>
      <div
        className={css.thumbHolder}
        style={{
          width: thumbSize.width + "px",
          height: thumbSize.height + "px",
        }}
      >
        <div
          className={css.thumbHolderInner}
          style={{
            backgroundRepeat: "no-repeat",
            backgroundImage: `url('${thumbnailBase64}')`,
            height: "100%",
          }}
        ></div>
      </div>
      <RightPanelHeader title="SAVE DOCUMENT">
        <div className={css.saving}>
          {meta.inSaving && (
            <>
              <Spinner size={16} /> Saving...
            </>
          )}
        </div>
      </RightPanelHeader>

      <div className={css.saveHolder}>
        <div className={cx("input400-force", css.inputHolder)}>
          {getTextField(
            "Name",
            localMeta.name,
            (name: any) => {
              setLocalMeta({ ...localMeta, name });
            },
            "",
          )}
        </div>

        <div className={cx("input400-force", css.inputHolder)}>
          {getTextArea(
            "Description",
            localMeta.description,
            (description: any) => {
              setLocalMeta({ ...localMeta, description });
            },
            "",
            { disabledDebounce: true },
          )}
        </div>
        <div className={css.actionRow}>
          <div>
            <Button
              disabled={meta.inSaving}
              intent="primary"
              icon="floppy-disk"
              onClick={() => onClickSave(false)}
            >
              {"Save"}
            </Button>

            <Button
              disabled={meta.inSaving}
              onClick={() => onClickSave(true)}
            >
              {"Save as new document"}
            </Button>
            <Button
              className={css.saveAsTemplateBtn}
              disabled={meta.inSaving}
              intent="none"
              onClick={() => {
                setSaveTemplateDialogOpen(true);
                setTemplateDialogData({
                  name: meta.name ?? "",
                  description: "",
                });
              }}
            >
              {"Save as Template"}
            </Button>
          </div>
          <div></div>
        </div>
      </div>
      <Dialog
        className={cx("bp5-dark", css.dialog)}
        isOpen={saveTemplateDialogOpen}
        onClose={() => {
          setSaveTemplateDialogOpen(false);
        }}
        title="Save as Template"
        canOutsideClickClose={false}
      >
        <div style={{ margin: "20px" }}>
          <div className={cx("input400-force", css.inputHolder)}>
            {getTextField(
              "Template Name",
              templateDialogData.name,
              (name: any) => {
                setTemplateDialogData((templateDialogData) => ({
                  ...templateDialogData,
                  name,
                }));
              },
              "",
            )}
          </div>

          <div className={cx("input440", css.inputHolder)}>
            {getTextArea(
              "Description",
              templateDialogData.description,
              (description: any) => {
                setTemplateDialogData((templateDialogData) => ({
                  ...templateDialogData,
                  description,
                }));
              },
              "",
              { disabledDebounce: true },
            )}
          </div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              intent="primary"
              onClick={() => {
                onSaveTemplate();
                setSaveTemplateDialogOpen(false);
              }}
              disabled={false}
            >
              Save Template
            </Button>
            <Button
              onClick={() => {
                setSaveTemplateDialogOpen(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  // NOTE: get largest enabled
  const breakpointConfig: BreakpointConfiguration | undefined = last(
    state.project.settings.breakpoints.breakpointsConfiguration.filter(
      (bc) => bc.enabled,
    ),
  );

  return {
    project: omit({ ...state.project }, "diff", "clipboard") as any, //, "selection"
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
};

export default connect(mapStateToProps, mapDispatchToProps)(SavePanel);
