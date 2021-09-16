import { Card, Colors, Elevation, Icon } from "@blueprintjs/core";
import React from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./AddPanel.module.scss";
import { addNewObject, setStageTool } from "../../store/actions/actions";
import { ReactComponent as DrawTextboxIcon } from "../../assets/icons/draw-textbox.svg";
import { ReactComponent as AddTextboxIcon } from "../../assets/icons/add-textbox2.svg";
import { ReactComponent as PredefinedTextIcon } from "../../assets/icons/predefined-text2.svg";
import { IObject, ObjectType } from "../../objects/types";
import { StageTools } from "../../store/reducers/stage";
import { ColorInputForm } from "../../inputs/color-input/color-input";

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
    _setStageTool,
    documentSize,
    activeLayerId,
    onRequestClose,
    onRequestFontPreview,
  } = props;

  return (
    <div className={cx("bp3-dark", css.addPanel)}>
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
              _addNewObject(activeLayerId, ObjectType.TEXT, {
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
          <h3>ADD TEXT BOX</h3>
          <p>Add empty text field to active layer</p>
        </Card>
        <Card
          interactive={!!activeLayerId}
          elevation={Elevation.TWO}
          className={cx(css.card, { [css.disabled]: !activeLayerId })}
          onClick={() => {
            if (activeLayerId) {
              _setStageTool(StageTools.DRAW, ObjectType.TEXT);
              onRequestClose();
            }
          }}
        >
          <DrawTextboxIcon
            style={{ width: "36px", height: "36px", fill: "gray" }}
          />
          <h3>DRAW TEXT BOX</h3>
          <p>Draw text box using text tool</p>
        </Card>
        <Card
          interactive={!!activeLayerId}
          elevation={Elevation.TWO}
          className={cx(css.card, { [css.disabled]: !activeLayerId })}
          onClick={() => {
            if (activeLayerId) {
              onRequestFontPreview();
            }
          }}
        >
          <Icon
            icon="font"
            iconSize={36}
            color="gray"
            style={{ width: "36px", height: "36px", fill: "gray" }}
          />
          <h3>PREVIEW FONT</h3>
          <p>Add text by choosing font</p>
        </Card>
      </div>

      <div>
        <Card interactive={false} className={css.sectionCard}>
          <h1>Image</h1>
          <p>Place image content</p>
        </Card>

        <Card
          interactive={!!activeLayerId}
          elevation={Elevation.TWO}
          className={cx(css.card, { [css.disabled]: !activeLayerId })}
          onClick={() => {
            if (activeLayerId) {
              _addNewObject(activeLayerId, ObjectType.IMAGE, {
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
          <h3>IMAGE</h3>
          <p>Position image relative or absolute</p>
        </Card>

        <Card
          interactive={!!activeLayerId}
          elevation={Elevation.TWO}
          className={cx(css.card, { [css.disabled]: !activeLayerId })}
          onClick={() => {
            if (activeLayerId) {
              _addNewObject(activeLayerId, ObjectType.COVER_IMAGE, {});
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
          <h3>COVER IMAGE</h3>
          <p>Fit image to page, stage or guidelines</p>
        </Card>

        <Card
          interactive={!!activeLayerId}
          elevation={Elevation.TWO}
          className={cx(css.card, { [css.disabled]: !activeLayerId })}
          onClick={() => {
            if (activeLayerId) {
              _addNewObject(activeLayerId, ObjectType.GRID_IMAGE, {});
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
          <h3>GRID IMAGE</h3>
          <p>Fit image to grid</p>
        </Card>
      </div>

      <div>
        <Card interactive={false} className={css.sectionCard}>
          <h1>Video</h1>
          <p>Place video content</p>
        </Card>

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
          <h3>EXTERNAL VIDEO</h3>
          <p>Pick predefined style</p>
        </Card>
      </div>

      <div>
        <Card interactive={false} className={css.sectionCard}>
          <h1>HTML</h1>
          <p>Place html content</p>
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
      </div>

      <div>
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
      </div>

      <div>
        <Card interactive={false} className={css.sectionCard}>
          <h1>Empty</h1>
          <p>Add empty element</p>
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
          <h3>FRAME</h3>
          <p>Add empty frame</p>
        </Card>
      </div>

      <div>
        <Card
          interactive={true}
          elevation={Elevation.TWO}
          className={cx(css.card, css.disabled)}
        >
          <h1>Image</h1>
          <p>Place image content</p>
        </Card>
        <Card
          interactive={true}
          elevation={Elevation.TWO}
          className={cx(css.card, css.disabled)}
        >
          <h1>Video</h1>
          <p>Place video content</p>
        </Card>
        <Card
          interactive={true}
          elevation={Elevation.TWO}
          className={cx(css.card, css.disabled)}
        >
          <h1>Vector</h1>
          <p>Place vector content</p>
        </Card>
        <Card
          interactive={true}
          elevation={Elevation.TWO}
          className={cx(css.card, css.disabled)}
        >
          <h1>Animation</h1>
          <p>Place animation content</p>
        </Card>
      </div>
      <div>
        <Card
          interactive={true}
          elevation={Elevation.TWO}
          className={cx(css.card, css.disabled)}
        >
          <h1>Other</h1>
          <p>Place other content</p>
        </Card>
        <Card
          interactive={true}
          elevation={Elevation.TWO}
          className={cx(css.card, css.disabled)}
        >
          <h1>Other</h1>
          <p>Place other content</p>
        </Card>
        <Card
          interactive={true}
          elevation={Elevation.TWO}
          className={cx(css.card, css.disabled)}
        >
          <h1>Other</h1>
          <p>Place other content</p>
        </Card>
        <Card
          interactive={true}
          elevation={Elevation.TWO}
          className={cx(css.card, css.disabled)}
        >
          <h1>Other</h1>
          <p>Place other content</p>
        </Card>
      </div>
      <div>
        <Card
          interactive={true}
          elevation={Elevation.TWO}
          className={cx(css.card, css.disabled)}
        >
          <h1>Other</h1>
          <p>Place other content</p>
        </Card>
        <Card
          interactive={true}
          elevation={Elevation.TWO}
          className={cx(css.card, css.disabled)}
        >
          <h1>Other </h1>
          <p>Place other content</p>
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
    type: ObjectType,
    objectProps: Partial<IObject>
  ) => addNewObject(layerId, type, objectProps),
  _setStageTool: (tool: StageTools, objectType: ObjectType) =>
    setStageTool(tool, objectType),
};

export default connect(mapStateToProps, mapDispatchToProps)(AddPanel);
