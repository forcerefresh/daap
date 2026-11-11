import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import { last, round } from "lodash-es";
import { connect } from "react-redux";
import { Button, Divider, Radio, RadioGroup, Spinner } from "@blueprintjs/core";
import { IStore } from "../../store/store";
import css from "./ExportPanel.module.scss";
import { IntegrationContext } from "../../integration";
import {
  getNumericFiled,
  getSelectSlider,
  getTextField,
} from "../../inputs/input-utils";
import { generatePlayerData } from "../../export/export-html";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { RightPanelHeader } from "../common/panel-header/PanelHeader";
import { generateImages } from "../../utils/image-generator/image-generator-utils";
import JSZip from "jszip";
import FileSaver from "file-saver";
import { SectionHeader } from "../common/section-header/SectionHeader";
import { blobToBase64 } from "../../utils/file/file-utils";

export const THUMB_WIDTH = 200;

interface IExportPanelProps {
  onRequestClose: () => void;
}

export type IExportPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IExportPanelProps;

const ExportPanel: React.FC<IExportPanelMergedProps> = (props) => {
  const {
    meta,
    pages,
    layers,
    objects,
    breakpointConfig,
    settings,
    breakpoints,
    selectedDevice,
    themeClass,
  } = props;

  const { useMyMediaHook, platform } = useContext(IntegrationContext);
  const { uploadToWP } = useMyMediaHook();

  const [exporting, setExporting] = useState(false);

  const [thumbnailHtml, setThumbnailHtml] = useState("");
  const [thumbSize, setThumbSize] = useState({ width: 0, height: 0, scale: 0 });

  // local state
  const [formState, setFormState] = useState({
    imageType: "jpeg",
    imageQuality: 85,
    scale: 1,
    width: breakpointConfig?.normal.page.width!,
    height: breakpointConfig?.normal.page.height!,
    cropLeft: 0,
    cropRight: 0,
    cropTop: 0,
    cropBottom: 0,
    zipFilename: meta.name?.replaceAll(" ", "-") + ".zip",
    imageFilename: meta.name?.replaceAll(" ", "-") + "-{index}.{extension}",
  });

  useEffect(() => {
    const scale = THUMB_WIDTH / breakpointConfig!.normal.maxSliderSize.width!;
    const thumbHeight = scale * breakpointConfig!.normal.maxSliderSize.height!;
    setThumbSize({ width: THUMB_WIDTH, height: thumbHeight, scale: scale });

    const thumbnailPlayerData = generatePlayerData(
      { slides: pages, layers, objects },
      { entityType: "slide", entityId: pages.pages[0] },
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
      <RightPanelHeader title="EXPORT DOCUMENT">
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
            <SectionHeader>Export size</SectionHeader>
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
                  const scale = width / breakpointConfig?.normal.page.width!;
                  const height = breakpointConfig?.normal.page.height! * scale;
                  setFormState({
                    ...formState,
                    width,
                    height: Math.ceil(height),
                    scale: Math.round(scale * 1000) / 1000,
                  });
                },
                "",
                { min: 1, max: 10000 } as any
              )}
              {getNumericFiled(
                "Height",
                formState.height,
                (height: number) => {
                  const scale = height / breakpointConfig?.normal.page.height!;
                  const width = breakpointConfig?.normal.page.width! * scale;
                  setFormState({
                    ...formState,
                    height,
                    width: Math.ceil(width),
                    scale: Math.round(scale * 1000) / 1000,
                  });
                },
                "",
                { min: 1, max: 10000 } as any
              )}
            </div>

          </div>
        </section>
        <Divider />
        <section>
          <div>
            <SectionHeader>Scale</SectionHeader>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <div
              className={cx("input400-force", css.inputHolder)}
              style={{ display: "flex" }}
            >
              {getNumericFiled(
                "Scale",
                formState.scale,
                (scale: number) => {
                  setFormState({
                    ...formState,
                    scale,
                    width: Math.ceil(
                      breakpointConfig?.normal.page.width! * scale
                    ),
                    height: Math.ceil(
                      breakpointConfig?.normal.page.height! * scale
                    ),
                  });
                },
                "",
                {
                  stepSize: 0.1,
                  majorStepSize: 1,
                  max: 100,
                  min: 0.0001,
                } as any // missing min/max
              )}
            </div>

          </div>
        </section>

        <Divider />
        <section>
          <div>
            <SectionHeader>Format</SectionHeader>
          </div>
          <div style={{ paddingLeft: "5px" }}>
            <div
              className={cx("input400-force", css.inputHolder)}
              style={{ display: "flex" }}
            >
              <RadioGroup
                name="image-type"
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  const imageType = e.currentTarget.value as any;
                  setFormState({ ...formState, imageType });
                }}
                selectedValue={formState.imageType}
              >
                <Radio label="PNG" value="png" />
                <Radio label="JPEG" value="jpeg" />
                <Radio label="WEBP" value="webp" />
              </RadioGroup>
            </div>
            {formState.imageType !== "png" && (
              <div
                className={cx("input400-force", css.inputHolder)}
                style={{ display: "flex" }}
              >
                {getSelectSlider(
                  "Quality",
                  formState.imageQuality,
                  {
                    min: 1,
                    max: 100,
                    labelStepSize: 1,
                    stepSize: 1,
                    suffix: "",
                    trackFill: false,
                  },
                  (imageQuality) => {
                    setFormState({ ...formState, imageQuality });
                  },
                  (imageQuality) => {
                    setFormState({ ...formState, imageQuality });
                  }
                )}
              </div>
            )}
          </div>
        </section>

        <section>
          <div>
            <SectionHeader>File names</SectionHeader>
          </div>
          <div style={{ paddingLeft: "5px" }}>
            <div
              className={cx("input400-force", css.inputHolder)}
              style={{ display: "flex" }}
            >
              {getTextField(
                "ZIP filename",
                formState.zipFilename,
                (zipFilename) => {
                  setFormState({ ...formState, zipFilename });
                }
              )}
            </div>

            <div
              className={cx("input400-force", css.inputHolder)}
              style={{ display: "flex" }}
            >
              {getTextField(
                "Image filename",
                formState.imageFilename,
                (imageFilename) => {
                  setFormState({ ...formState, imageFilename });
                },
                "Supported variables: {index} {extension}"
              )}
            </div>

          </div>
        </section>

        <div className={css.actionRow}>
          {platform.hasWpSaveButton && (
            <div>
              <Button
                loading={exporting}
                disabled={meta.inSaving}
                intent="primary"
                icon="floppy-disk"
                onClick={async () => {
                  setExporting(true);
                  const blobImages = await generateImages({
                    breakpointConfig: breakpointConfig!,
                    breakpoints,
                    layers,
                    objects,
                    pages,
                    selectedDevice,
                    settings,
                    extensions: [],
                    imageType: formState.imageType,
                    imageQuality: formState.imageQuality,
                    exportWidth: formState.width,
                    exportHeight: formState.height,
                  });

                  for (let idx = 0; idx < blobImages.length; idx++) {
                    const imageBlob = blobImages[idx];
                    let extension = "png";

                    extension =
                      imageBlob.type.indexOf("jpeg") !== -1
                        ? "jpeg"
                        : extension;
                    extension =
                      imageBlob.type.indexOf("webp") !== -1
                        ? "webp"
                        : extension;

                    const filename = formState.imageFilename
                      .replace("{index}", idx.toString())
                      .replace("{extension}", extension);

                    const imageBase64 = await blobToBase64(imageBlob);

                    await uploadToWP(filename, imageBase64);
                  }

                  setExporting(false);

                  AppToaster.show({
                    intent: "success",
                    message:
                      "The file has been successfully uploaded to the WordPress media library.",
                  });
                }}
              >
                {"Save images to WP media"}
              </Button>
            </div>
          )}

          <div>
            <Button
              loading={exporting}
              disabled={meta.inSaving}
              intent="primary"
              icon="floppy-disk"
              onClick={async () => {
                setExporting(true);
                const blobImages = await generateImages({
                  breakpointConfig: breakpointConfig!,
                  breakpoints,
                  layers,
                  objects,
                  pages,
                  selectedDevice,
                  settings,
                  extensions: [],
                  imageType: formState.imageType,
                  imageQuality: formState.imageQuality,
                  exportWidth: formState.width,
                  exportHeight: formState.height,
                });

                const zip = new JSZip();

                blobImages.forEach((imageBlob, idx) => {
                  let extension = "png";
                  extension =
                    imageBlob.type.indexOf("jpeg") !== -1 ? "jpeg" : extension;
                  extension =
                    imageBlob.type.indexOf("webp") !== -1 ? "webp" : extension;

                  zip.file(
                    formState.imageFilename
                      .replace("{index}", idx.toString())
                      .replace("{extension}", extension),
                    imageBlob
                  );
                });

                zip.generateAsync({ type: "blob" }).then(function (content) {
                  FileSaver.saveAs(
                    content,
                    formState.zipFilename ?? "daap-document-export.zip"
                  );
                  setExporting(false);
                });
              }}
            >
              {"Export & Download"}
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
    meta: state.meta,
    pages: state.project.pages,
    layers: state.project.layers,
    objects: state.project.objects,
    breakpointConfig,
    settings: state.project.settings,
    breakpoints: state.project.settings.breakpoints,
    themeClass: state.project.settings.themeClass,
    selectedDevice: state.stage.selectedDevice,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ExportPanel);
