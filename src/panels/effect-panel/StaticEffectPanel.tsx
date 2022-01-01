import React from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import EffectPanelTabs from "./EffectPanelTabs";

type IStaticEffectPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    hideHeader?: boolean;
    className?: string;
  };

const StaticEffectPanel: React.FC<IStaticEffectPanel> = (props) => {
  const { selectionForProperties, hideHeader, className } = props;

  return (
    <EffectPanelTabs
      id={selectionForProperties?.id}
      itemType={selectionForProperties?.type}
      hideHeader={hideHeader}
      className={className}
    />
  );
};

const mapStateToProps = (state: IStore) => {
  const selectionForProperties = state.project.selection.selectionForProperties;
  return { selectionForProperties };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(StaticEffectPanel);
