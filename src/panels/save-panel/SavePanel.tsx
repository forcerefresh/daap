import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import { cloneDeep, noop, round } from "lodash-es";
import { connect } from "react-redux";
import { Button, Label, Spinner } from "@blueprintjs/core";
import { IStore } from "../../store/store";
import css from "./SavePanel.module.scss";
import { IObject } from "../../objects/types";
import { updateObject, updateProjectMeta } from "../../store/actions/actions";
import { IntegrationContext } from "../../integration";
import {
  getCheckboxField,
  getTextArea,
  getTextField,
} from "../../inputs/input-utils";
import { IMeta } from "../../store/reducers/meta";
import { generatePlayerData } from "../../export/export-html";
import { BreakpointConfiguration } from "../../store/reducers/settings";

const THUMB_WIDTH = 200;

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
    _updateProjectMeta,
  } = props;

  // spinner
  const [showSpinner, setShowSpinner] = useState(false);

  const [html, setHtml] = useState("");
  const [thumbSize, setThumbSize] = useState({ width: 0, height: 0, scale: 0 });

  // local state
  const [localMeta, setLocalMeta] = useState(meta);
  useEffect(() => {
    const metaClone = cloneDeep(meta);
    if (!metaClone.id) metaClone.name = "Slider";
    if (!metaClone.name) metaClone.name = "";
    if (!metaClone.description) metaClone.description = "";
    setLocalMeta(metaClone);
  }, [meta]);

  useEffect(() => {
    breakpointConfig?.normal.slide.width!;

    const scale = THUMB_WIDTH / breakpointConfig!.normal.slide.width!;
    const thumbHeight = scale * breakpointConfig!.normal.slide.height!;
    setThumbSize({ width: THUMB_WIDTH, height: thumbHeight, scale: scale });

    const exportData = generatePlayerData(
      { slides, layers, objects },
      { entityType: "slide", entityId: slides.allSlides[0] },
      breakpointConfig!
    );
    setHtml(exportData.html);
  }, []);

  // api
  const globalContext = useContext(IntegrationContext);
  const { saveProject } = globalContext.useAPIHook();
  const onClickSave = (duplicate = false) => {
    setShowSpinner(true);

    saveProject({
      id: duplicate ? undefined : localMeta.id,
      name: localMeta.name!,
      description: localMeta.description!,
      project,
    }).then(({ id, name, description }) => {
      _updateProjectMeta({ id, name, description });
      setShowSpinner(false);
    });
  };

  return (
    <div className={cx("bp3-dark", css.savePanel)}>
      <div className={cx("bp3-label", css.thumbTitle)}>Thumbnail</div>
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
        <div>{showSpinner && <Spinner size={16} />}</div>
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
            disabled={showSpinner}
            intent="primary"
            icon="floppy-disk"
            onClick={() => onClickSave()}
          >
            Save
          </Button>
          <Button
            disabled={showSpinner}
            intent="primary"
            icon="floppy-disk"
            onClick={() => onClickSave(true)}
          >
            Save as new slider
          </Button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  // TODO: IMPORTANT hardcoded
  const breakpointConfig: BreakpointConfiguration | undefined =
    state.project.settings.breakpointsConfiguration.breakpointsConfiguration.find(
      (breakpointConfig) => breakpointConfig.icon === "laptop"
    );

  return {
    project: state.project,
    meta: state.meta,
    slides: state.project.slides,
    layers: state.project.layers,
    objects: state.project.objects,
    breakpointConfig,
  };
};

const mapDispatchToProps = {
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
};

export default connect(mapStateToProps, mapDispatchToProps)(SavePanel);
