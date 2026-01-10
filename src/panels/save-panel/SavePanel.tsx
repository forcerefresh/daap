import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import { cloneDeep, last, noop, omit, round, uniq } from "lodash-es";
import { connect } from "react-redux";
import { Button, Classes, Dialog, Spinner } from "@blueprintjs/core";
import { IStore } from "../../store/store";
import css from "./SavePanel.module.scss";
import { IObject } from "webslider-sdk/lib/objects/i-object";
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

export const THUMB_WIDTH = 200;

interface ISavePanelProps {
  onRequestClose: () => void;
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

  const isEdit = !!meta.id;

  // api
  const globalContext = useContext(IntegrationContext);
  const { updateProject, createProject } = globalContext.useProjectHook();
  const { saveTemplate } = globalContext.useTemplateHook();

  const { getInstalledExtensions } = globalContext.useExtensionsHook();

  // spinner
  //const [showSpinner, setShowSpinner] = useState(false);

  // const [thumbnailHtml, setThumbnailHtml] = useState("");
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
      //setLocalMeta(metaClone);
      //} else if (!metaClone.id || isSaveAs) {
      // todo: loader
      metaClone.id = undefined;
      // metaClone.name = "";
      //getNextProjectId().then((nextId) => {
      // metaClone.name = `Slider`; // ${nextId}`;
      metaClone.description = "";
      setLocalMeta(metaClone);
      //});
    }
  }, []);

  useEffect(() => {
    const exec = async () => {
      const exportSize = resizeProportionally(
        {
          width: breakpointConfig!.normal.maxSliderSize.width,
          height: breakpointConfig!.normal.maxSliderSize.height,
        },
        THUMB_WIDTH
      );

      // const scale =
      //   exportSize.width < exportSize.height
      //     ? exportSize.height / breakpointConfig!.normal.maxSliderSize.height
      //     : exportSize.width / breakpointConfig!.normal.maxSliderSize.width;

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

    // metaClone.id = undefined;
    // metaClone.name = "";

    // metaClone.name = `Slider`;
    // metaClone.description = "";
    // setLocalMeta(metaClone);

    const installedExtensions = await getInstalledExtensions();

    const playerData = generatePlayerData(
      { slides, layers, objects },
      { entityType: "project", entityId: "current-project" },
      breakpointConfig!,
      breakpoints,
      settings,
      installedExtensions.data,
      { isSave: true }
    );

    let updatedProject = project;
    let updatedPlayerData = playerData;
    // replace ids is saveAs
    if (saveAs) {
      const updated = project;
      // const updated = updateProjectWithNewIds(project);
      // updatedProject = updated.updatedProject;
      // updatedPlayerData = updateObjectWithNewIds(playerData, updated.fromToIds);
    }

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
          // html: thumbnailHtml,
        },
        playerData: updatedPlayerData,
        assetsUrls,
        fonts,
        extensions: playerData.extensions,
        colors: project.colors.documentColorPalettes,
        documentTypeId,
      })
        .then(
          ({
            id,
            name,
            description,
            slides,
            created,
            modified,
            saveRevision,
            assetsUrls,
            //publishRevision,
          }) => {
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
              //publishRevision,
            });
            _updateEditor({ sliderChanged: false, isExistingProject: true });
            onRequestClose();
            AppToaster.show({
              intent: "success",
              message: "Slider is successfully saved.",
            });
          }
        )
        .catch((e) => {
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
          // html: thumbnailHtml,
          base64: thumbnailBase64 ?? "",
        },
        playerData: updatedPlayerData,
        assetsUrls,
        fonts,
        extensions: playerData.extensions,
        colors: project.colors.documentColorPalettes,
        documentTypeId,
      })
        .then(
          ({
            id,
            name,
            description,
            slides,
            created,
            modified,
            saveRevision,
            assetsUrls,
            //publishRevision,
          }) => {
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
              //publishRevision,
            });
            _updateEditor({ sliderChanged: false, isExistingProject: true });
            onRequestClose();
            AppToaster.show({
              intent: "success",
              message: "Slider is successfully saved.",
            });
          }
        )
        .catch((e) => {
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

    //const { updatedProject, fromToIds } = updateProjectWithNewIds(project);
    const updatedProject = project;

    const installedExtensions = await getInstalledExtensions();

    const playerData = generatePlayerData(
      { slides, layers, objects },
      { entityType: "project", entityId: "current-project" },
      breakpointConfig!,
      breakpoints,
      settings,
      installedExtensions.data,
      { isSave: true }
    );

    const assetsUrls = getAllAssetsUrls(objects);
    const fonts = getAllFonts(objects);

    // TODO check updateObjectWithNewIds
    // const updatedPlayerData = updateObjectWithNewIds(playerData, fromToIds);
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
        // html: thumbnailHtml,
        base64: thumbnailBase64,
      },
      playerData: updatedPlayerData,
      assetsUrls,
      fonts,
      extensions: playerData.extensions,
    })
      .then(({ id, name, description, slides, created, assetsUrls }) => {
        onRequestClose();
        _updateProjectMeta({ inSaving: false });
        AppToaster.show({
          intent: "success",
          message: "Template is successfully saved.",
        });
      })
      .catch((e) => {
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
        {/*getSelectField(
          "Thumbnail",
          "",
          [],
          () => {}
        )*/}
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
          // dangerouslySetInnerHTML={{
          //   __html: thumbnailHtml,
          // }}
          style={{
            backgroundRepeat: "no-repeat",
            backgroundImage: `url('${thumbnailBase64}')`,
            height: "100%",
          }}
        ></div>
      </div>
      <RightPanelHeader>
        <div>SAVE DOCUMENT</div>
        <div className={css.saving}>
          {meta.inSaving && (
            <>
              <Spinner size={16} /> Saving...
            </>
          )}
        </div>
      </RightPanelHeader>

      <div className={css.saveHolder}>
        {/*<Label>Align</Label>*/}
        {/* <div className={cx("input400-force", css.inputHolder)}>
          {getTextField(
            "ID" + " (readonly)",
            localMeta.id,
            (id: any) => {},
            "",
            {
              readOnly: true,
              placeholder: !localMeta.id
                ? "ID will be generated after save"
                : "",
            }
          )}
        </div> */}

        <div className={cx("input400-force", css.inputHolder)}>
          {getTextField(
            "Name",
            localMeta.name,
            (name: any) => {
              setLocalMeta({ ...localMeta, name });
            },
            ""
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
            { disabledDebounce: true }
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
              // intent="primary"
              // icon="floppy-disk"
              onClick={() => onClickSave(true)}
            >
              {"Save as new document"}
            </Button>
            <Button
              className={css.saveAsTemplateBtn}
              disabled={meta.inSaving} //|| !meta.id || meta.id === "-1"}
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
          <div>
            {/* <Button
              disabled={meta.inSaving}
              // intent="primary"
              // icon="floppy-disk"
              onClick={() => onClickSave(true)}
            >
              {"Save as new document"}
            </Button>
            <Button
              className={css.saveAsTemplateBtn}
              disabled={meta.inSaving} //|| !meta.id || meta.id === "-1"}
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
            </Button> */}
            {/* 
            <Button
              disabled={meta.inSaving}
              intent="none"
              onClick={() => {
                onRequestClose();
              }}
            >
              {"Cancel"}
            </Button> */}
          </div>

          {/* <div className={css.saveAsTemplateBtnHolder}>
            <Button
              className={css.saveAsTemplateBtn}
              disabled={meta.inSaving}
              intent="none"
              onClick={() => onClickSaveTemplate(isSaveAs)}
            >
              {"Save as Template"}
            </Button>
          </div> */}
          {/*<Button
            disabled={meta.inSaving}
            intent="primary"
            icon="floppy-disk"
            minimal
            onClick={() => onClickSave(true)}
            style={{ marginLeft: "40px" }}
          >
            Save as new slider
          </Button>*/}
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
              ""
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
              { disabledDebounce: true }
            )}
          </div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              intent="primary"
              onClick={() => {
                // TODO
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
};

export default connect(mapStateToProps, mapDispatchToProps)(SavePanel);
