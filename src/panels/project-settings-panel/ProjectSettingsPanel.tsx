import { useContext, useEffect, useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./ProjectSettingsPanel.module.scss";
import { Button, FormGroup, Text } from "@blueprintjs/core";
import {
  updateProjectSettings,
  updateSlideBreakpoints,
} from "../../store/actions/actions";
import {
  getColorField,
  getNumericFiled,
  getSelectField,
} from "../../inputs/input-utils";

import settingsCss from "../settings-panel/SettingsPanel.module.scss";
import { ISettings } from "../../store/reducers/i-settings";
import {
  BreakpointConfiguration,
  Breakpoints,
} from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { cloneDeep } from "lodash-es";
import { getDocumentsOptionFromThree } from "../../utils/document/documents-type-utils";
import { IntegrationContext } from "../../integration";
import { SectionHeader } from "../common/section-header/SectionHeader";

enum ProjectPanelSections {
  Project = "Project",
}

export type IProjectPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const ProjectPanel = (props: IProjectPanelMergedProps) => {
  const {
    settings,
    breakpointConfiguration,
    breakpointConfig,
    _updateSlideBreakpoints,
    _updateProjectSettings,
    selectedDeviceIdx,
  } = props;

  const [visibleSectionIds, setVisibleSectionIds] = useState<{
    [key: string]: boolean;
  }>({
    [ProjectPanelSections.Project]: true,
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

  const globalContext = useContext(IntegrationContext);
  const { getDocumentTypeTree } = globalContext.useDocumentsTypeHook();

  useEffect(() => {
    const load = async () => {
      const documentsThree = await getDocumentTypeTree();
      const options = getDocumentsOptionFromThree(documentsThree.documents as any);
      setDocumentsOptions(options);
    };

    load();
  }, []);

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
        <SectionHeader
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
        </SectionHeader>
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
                  {} as any
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
    selectedDeviceIdx,
    breakpointConfig,
    settings: state.project.settings,
    breakpointConfiguration: state.project.settings.breakpoints,
  };
};

const mapDispatchToProps = {
  _updateProjectSettings: (newValue: Partial<ISettings>) =>
    updateProjectSettings(newValue),
  _updateSlideBreakpoints: (slideBreakpoints: Breakpoints) =>
    updateSlideBreakpoints(slideBreakpoints),
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectPanel);
