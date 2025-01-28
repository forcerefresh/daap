import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import { cloneDeep, last, omit, round } from "lodash-es";
import { connect } from "react-redux";
import { Button, Divider, Spinner } from "@blueprintjs/core";
import { IStore } from "../../store/store";
import css from "./ExportPanel.module.scss";
import { updateProjectMeta, updateEditor } from "../../store/actions/actions";
import { IntegrationContext } from "../../integration";
import {
  getNumericFiled,
  getTextArea,
  getTextField,
} from "../../inputs/input-utils";
import { IMeta } from "../../store/reducers/meta";
import { generatePlayerData } from "../../export/export-html";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { IEditor } from "../../store/reducers/editor";
import { RightPanelHeader } from "../common/panel-header/PanelHeader";

export const THUMB_WIDTH = 200;

interface IExportPanelProps {
  onRequestClose: () => void;
}

export type IExportPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IExportPanelProps;

const ExportPanel: React.FC<IExportPanelMergedProps> = (props) => {
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
    themeClass,
  } = props;

  const [thumbnailHtml, setThumbnailHtml] = useState("");
  const [thumbSize, setThumbSize] = useState({ width: 0, height: 0, scale: 0 });

  // local state
  const [formState, setFormState] = useState({
    type: "jpg",
    jpgQuality: 80,
    width: 1,
    height: 1,
    cropLeft: 0,
    cropRight: 0,
    cropTop: 0,
    cropBottom: 0,
  });

  useEffect(() => {
    const newPartialState = {
      width: breakpointConfig?.normal.page.width!,
      height: breakpointConfig?.normal.page.height!,
    };

    setFormState({ ...formState, ...newPartialState });
  }, []);

  useEffect(() => {
    const scale = THUMB_WIDTH / breakpointConfig!.normal.maxSliderSize.width!;
    const thumbHeight = scale * breakpointConfig!.normal.maxSliderSize.height!;
    setThumbSize({ width: THUMB_WIDTH, height: thumbHeight, scale: scale });

    const thumbnailPlayerData = generatePlayerData(
      { slides, layers, objects },
      { entityType: "slide", entityId: slides.pages[0] },
      breakpointConfig!,
      breakpoints,
      settings,
      undefined,
      { isSave: false, isForThumbnail: true }
    );
    setThumbnailHtml(thumbnailPlayerData.html);
  }, []);

  return (
    <div className={cx(themeClass, css.exportPanel)}>
      <div className={cx("bp5-label", css.thumbTitle)}>Preview</div>
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
      <div className={css.exportHolder}>
        <section>
          <div>
            <div className={css.sectionHeader}>Export size</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <div
              className={cx("input400-force", css.inputHolder)}
              style={{ display: "flex" }}
            >
              {getNumericFiled(
                "Width",
                formState.width,
                (width: number) => {
                  setFormState({ ...formState, width });
                },
                ""
              )}
              {getNumericFiled(
                "Height",
                formState.height,
                (height: number) => {
                  setFormState({ ...formState, height });
                },
                ""
              )}
            </div>

            {/* {renderObjectsCards([
            { name: "ss", type: "custom", size: { width: 1, height: 1 } },
          ])} */}
          </div>
        </section>
        <Divider />

        <section>
          <div>
            <div className={css.sectionHeader}>Crop</div>
          </div>
          <div
            className={cx("input400-force", css.inputHolder)}
            style={{ display: "flex" }}
          >
            {getNumericFiled(
              "Left",
              formState.height,
              (height: number) => {
                setFormState({ ...formState, height });
              },
              ""
            )}
            {getNumericFiled(
              "Right",
              formState.height,
              (height: number) => {
                setFormState({ ...formState, height });
              },
              ""
            )}
          </div>
          <div
            className={cx("input400-force", css.inputHolder)}
            style={{ display: "flex" }}
          >
            {getNumericFiled(
              "Top",
              formState.height,
              (height: number) => {
                setFormState({ ...formState, height });
              },
              ""
            )}
            {getNumericFiled(
              "Bottom",
              formState.height,
              (height: number) => {
                setFormState({ ...formState, height });
              },
              ""
            )}
          </div>
        </section>

        <div className={css.actionRow}>
          <div>
            <Button
              disabled={meta.inSaving}
              intent="primary"
              icon="floppy-disk"
              onClick={() => {
                //TODO
              }}
            >
              {"Export"}
            </Button>
          </div>
        </div>
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
  };
};

const mapDispatchToProps = {
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
  _updateEditor: (editor: Partial<IEditor>) => updateEditor(editor),
};

export default connect(mapStateToProps, mapDispatchToProps)(ExportPanel);
