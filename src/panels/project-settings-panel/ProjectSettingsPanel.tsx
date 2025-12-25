import React, { useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./ProjectSettingsPanel.module.scss";
import {
  Button,
  Card,
  Colors,
  Elevation,
  FormGroup,
  Text,
} from "@blueprintjs/core";
import {
  setDevice,
  updateProjectSettings,
  updateSlideBreakpoints,
  updateSlideDuration,
} from "../../store/actions/actions";
import {
  getCheckboxField,
  getColorField,
  getNumericFiled,
  getSelectField,
  getUnitNumericFiled,
} from "../../inputs/input-utils";

import settingsCss from "../settings-panel/SettingsPanel.module.scss";
import { Breakpoint } from "./breakpoint-component/Breakpoint";
import { PREVIEW_SIZE } from "./breakpoint-preview/BreakpointPreview";
import { ISettings } from "../../store/reducers/i-settings";
import {
  BreakpointConfiguration,
  Breakpoints,
} from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IGlobalSlideOverlapTime } from "webslider-sdk/lib/common/i-slider-duration";
import { cloneDeep } from "lodash-es";
import { useDocumentsType } from "../../template-generator/hooks/useDocumentType";
import { getDocumentsOptionFromThree } from "../../utils/document/documents-type-utils";

enum ProjectPanelSections {
  Project = "Project",
  Page = "Page",
  Preview = "Preview",
  Breakpoints = "Breakpoints",
}

/*interface IProjectPanelProps {
  onRequestClose: () => void;
}*/

export type IProjectPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>; /*&
  IProjectPanelProps;*/

const ProjectPanel = (props: IProjectPanelMergedProps) => {
  const {
    settings,
    breakpointConfiguration,
    breakpointConfig,
    _updateSlideDuration,
    _updateSlideBreakpoints,
    _updateProjectSettings,
    selectedDeviceIdx,
    _setDevice,
    selectedDevice,
  } = props;

  const [visibleSectionIds, setVisibleSectionIds] = useState<{
    [key: string]: boolean;
  }>({
    [ProjectPanelSections.Project]: true,
    [ProjectPanelSections.Page]: true,
    [ProjectPanelSections.Preview]: true,
    [ProjectPanelSections.Breakpoints]: true,
  });

  const toggleSection = (section: string) => {
    setVisibleSectionIds({
      ...visibleSectionIds,
      [section]: !visibleSectionIds[section],
    });
  };

  const [documentsOptions, setDocumentsOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const { getDocumentTypeTree } = useDocumentsType();
  useEffect(() => {
    const load = async () => {
      const documentsThree = await getDocumentTypeTree();
      const options = getDocumentsOptionFromThree(documentsThree.documents);
      setDocumentsOptions(options);
    };

    load();
  }, []);

  let pixelMultiplier = 1;
  breakpointConfiguration.breakpointsConfiguration.forEach((item) => {
    pixelMultiplier = Math.min(
      pixelMultiplier,
      PREVIEW_SIZE / item.normal.page.width
    );
    pixelMultiplier = Math.min(
      pixelMultiplier,
      PREVIEW_SIZE / item.normal.maxSliderSize.width
    );
    pixelMultiplier = Math.min(
      pixelMultiplier,
      PREVIEW_SIZE / item.normal.maxSliderSize.height
    );
  });

  const enabledDevicesLength =
    breakpointConfiguration.breakpointsConfiguration.filter(
      (bp) => bp.enabled
    ).length;

  const updateMargin = (
    propName: "left" | "top" | "right" | "bottom",
    value: number
  ) => {
    const newBreakpointConfiguration = cloneDeep(breakpointConfig);

    if (!newBreakpointConfiguration!.normal.margins) {
      newBreakpointConfiguration!.normal.margins = {
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
      };
    }

    newBreakpointConfiguration!.normal.margins[propName] = value;

    breakpointConfiguration.breakpointsConfiguration[selectedDeviceIdx] =
      newBreakpointConfiguration!;
    _updateSlideBreakpoints(breakpointConfiguration);
  };

  const updateSize = (propName: "width" | "height", value: number) => {
    const newBreakpointConfiguration = cloneDeep(breakpointConfig);

    newBreakpointConfiguration!.normal.page[propName] = value;
    newBreakpointConfiguration!.normal.maxSliderSize[propName] = value;

    breakpointConfiguration.breakpointsConfiguration[selectedDeviceIdx] =
      newBreakpointConfiguration!;
    _updateSlideBreakpoints(breakpointConfiguration);
  };

  return (
    <div className={css.projectPanel}>
      <section>
        <div
          className={settingsCss.sectionHeader}
          onClick={() => toggleSection(ProjectPanelSections.Project)}
        >
          <Button
            minimal
            small={true}
            icon={
              visibleSectionIds[ProjectPanelSections.Project]
                ? "caret-down"
                : "caret-right"
            }
          ></Button>
          Document
        </div>
        {visibleSectionIds[ProjectPanelSections.Project] && (
          <div className={settingsCss.panel}>
            <FormGroup>
              <div className="input60">
                {getSelectField(
                  "Document type",
                  settings.documentTypeId,
                  documentsOptions,
                  (documentTypeId: any) => {
                    _updateProjectSettings({ documentTypeId });
                  },
                  ""
                )}
              </div>
            </FormGroup>

            <FormGroup>
              <div className="input60">
                {getColorField(
                  "Background color",
                  settings.pageBackgroundColor,
                  (pageBackgroundColor: any) => {
                    _updateProjectSettings({ pageBackgroundColor });
                  },
                  ""
                )}
              </div>
              {/* {getCheckboxField(
                "Auto play",
                settings.autoPlay,
                (autoPlay: boolean) => {
                  _updateProjectSettings({
                    autoPlay: autoPlay,
                  });
                },
                `If disabled start slide manually using "Object > Navigation > Page > Project "`,
                { style: { width: "100px" } }
              )}
              {getCheckboxField(
                "Hide outside content",
                !!settings.hideOutsideContent,
                (hideOutsideContent: boolean) => {
                  _updateProjectSettings({
                    hideOutsideContent: hideOutsideContent,
                  });
                },
                `Content outside the slider bounds will be hidden`,
                { style: { width: "100px" } }
              )} */}
            </FormGroup>

            <div className={css.inlineRow}>
              <Text className={"bp5-label"} style={{ marginBottom: "10px" }}>
                Size
              </Text>

              <div style={{ display: "flex", gap: "10px" }}>
                <div className="input60">
                  {getNumericFiled(
                    "W",
                    breakpointConfig?.normal.page.width ?? 0,
                    (value: number) => {
                      updateSize("width", value);
                    }
                  )}
                </div>
                <div className="input60">
                  {getNumericFiled(
                    "H",
                    breakpointConfig?.normal.page.height ?? 0,
                    (value: number) => {
                      updateSize("height", value);
                    }
                  )}
                </div>
              </div>
            </div>

            <div className={css.inlineRow}>
              <Text className={"bp5-label"} style={{ marginBottom: "10px" }}>
                Margins
              </Text>

              <div style={{ display: "flex", gap: "10px" }}>
                <div className="input60 labelOneLetter">
                  {getNumericFiled(
                    "L",
                    breakpointConfig?.normal.margins?.left ?? 0,
                    (value: number) => {
                      updateMargin("left", value);
                    }
                  )}
                </div>
                <div className="input60 labelOneLetter">
                  {getNumericFiled(
                    "R",
                    breakpointConfig?.normal.margins?.right ?? 0,
                    (value: number) => {
                      updateMargin("right", value);
                    }
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <div className="input60">
                  {getNumericFiled(
                    "T",
                    breakpointConfig?.normal.margins?.top ?? 0,
                    (value: number) => {
                      updateMargin("top", value);
                    }
                  )}
                </div>
                <div className="input60">
                  {getNumericFiled(
                    "B",
                    breakpointConfig?.normal.margins?.bottom ?? 0,
                    (value: number) => {
                      updateMargin("bottom", value);
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* <section>
        <div
          className={settingsCss.sectionHeader}
          onClick={() => toggleSection(ProjectPanelSections.Page)}
        >
          <Button
            minimal
            small={true}
            icon={
              visibleSectionIds[ProjectPanelSections.Page]
                ? "caret-down"
                : "caret-right"
            }
          ></Button>
          Page
        </div>
        {visibleSectionIds[ProjectPanelSections.Page] && (
          <div className={settingsCss.panel}>
            <FormGroup>
              <div className="">
                {getUnitNumericFiled(
                  "Page/Slide duration",
                  settings.slideDuration,
                  (value: string) => {
                    _updateSlideDuration(value);
                  },
                  undefined,
                  { style: { width: "100px" } },
                  ["ms", "s"]
                )}
              </div>
              <div className="">
                {getUnitNumericFiled(
                  "Exit",
                  settings.exitSlideDuration,
                  (value: string) => {
                    _updateProjectSettings({ exitSlideDuration: value });
                  },
                  "Duration before end of page/slide when Out Animation starts. Example: Page/Slide: 10s; Exit: 2s; 10s - 2s= 8s. Out Animation starts at 8th second.",
                  { style: { width: "100px" } },
                  ["ms", "s"]
                )}
              </div>
              <div className="">
                {getCheckboxField(
                  "First slide animation skip",
                  settings.skipFirstSlideAnimation,
                  (skipFirstSlideAnimation: boolean) => {
                    _updateProjectSettings({
                      skipFirstSlideAnimation: skipFirstSlideAnimation,
                    });
                  },
                  "Skip slide animation when first slide start for the first time.",
                  { style: { width: "100px" } }
                )}
              </div>
              <div className="">
                {getSelectField(
                  "Breakpoints reference",
                  settings.breakpointReference,
                  [
                    { label: "Viewport", value: "viewport" },
                    { label: "Parent element", value: "parent" },
                  ],
                  (breakpointReference) => {
                    _updateProjectSettings({ breakpointReference });
                  }
                )}
              </div>
            </FormGroup>
          </div>
        )}
      </section> */}

      {/* <section>
        <div
          className={settingsCss.sectionHeader}
          onClick={() => toggleSection(ProjectPanelSections.Preview)}
        >
          <Button
            minimal
            small={true}
            icon={
              visibleSectionIds[ProjectPanelSections.Preview]
                ? "caret-down"
                : "caret-right"
            }
          ></Button>
          Preview
        </div>
        {visibleSectionIds[ProjectPanelSections.Preview] && (
          <div className={settingsCss.panel}>
            <div
              style={{ marginBottom: "15px", color: Colors.ORANGE5 }}
              className="bp5-form-helper-text"
            >
              Preview configuration are only used for preview inside app. They
              are not aplied to slider configuration.
            </div>
            <FormGroup>
              <div className="input60">
                {getColorField(
                  "Page background color",
                  settings.pageBackgroundColor,
                  (pageBackgroundColor: any) => {
                    _updateProjectSettings({ pageBackgroundColor });
                  },

                  "" //"NOTE: Page color is use used only for preview in the app"
                )}
              </div>

              <div className="input60">
                {getColorField(
                  "Layout box color",
                  settings.layoutBoxBackgroundColor,
                  (layoutBoxBackgroundColor: any) => {
                    _updateProjectSettings({ layoutBoxBackgroundColor });
                  },

                  ""
                )}
              </div>

              <div className="input60">
                {getCheckboxField(
                  "Transparent header",
                  settings.transparentHeader,
                  (transparentHeader: any) => {
                    _updateProjectSettings({ transparentHeader });
                  },
                  ""
                )}
              </div>
            </FormGroup>
          </div>
        )}
      </section> */}

      {/* <section>
        <div
          className={settingsCss.sectionHeader}
          onClick={() => toggleSection(ProjectPanelSections.Breakpoints)}
        >
          <Button
            minimal
            small={true}
            icon={
              visibleSectionIds[ProjectPanelSections.Breakpoints]
                ? "caret-down"
                : "caret-right"
            }
          ></Button>
          Responsive configuration
        </div>
        {visibleSectionIds[ProjectPanelSections.Breakpoints] && (
          <div className={settingsCss.panel}>
            {breakpointConfiguration.breakpointsConfiguration.map(
              (conf: any, idx: number) => (
                <div>
                  <Card
                    interactive={false}
                    elevation={Elevation.TWO}
                    className={cx(css.card, css.breakpointHolder)}
                  >
                    <Breakpoint
                      disableEnableToBeDisabled={enabledDevicesLength === 1}
                      breakpointConfiguration={conf}
                      pixelMultiplier={pixelMultiplier}
                      onChange={(newBreakpointConfiguration) => {
                        breakpointConfiguration.breakpointsConfiguration[idx] =
                          newBreakpointConfiguration;
                        _updateSlideBreakpoints(breakpointConfiguration);

                        //NOTE if we disable currently selected device
                        if (
                          newBreakpointConfiguration.type === selectedDevice &&
                          !newBreakpointConfiguration.enabled
                        ) {
                          const newSelectedDevice =
                            breakpointConfiguration.breakpointsConfiguration.find(
                              (bp) => bp.enabled
                            )?.type;

                          if (newSelectedDevice) _setDevice(newSelectedDevice);
                        }
                      }}
                    />
                  </Card>
                </div>
              )
            )}
          </div>
        )}
      </section> */}
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const breakpointConfig: BreakpointConfiguration | undefined =
    state.project.settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig: any) =>
        breakpointConfig.type === state.stage.selectedDevice
    );

  const selectedDeviceIdx =
    state.project.settings.breakpoints.breakpointsConfiguration.findIndex(
      (breakpointConfig: any) =>
        breakpointConfig.type === state.stage.selectedDevice
    );

  return {
    // selectedDevice: state.stage.selectedDevice,
    selectedDeviceIdx,
    breakpointConfig,
    settings: state.project.settings,
    breakpointConfiguration: state.project.settings.breakpoints,
    selectedDevice: state.stage.selectedDevice,
  };
};

const mapDispatchToProps = {
  _updateSlideDuration: (newValue: string) => updateSlideDuration(newValue),
  _updateProjectSettings: (newValue: Partial<ISettings>) =>
    updateProjectSettings(newValue),
  _updateSlideBreakpoints: (slideBreakpoints: Breakpoints) =>
    updateSlideBreakpoints(slideBreakpoints),
  _setDevice: setDevice,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectPanel);
