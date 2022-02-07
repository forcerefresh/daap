import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import { cloneDeep, noop, omit, round } from "lodash-es";
import { connect } from "react-redux";
import { Button, Label, Spinner } from "@blueprintjs/core";
import { IStore } from "../../store/store";
import css from "./SavePanel.module.scss";
import { IObject } from "../../objects/types";
import {
  updateObject,
  updateProjectMeta,
  updateEditor,
} from "../../store/actions/actions";
import { IntegrationContext } from "../../integration";
import {
  getCheckboxField,
  getSelectField,
  getTextArea,
  getTextField,
} from "../../inputs/input-utils";
import { IMeta } from "../../store/reducers/meta";
import { generatePlayerData } from "../../export/export-html";
import { BreakpointConfiguration } from "../../store/reducers/settings";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { IEditor } from "../../store/reducers/editor";

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
    _updateProjectMeta,
    _updateEditor,
    onRequestClose,
  } = props;

  const isEdit = !!meta.id;

  // api
  const globalContext = useContext(IntegrationContext);
  const { saveProject, getNextProjectId } = globalContext.useAPIHook();

  // spinner
  //const [showSpinner, setShowSpinner] = useState(false);

  const [html, setHtml] = useState("");
  const [thumbSize, setThumbSize] = useState({ width: 0, height: 0, scale: 0 });

  // local state
  const [localMeta, setLocalMeta] = useState(meta);
  useEffect(() => {
    const metaClone = cloneDeep(meta);
    if (!metaClone.id || isSaveAs) {
      //setLocalMeta(metaClone);
      //} else if (!metaClone.id || isSaveAs) {
      // todo: loader
      getNextProjectId().then((nextId) => {
        metaClone.name = `Slider ${nextId}`;
        metaClone.description = "";
        setLocalMeta(metaClone);
      });
    }
  }, []);

  useEffect(() => {
    const scale = THUMB_WIDTH / breakpointConfig!.normal.slide.width!;
    const thumbHeight = scale * breakpointConfig!.normal.slide.height!;
    setThumbSize({ width: THUMB_WIDTH, height: thumbHeight, scale: scale });

    const exportData = generatePlayerData(
      { slides, layers, objects },
      { entityType: "slide", entityId: slides.normalSlides[0] },
      breakpointConfig!,
      settings
    );
    setHtml(exportData.html);
  }, []);

  const onClickSave = (saveAs?: boolean) => {
    _updateProjectMeta({ inSaving: true });

    const playerData = generatePlayerData(
      { slides, layers, objects },
      { entityType: "project", entityId: "current-project" },
      breakpointConfig!,
      settings
    );

    saveProject({
      id: saveAs ? undefined : localMeta.id,
      name: localMeta.name!,
      description: localMeta.description!,
      project,
      preview: {
        width: thumbSize.width,
        height: thumbSize.height,
        scale: thumbSize.scale,
        html: html,
      },
      playerData,
    })
      .then(({ id, name, description, slides, created, modified }) => {
        console.log({ id, name, description });
        _updateProjectMeta({
          id,
          name,
          description,
          slides,
          created,
          modified,
          inSaving: false,
        });
        _updateEditor({ sliderChanged: false, isExistingProject: true });
        onRequestClose();
        AppToaster.show({
          intent: "success",
          message: "Slider is successfully saved.",
        });
      })
      .catch((e) => {
        _updateProjectMeta({ inSaving: false });
        onRequestClose();
        AppToaster.show({
          intent: "danger",
          message: "Something went wrong. Slider is not saved.",
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
            __html: html,
          }}
          style={{
            transform: `scale(${round(thumbSize.scale, 2)})`,
          }}
        ></div>
      </div>
      <div className={css.panelHeader}>
        <div>SAVE PANEL</div>
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
        <div className={cx("input260", css.inputHolder)}>
          {getTextField(
            "Name",
            localMeta.name,
            (name: any) => {
              setLocalMeta({ ...localMeta, name });
            },
            ""
          )}
        </div>

        <div className={cx("input260", css.inputHolder)}>
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
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  // TODO: IMPORTANT hardcoded
  const breakpointConfig: BreakpointConfiguration | undefined =
    state.project.settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig) => breakpointConfig.type === "large-1"
    );

  return {
    project: omit({ ...state.project }, "diff"),
    meta: state.meta,
    slides: state.project.slides,
    layers: state.project.layers,
    objects: state.project.objects,
    breakpointConfig,
    settings: state.project.settings,
  };
};

const mapDispatchToProps = {
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
  _updateEditor: (editor: Partial<IEditor>) => updateEditor(editor),
};

export default connect(mapStateToProps, mapDispatchToProps)(SavePanel);
