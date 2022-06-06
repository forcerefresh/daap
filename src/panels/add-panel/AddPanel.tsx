import { Card, Elevation } from "@blueprintjs/core";
import React from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./AddPanel.module.scss";
import { addNewObject } from "../../store/actions/actions";
import { IObject, ObjectType } from "../../webslider-sdk/src/objects/i-object";
import { getObjectDefinitionsByGroup } from "../../webslider-sdk/src/objects/objects-register";
import SVG from "react-inlinesvg";

interface IAddPanelProps {
  onRequestClose: () => void;
  onRequestFontPreview: () => void;
}

export type IAddPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IAddPanelProps;

const AddPanel: React.FC<IAddPanelMergedProps> = (props) => {
  const {
    _addNewObject,
    documentSize,
    activeLayerId,
    onRequestClose,
    onRequestFontPreview,
  } = props;

  const renderObjectsCards = (group: string) => {
    const objDeffs = getObjectDefinitionsByGroup(group);

    return (
      <>
        {objDeffs.map((deff) => (
          <Card
            interactive={!!activeLayerId}
            elevation={Elevation.TWO}
            className={cx(css.card, { [css.disabled]: !activeLayerId })}
            onClick={() => {
              if (activeLayerId) {
                _addNewObject(activeLayerId, deff.type, {
                  left: (documentSize.width - 960) / 2,
                  top: (documentSize.height - 540) / 2,
                  width: 960,
                  height: 540,
                });
                onRequestClose();
              }
            }}
          >
            <div
              style={{
                minHeight: "40px",
                maxWidth: "36px",
                margin: "auto",
              }}
            >
              <SVG src={deff.meta.icon || ""} />
            </div>

            <h3>{deff.meta.name}</h3>
            <p>{deff.meta.description}</p>
            {deff.external && <div className={css.external}>MP</div>}
          </Card>
        ))}
      </>
    );
  };

  return (
    <div className={cx("bp3-dark", css.addPanel)}>
      <div>
        <Card interactive={false} className={css.sectionCard}>
          <h1>Media</h1>
          <p>Image, Video, Svg and other objects that use media resources</p>
        </Card>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {renderObjectsCards("media")}
        </div>
      </div>
      <div>
        <Card interactive={false} className={css.sectionCard}>
          <h1>Text</h1>
          <p>Add text content</p>
        </Card>

        {renderObjectsCards("text")}
      </div>
      <div>
        <Card interactive={false} className={css.sectionCard}>
          <h1>Navigation</h1>
          <p>Navigate bettwen slides or point to extenal page</p>
        </Card>
        <div>{renderObjectsCards("navigation")}</div>
      </div>

      <div>
        <Card interactive={false} className={css.sectionCard}>
          <h1>Other</h1>
          <p>Various objects</p>
        </Card>

        <div>{renderObjectsCards("other")}</div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  activeLayerId: state.project.selection.activeLayerId,
  documentSize: state.project.document.documentSize,
});

const mapDispatchToProps = {
  _addNewObject: (
    layerId: string,
    type: ObjectType | string,
    objectProps: Partial<IObject>
  ) => addNewObject(layerId, type, objectProps),
};

export default connect(mapStateToProps, mapDispatchToProps)(AddPanel);
