import { Card, Elevation, Icon } from "@blueprintjs/core";
import React from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./AddPanel.module.scss";
import { addNewObject } from "../../store/actions/actions";
import { ReactComponent as AddTextboxIcon } from "../../assets/icons/add-textbox2.svg";
import { ReactComponent as PredefinedTextIcon } from "../../assets/icons/predefined-text2.svg";
import { IObject, ObjectType } from "../../objects/types";
import { getObjectDefinitionsByGroup } from "../../objects/objects-factory";
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
            <SVG src={deff.meta.icon || ""} />
            <h3>{deff.meta.name}</h3>
            <p>{deff.meta.description}</p>
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
          <p>Place image content</p>
        </Card>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {/*<Card
            interactive={!!activeLayerId}
            elevation={Elevation.TWO}
            className={cx(css.card, { [css.disabled]: !activeLayerId })}
            onClick={() => {
              if (activeLayerId) {
                _addNewObject(activeLayerId, ObjectType.MULTI_IMAGE, {
                  left: (documentSize.width - 300) / 2,
                  top: (documentSize.height - 300) / 2,
                  width: 300,
                  height: 300,
                });
                onRequestClose();
              }
            }}
          >
            <Icon
              icon="media"
              iconSize={36}
              color="gray"
              style={{ width: "36px", height: "36px", fill: "gray" }}
            />
            <h3>MULTIPLE IMAGES</h3>
            <p>Add multiple images as one object</p>
          </Card>*/}

          <Card
            interactive={!!activeLayerId}
            elevation={Elevation.TWO}
            className={cx(css.card, { [css.disabled]: !activeLayerId })}
            onClick={() => {
              if (activeLayerId) {
                _addNewObject(activeLayerId, ObjectType.VIDEO, {
                  left: (documentSize.width - 960) / 2,
                  top: (documentSize.height - 540) / 2,
                  width: 960,
                  height: 540,
                });
                onRequestClose();
              }
            }}
          >
            <PredefinedTextIcon
              style={{ width: "36px", height: "36px", fill: "gray" }}
            />
            <h3>VIDEO</h3>
            <p>Select video from library</p>
          </Card>

          <Card
            interactive={!!activeLayerId}
            elevation={Elevation.TWO}
            className={cx(css.card, { [css.disabled]: !activeLayerId })}
            onClick={() => {
              if (activeLayerId) {
                _addNewObject(activeLayerId, ObjectType.SVG, {
                  left: (documentSize.width - 100) / 2,
                  top: (documentSize.height - 100) / 2,
                  width: 100,
                  height: 100,
                });
                onRequestClose();
              }
            }}
          >
            <PredefinedTextIcon
              style={{ width: "36px", height: "36px", fill: "gray" }}
            />
            <h3>SVG</h3>
            <p>Add Inline SVG</p>
          </Card>

          {renderObjectsCards("media")}
        </div>
      </div>
      <div>
        <Card interactive={false} className={css.sectionCard}>
          <h1>Text</h1>
          <p>Add text content</p>
        </Card>
        <Card
          interactive={!!activeLayerId}
          elevation={Elevation.TWO}
          className={cx(css.card, { [css.disabled]: !activeLayerId })}
          onClick={() => {
            if (activeLayerId) {
              _addNewObject(activeLayerId, ObjectType.RICH_TEXT, {
                left: documentSize.width / 4,
                top: documentSize.height / 4,
                width: documentSize.width / 2,
                height: documentSize.height / 2,
              });
              onRequestClose();
            }
          }}
        >
          <AddTextboxIcon
            style={{ width: "36px", height: "36px", fill: "gray" }}
          />
          <h3>ADD RICH TEXT BOX</h3>
          <p>Add empty rich text field to active layer</p>
        </Card>
        {renderObjectsCards("text")}
      </div>
      <div>
        <Card interactive={false} className={css.sectionCard}>
          <h1>Navigation</h1>
          <p>Page navigation</p>
        </Card>
        <div>
          <Card
            interactive={!!activeLayerId}
            elevation={Elevation.TWO}
            className={cx(css.card, { [css.disabled]: !activeLayerId })}
            onClick={() => {
              if (activeLayerId) {
                _addNewObject(activeLayerId, ObjectType.BUTTON, {
                  left: (documentSize.width - 300) / 2,
                  top: (documentSize.height - 300) / 2,
                  width: 300,
                  height: 100,
                });
                onRequestClose();
              }
            }}
          >
            <Icon
              icon="link"
              iconSize={36}
              color="gray"
              style={{ width: "36px", height: "36px", fill: "gray" }}
            />
            <h3>BUTTON</h3>
            <p>Add button</p>
          </Card>
          <Card
            interactive={!!activeLayerId}
            elevation={Elevation.TWO}
            className={cx(css.card, { [css.disabled]: !activeLayerId })}
            onClick={() => {
              if (activeLayerId) {
                _addNewObject(activeLayerId, ObjectType.BULLETS, {
                  left: documentSize.width / 4,
                  top: documentSize.height / 4,
                  width: documentSize.width / 2,
                  height: documentSize.height / 2,
                });
                onRequestClose();
              }
            }}
          >
            <AddTextboxIcon
              style={{ width: "36px", height: "36px", fill: "gray" }}
            />
            <h3>BULLETS</h3>
            <p>Add bullets navigation</p>
          </Card>
          <Card
            interactive={!!activeLayerId}
            elevation={Elevation.TWO}
            className={cx(css.card, { [css.disabled]: !activeLayerId })}
            onClick={() => {
              if (activeLayerId) {
                _addNewObject(activeLayerId, ObjectType.ARROW, {
                  left: documentSize.width / 4,
                  top: documentSize.height / 4,
                  width: documentSize.width / 2,
                  height: documentSize.height / 2,
                });
                onRequestClose();
              }
            }}
          >
            <AddTextboxIcon
              style={{ width: "36px", height: "36px", fill: "gray" }}
            />
            <h3>ARROW</h3>
            <p>Add arrow</p>
          </Card>
          {renderObjectsCards("navigation")}
        </div>
      </div>

      {/*<div>
        <Card interactive={false} className={css.sectionCard}>
          <h1>Canvas</h1>
          <p>Add canvas</p>
        </Card>

        <Card
          interactive={!!activeLayerId}
          elevation={Elevation.TWO}
          className={cx(css.card, { [css.disabled]: !activeLayerId })}
          onClick={() => {
            if (activeLayerId) {
              _addNewObject(activeLayerId, ObjectType.SOURCE_IMAGE, {
                left: (documentSize.width - 100) / 2,
                top: (documentSize.height - 100) / 2,
                width: 100,
                height: 100,
              });
              onRequestClose();
            }
          }}
        >
          <PredefinedTextIcon
            style={{ width: "36px", height: "36px", fill: "gray" }}
          />
          <h3>SOURCE IMAGE</h3>
          <p>Add source image</p>
        </Card>

        <Card
          interactive={!!activeLayerId}
          elevation={Elevation.TWO}
          className={cx(css.card, { [css.disabled]: !activeLayerId })}
          onClick={() => {
            if (activeLayerId) {
              _addNewObject(activeLayerId, ObjectType.CANVAS, {});
              onRequestClose();
            }
          }}
        >
          <PredefinedTextIcon
            style={{ width: "36px", height: "36px", fill: "gray" }}
          />
          <h3>CANVAS</h3>
          <p>Add canvas</p>
        </Card>
        </div>*/}

      <div>
        <Card interactive={false} className={css.sectionCard}>
          <h1>Other</h1>
          <p>Various elements</p>
        </Card>

        <Card
          interactive={!!activeLayerId}
          elevation={Elevation.TWO}
          className={cx(css.card, { [css.disabled]: !activeLayerId })}
          onClick={() => {
            if (activeLayerId) {
              _addNewObject(activeLayerId, ObjectType.FRAME, {
                left: (documentSize.width - 100) / 2,
                top: (documentSize.height - 100) / 2,
                width: 100,
                height: 100,
              });
              onRequestClose();
            }
          }}
        >
          <Icon
            icon="square"
            iconSize={36}
            color="gray"
            style={{ width: "36px", height: "36px", fill: "gray" }}
          />
          <h3>EMPTY FRAME</h3>
          <p>Add empty frame</p>
        </Card>
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
