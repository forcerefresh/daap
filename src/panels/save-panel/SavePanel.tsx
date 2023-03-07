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
import { generatePlayerData, getAllAssetsUrls } from "../../export/export-html";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { IEditor } from "../../store/reducers/editor";
import {
  updateObjectWithNewIds,
  updateProjectWithNewIds,
} from "../../utils/project/project-utils";

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
    isSaveAs = false,
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
  } = props;

  const isEdit = !!meta.id;

  // api
  const globalContext = useContext(IntegrationContext);
  const { saveProject } = globalContext.useProjectHook();
  const { saveTemplate } = globalContext.useTemplateHook();

  const { getInstalledExtensions } = globalContext.useExtensionsHook();

  // spinner
  //const [showSpinner, setShowSpinner] = useState(false);

  const [thumbnailHtml, setThumbnailHtml] = useState("");
  const [thumbSize, setThumbSize] = useState({ width: 0, height: 0, scale: 0 });

  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [templateDialogData, setTemplateDialogData] = useState<{
    name: string;
    description: string;
  }>({ name: "", description: "" });

  // local state
  const [localMeta, setLocalMeta] = useState({
    ...meta,
    ...(isSaveAs ? { name: "", id: undefined } : {}),
  });

  useEffect(() => {
    const metaClone = cloneDeep(meta);
    if (!metaClone.id || isSaveAs) {
      //setLocalMeta(metaClone);
      //} else if (!metaClone.id || isSaveAs) {
      // todo: loader
      metaClone.id = undefined;
      metaClone.name = "";
      //getNextProjectId().then((nextId) => {
      metaClone.name = `Slider`; // ${nextId}`;
      metaClone.description = "";
      setLocalMeta(metaClone);
      //});
    }
  }, []);

  useEffect(() => {
    const scale = THUMB_WIDTH / breakpointConfig!.normal.maxSliderSize.width!;
    const thumbHeight = scale * breakpointConfig!.normal.maxSliderSize.height!;
    setThumbSize({ width: THUMB_WIDTH, height: thumbHeight, scale: scale });

    const thumbnailPlayerData = generatePlayerData(
      { slides, layers, objects },
      { entityType: "slide", entityId: slides.normalSlides[0] },
      breakpointConfig!,
      breakpoints,
      settings,
      undefined,
      { isSave: false, isForThumbnail: true }
    );
    setThumbnailHtml(thumbnailPlayerData.html);
  }, []);

  const onClickSave = async (saveAs?: boolean) => {
    _updateProjectMeta({ inSaving: true });

    const installedExtensions = await getInstalledExtensions();

    const { updatedProject, fromToIds } = updateProjectWithNewIds(project);

    const playerData = generatePlayerData(
      { slides, layers, objects },
      { entityType: "project", entityId: "current-project" },
      breakpointConfig!,
      breakpoints,
      settings,
      installedExtensions.items,
      { isSave: true }
    );

    const assetsUrls = getAllAssetsUrls(objects);

    const updatedPlayerData = updateObjectWithNewIds(playerData, fromToIds);

    saveProject({
      id: saveAs ? undefined : localMeta.id,
      name: localMeta.name!,
      description: localMeta.description!,
      slides: project.slides.normalSlides.length,
      project: updatedProject,
      preview: {
        width: thumbSize.width,
        height: thumbSize.height,
        scale: thumbSize.scale,
        html: thumbnailHtml,
      },
      playerData: updatedPlayerData,
      assetsUrls,
      extensions: playerData.extensions,
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
  };

  const onSaveTemplate = async () => {
    _updateProjectMeta({ inSaving: true });

    const { updatedProject, fromToIds } = updateProjectWithNewIds(project);

    const installedExtensions = await getInstalledExtensions();

    const playerData = generatePlayerData(
      { slides, layers, objects },
      { entityType: "project", entityId: "current-project" },
      breakpointConfig!,
      breakpoints,
      settings,
      installedExtensions.items,
      { isSave: true }
    );

    const assetsUrls = getAllAssetsUrls(objects);

    const updatedPlayerData = updateObjectWithNewIds(playerData, fromToIds);

    saveTemplate({
      name: templateDialogData.name,
      description: templateDialogData.description,
      project: updatedProject,
      slides: project.slides.normalSlides.length,
      preview: {
        width: thumbSize.width,
        height: thumbSize.height,
        scale: thumbSize.scale,
        html: thumbnailHtml,
      },
      playerData: updatedPlayerData,
      assetsUrls,
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
    <div className={cx("bp3-dark", css.savePanel)}>
      <div className={cx("bp3-label", css.thumbTitle)}>
        Thumbnail
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
          dangerouslySetInnerHTML={{
            __html: thumbnailHtml,
          }}
          style={{
            transform: `scale(${round(thumbSize.scale, 2)})`,
          }}
        ></div>
      </div>
      <div className={css.panelHeader}>
        <div>{isSaveAs ? "SAVE AS..." : "SAVE PANEL"}</div>
        <div className={css.saving}>
          {meta.inSaving && (
            <>
              <Spinner size={16} /> Saving...
            </>
          )}
        </div>
      </div>

      <div className={css.saveHolder}>
        {/*<Label>Align</Label>*/}
        <div className={cx("input330", css.inputHolder)}>
          {getTextField(
            "ID" +
              (isSaveAs ? " [From project ID: " + meta.id + "]" : "") +
              " (readonly)",
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
        </div>

        <div className={cx("input330", css.inputHolder)}>
          {getTextField(
            "Name" +
              (isSaveAs ? " [From project name: " + meta.name + "]" : ""),
            localMeta.name,
            (name: any) => {
              setLocalMeta({ ...localMeta, name });
            },
            ""
          )}
        </div>

        <div className={cx("input330", css.inputHolder)}>
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
          <Button
            disabled={meta.inSaving}
            intent="primary"
            icon="floppy-disk"
            onClick={() => onClickSave(isSaveAs)}
          >
            {"Save"}
          </Button>
          <Button
            disabled={meta.inSaving}
            intent="none"
            onClick={() => {
              onRequestClose();
            }}
          >
            {"Cancel"}
          </Button>
          {!isSaveAs && (
            <div className={css.saveAsTemplateBtnHolder}>
              <Button
                className={css.saveAsTemplateBtn}
                disabled={meta.inSaving || !meta.id || meta.id === "-1"}
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
          )}

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
        className={cx("bp3-dark", css.dialog)}
        isOpen={saveTemplateDialogOpen}
        onClose={() => {
          setSaveTemplateDialogOpen(false);
        }}
        title="Save project as Template"
        canOutsideClickClose={false}
      >
        <div style={{ margin: "20px" }}>
          <div className={cx("input330", css.inputHolder)}>
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
    project: omit({ ...state.project }, "diff"),
    meta: state.meta,
    slides: state.project.slides,
    layers: state.project.layers,
    objects: state.project.objects,
    breakpointConfig,
    settings: state.project.settings,
    breakpoints: state.project.settings.breakpoints,
  };
};

const mapDispatchToProps = {
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
  _updateEditor: (editor: Partial<IEditor>) => updateEditor(editor),
};

export default connect(mapStateToProps, mapDispatchToProps)(SavePanel);
