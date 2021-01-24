import React from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import EffectPanel from "./EffectPanel";

type IStaticEffectPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const StaticEffectPanel: React.FC<IStaticEffectPanel> = (props) => {
  const { objectId } = props;

  return <EffectPanel id={objectId} objectType="object" />;
};

const mapStateToProps = (state: IStore) => {
  const activeObjectId = state.project.selection.activeObjectId;
  return { objectId: activeObjectId };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(StaticEffectPanel);
