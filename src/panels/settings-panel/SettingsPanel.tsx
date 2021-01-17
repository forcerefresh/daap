import React, { useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./SettingsPanel.module.scss";
import {
  Button,
  Checkbox,
  FormGroup,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import {
  updateGlobalConfiguration,
  updateSlideDuration,
} from "../../store/actions/actions";
import { getNumericFiled } from "../../inputs/input-utils";
import { IGlobals } from "../../store/reducers/globals";

enum GlobalPanelSections {
  UiLayout = "uiLayout",
  OtherSettings = "otherSettings",
}
interface ISettingsPanelProps {
  onRequestClose: () => void;
}

export type ISettingsPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ISettingsPanelProps;

const SettingsPanel: React.FC<ISettingsPanelMergedProps> = (props) => {
  const {
    globals,
    slideDuration,
    _updateSlideDuration,
    _updateGlobalConfiguration,
  } = props;

  const [visibleSectionIds, setVisibleSectionIds] = useState<{
    [key: string]: boolean;
  }>({
    [GlobalPanelSections.UiLayout]: true,
    [GlobalPanelSections.OtherSettings]: true,
  });

  const toggleSection = (section: string) => {
    setVisibleSectionIds({
      ...visibleSectionIds,
      [section]: !visibleSectionIds[section],
    });
  };

  const ProjectPanel: React.FunctionComponent = () => (
    <div className="input60">
      {getNumericFiled("Slide duration", slideDuration, (value: number) => {
        _updateSlideDuration(value);
      })}
    </div>
  );

  const GlobalPanel: React.FunctionComponent = () => (
    <div>
      <section>
        <div
          className={css.sectionHeader}
          onClick={() => toggleSection(GlobalPanelSections.UiLayout)}
        >
          <Button
            minimal
            small={true}
            icon={
              visibleSectionIds[GlobalPanelSections.UiLayout]
                ? "caret-down"
                : "caret-right"
            }
          ></Button>
          App layout
        </div>
        {visibleSectionIds[GlobalPanelSections.UiLayout] && (
          <div className={css.panel}>
            <FormGroup
              helperText="Choose app layout which make app easier for use, improves
              performance, specificity specificity of the projects."
              label="Layout type"
              labelFor="layoutType"
              //requiredLabel={true}
            >
              <RadioGroup
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  _updateGlobalConfiguration({
                    layoutType: e.currentTarget.value,
                  } as Partial<IGlobals>);
                }}
                selectedValue={globals.layoutType}
              >
                <Radio label="Default" value="default" />
                <Radio label="Layers and Effects" value="default-layers" />
              </RadioGroup>
            </FormGroup>
            {/*<FormGroup
              helperText="Helper text with details..."
              label="Show select list for slides"
              labelFor="layoutSlidesSelectionBox"
            >
              <Checkbox
                id="layoutSlidesSelectionBox"
                label="Enabled"
              />
            </FormGroup>*/}
          </div>
        )}
      </section>
      <section>
        <div
          className={css.sectionHeader}
          onClick={() => toggleSection(GlobalPanelSections.OtherSettings)}
        >
          <Button
            minimal
            small={true}
            icon={
              visibleSectionIds[GlobalPanelSections.OtherSettings]
                ? "caret-down"
                : "caret-right"
            }
          ></Button>
          Other
        </div>
        {visibleSectionIds[GlobalPanelSections.OtherSettings] && (
          <div className={css.panel}>
            <p>Other settings in one place</p>
          </div>
        )}
      </section>
    </div>
  );

  return (
    <div className={cx("bp3-dark", css.settingsPanel)}>
      <div>
        <Tabs className={css.tabs}>
          <Tab id="global" title="App Settings" panel={<GlobalPanel />} />
          <Tab id="project" title="Project Settings" panel={<ProjectPanel />} />
          {/*<Tabs.Expander />
          <Button minimal icon="cog" />*/}
        </Tabs>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  slideDuration: state.project.settings.slideDuration,
  globals: state.globals,
});

const mapDispatchToProps = {
  _updateSlideDuration: (newValue: number) => updateSlideDuration(newValue),
  _updateGlobalConfiguration: (globals: Partial<IGlobals>) =>
    updateGlobalConfiguration(globals),
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPanel);
