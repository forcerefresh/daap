import React from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import AnimationPanelTabs from "./AnimationPanelTabs";

type IStaticAnimationPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    hideHeader?: boolean;
    className?: string;
  };

const StaticAnimationPanel: React.FC<IStaticAnimationPanel> = (props) => {
  const {
    selectionForProperties,
    hideHeader,
    className,
  } = props;

  return (
    <>
      <AnimationPanelTabs
        id={selectionForProperties?.id}
        itemType={selectionForProperties?.type}
        hideHeader={hideHeader}
        className={className}
      />
    </>
  );
};

const mapStateToProps = (state: IStore) => {
  const selectionForProperties = state.project.selection.selectionForProperties;

  return { selectionForProperties };
};

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StaticAnimationPanel);
