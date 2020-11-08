import { Card, Elevation } from "@blueprintjs/core";
import React from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../../store/store";
import css from "./AddPanel.module.scss";
import { addNewObject } from "../../../store/actions/actions";
import { ReactComponent as DrawTextboxIcon } from "../../../assets/icons/draw-textbox.svg";
import { ReactComponent as AddTextboxIcon } from "../../../assets/icons/add-textbox2.svg";
import { ReactComponent as PredefinedTextIcon } from "../../../assets/icons/predefined-text2.svg";
import { IObject, ObjectType } from "../../../objects/types";

interface IAddPanelProps {
  onRequestClose: () => void;
}

export type IAddPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IAddPanelProps;

export const AddPanel: React.FC<IAddPanelMergedProps> = (props) => {
  const { _addNewObject, activeLayerId, onRequestClose } = props;

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
              _addNewObject(activeLayerId, "text", {
                left: 250,
                top: 250,
                width: 300,
                height: 300,
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
              _addNewObject(activeLayerId, "text", {
                left: 150,
                top: 150,
                width: 300,
                height: 300,
              });
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
              _addNewObject(activeLayerId, ObjectType.TEXT, {
                left: 0,
                top: 0,
                width: 300,
                height: 50,
              });
              onRequestClose();
            }
          }}
        >
          <PredefinedTextIcon
            style={{ width: "36px", height: "36px", fill: "gray" }}
          />
          <h3>CHOSE STYLE</h3>
          <p>Pick predefined style</p>
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
  activeLayerId: state.selection.activeLayerId,
});

const mapDispatchToProps = {
  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>
  ) => addNewObject(layerId, type, objectProps),
};

export default connect(mapStateToProps, mapDispatchToProps)(AddPanel);
