import classnames from "classnames";
import React from "react";
import { connect } from "react-redux";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { IStore } from "../../store/store";
import css from "./NavigationPanel.module.scss";

type IPropertiesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

export const NavigationPanel: React.FC<IPropertiesPanel> = (props) => {
  const { object } = props;

  const renderObjectProperties = (_object: IObject) => {
    return <></>;
  };

  const renderObject = () => {
    if (!object) {
      return <div>No object selected</div>;
    }

    return renderObjectProperties(object);
  };

  return (
    <div
      className={classnames("propertiesPanel", css.propertiesPanel)}
      key={object?.id}
    >
      <div className={css.propertiesHolder}>{renderObject()}</div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, selection } = state.project;
  const { activeObjectId } = selection;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;

  return {
    object,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationPanel);
