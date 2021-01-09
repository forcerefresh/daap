import React from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./SettingsPanel.module.scss";
import { Button, Tab, Tabs } from "@blueprintjs/core";
import { updateSlideDuration } from "../../store/actions/actions";
import { getNumericFiled } from "../../inputs/input-utils";

interface IAddPanelProps {
  onRequestClose: () => void;
}

export type ISettingsPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IAddPanelProps;

const SettingsPanel: React.FC<ISettingsPanelMergedProps> = (props) => {
  const { slideDuration, _updateSlideDuration } = props;

  const ProjectPanel: React.FunctionComponent = () => (
    <div className="input60">
      {getNumericFiled("Slide duration", slideDuration, (value: number) => {
        _updateSlideDuration(value);
      })}
    </div>
  );

  const GlobalPanel: React.FunctionComponent = () => (
    <div>
      <p>Global Panel (TODO)</p>
    </div>
  );

  return (
    <div className={cx("bp3-dark", css.addPanel)}>
      <div>
        <Tabs>
          <Tab id="project" title="Project Settings" panel={<ProjectPanel />} />
          <Tab id="global" title="Global Settings" panel={<GlobalPanel />} />
          <Tabs.Expander />
          <Button minimal icon="cog" />
        </Tabs>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  slideDuration: state.project.settings.slideDuration,
});

const mapDispatchToProps = {
  _updateSlideDuration: (newValue: number) => updateSlideDuration(newValue),
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPanel);
