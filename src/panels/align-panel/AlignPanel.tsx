import React, { useEffect, useRef } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import { Button, Label } from "@blueprintjs/core";
import css from "./AlignPanel.module.scss";
import { IObject } from "../../objects/types";
import { updateObject } from "../../store/actions/actions";
import { cloneDeep } from "lodash-es";

interface IAlignPanelProps {
  onRequestClose: () => void;
}

export type IAlignPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IAlignPanelProps;

const AlignPanel: React.FC<IAlignPanelMergedProps> = (props) => {
  const { selectedObjectIds, objectById, _updateObject } = props;

  const objects: IObject[] = [];
  selectedObjectIds.forEach((objectId) => {
    objects.push(objectById[objectId]);
  });

  const alignLeft = () => {
    if (objects.length <= 1) return;

    let min = 1000000;
    objects.forEach((object) => {
      min = Math.min(min, object.left!);
    });

    objects.forEach((object) => {
      const objectClone = cloneDeep(object);
      objectClone.left = min;
      _updateObject(objectClone);
    });
  };

  const alignTop = () => {
    if (objects.length <= 1) return;

    let min = 1000000;
    objects.forEach((object) => {
      min = Math.min(min, object.top!);
    });

    objects.forEach((object) => {
      const objectClone = cloneDeep(object);
      objectClone.top = min;
      _updateObject(objectClone);
    });
  };

  const alignRight = () => {
    if (objects.length <= 1) return;

    let max = -1000000;
    objects.forEach((object) => {
      max = Math.max(max, object.left! + object.width!);
    });

    objects.forEach((object) => {
      const objectClone = cloneDeep(object);
      objectClone.left = max - objectClone.width!;
      _updateObject(objectClone);
    });
  };

  const alignBottom = () => {
    if (objects.length <= 1) return;

    let max = -1000000;
    objects.forEach((object) => {
      max = Math.max(max, object.top! + object.height!);
    });

    objects.forEach((object) => {
      const objectClone = cloneDeep(object);
      objectClone.top = max - objectClone.height!;
      _updateObject(objectClone);
    });
  };

  const alignHorizontalCenter = () => {
    if (objects.length <= 1) return;

    let min = 1000000;
    let max = -1000000;
    objects.forEach((object) => {
      max = Math.max(max, object.top! + object.height!);
      min = Math.min(max, object.top!);
    });

    const center = min + (max - min) / 2;

    objects.forEach((object) => {
      const objectClone = cloneDeep(object);
      objectClone.top = center - objectClone.height! / 2;
      _updateObject(objectClone);
    });
  };
  const alignVerticalCenter = () => {
    if (objects.length <= 1) return;

    let min = 1000000;
    let max = -1000000;
    objects.forEach((object) => {
      max = Math.max(max, object.left! + object.width!);
      min = Math.min(max, object.left!);
    });

    const center = min + (max - min) / 2;

    objects.forEach((object) => {
      const objectClone = cloneDeep(object);
      objectClone.left = center - objectClone.width! / 2;
      _updateObject(objectClone);
    });
  };

  const distributeVerticalCenter = () => {
    //  ->|  |  |  |<- min and max objects center
    // devide max-min with objects.length-1
    // set position to object other than first and last

    if (objects.length <= 2) return;

    objects.sort((a, b) => {
      return a.top! + a.height! >= b.top! + b.height! ? 1 : -1;
    });

    let minCenter = 1000000;
    let maxCenter = -1000000;
    objects.forEach((object) => {
      minCenter = Math.min(minCenter, object.top! + object.height! / 2);
      maxCenter = Math.max(maxCenter, object.top! + object.height! / 2);
    });

    const delta = (maxCenter - minCenter) / (objects.length - 1);
    const centerObjects = objects.slice(1, objects.length - 1);

    centerObjects.forEach((object, idx) => {
      const objectClone = cloneDeep(object);
      objectClone.top = minCenter + delta * (idx + 1) - object.height! / 2;
      _updateObject(objectClone);
    });
  };

  const distributeHorizontalCenter = () => {
    //  ->|  |  |  |<- min and max objects center
    // devide max-min with objects.length-1
    // set position to object other than first and last

    if (objects.length <= 2) return;

    objects.sort((a, b) => {
      return a.left! + a.width! >= b.left! + b.width! ? 1 : -1;
    });

    let minCenter = 1000000;
    let maxCenter = -1000000;
    objects.forEach((object) => {
      minCenter = Math.min(minCenter, object.left! + object.width! / 2);
      maxCenter = Math.max(maxCenter, object.left! + object.width! / 2);
    });

    const delta = (maxCenter - minCenter) / (objects.length - 1);
    const centerObjects = objects.slice(1, objects.length - 1);

    console.log(minCenter);

    console.log(maxCenter);

    console.log(delta);
    centerObjects.forEach((object, idx) => {
      const objectClone = cloneDeep(object);
      objectClone.left = minCenter + delta * (idx + 1) - object.width! / 2;
      _updateObject(objectClone);
    });
  };

  return (
    <div className={cx("bp3-dark", css.alignPanel)}>
      <div className={css.panelHeader}>
        <div>ALIGN &amp; DISTRIBUTE PANEL</div>
      </div>
      <div className={css.alignHolder}>
        <Label>Align</Label>
        <div>
          <Button minimal icon="alignment-left" onClick={alignLeft} />
          <Button minimal icon="alignment-right" onClick={alignRight} />
          <Button minimal icon="alignment-top" onClick={alignTop} />
          <Button minimal icon="alignment-bottom" onClick={alignBottom} />
          <Button
            minimal
            icon="alignment-horizontal-center"
            onClick={alignHorizontalCenter}
          />
          <Button
            minimal
            icon="alignment-vertical-center"
            onClick={alignVerticalCenter}
          />
        </div>
        <Label>Distribute</Label>
        <div>
          <Button
            minimal
            icon="vertical-distribution"
            onClick={distributeVerticalCenter}
          />
          <Button
            minimal
            icon="horizontal-distribution"
            onClick={distributeHorizontalCenter}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  selectedObjectIds: state.project.selection.selectedObjectIds,
  objectById: state.project.objects.objectById,
});

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),

  // doJump: (jumpIdx: number) => doJump(jumpIdx),
  // doUndo: () => doUndo(),
  // doRedo: () => doRedo(),
};

export default connect(mapStateToProps, mapDispatchToProps)(AlignPanel);
