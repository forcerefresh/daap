import React from "react";
import cx from "classnames";
import { cloneDeep } from "lodash-es";
import { connect } from "react-redux";
import { Button, Label } from "@blueprintjs/core";
import { IStore } from "../../store/store";
import css from "./AlignPanel.module.scss";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { updateObject } from "../../store/actions/actions";
import { getObjectBoundingBox } from "../../store/helpers/objectBoundingBox";

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

  const calculateRightAlignment = (objects: IObject[]) => {
    const topArr: { id: string; left: number }[] = [];

    let maxBB = -1000000;

    objects.forEach((object) => {
      const objBB = getObjectBoundingBox(object);
      maxBB = Math.max(maxBB, Math.abs(objBB.x!) + objBB.width!);
    });

    objects.forEach((object) => {
      const objBB = getObjectBoundingBox(object);
      topArr.push({
        id: object.id,
        left: object.left! + maxBB - (Math.abs(objBB.x!) + objBB.width!),
      });
    });

    return topArr;
  };

  const alignRight = () => {
    if (objects.length <= 1) return;

    const topArr = calculateRightAlignment(objects);

    topArr.forEach((item) => {
      const object = objects.find((o) => o.id === item.id);
      const objectClone = cloneDeep(object);
      objectClone!.left = item.left;
      _updateObject(objectClone!);
    });
  };

  const calculateLeftAlignment = (objects: IObject[]) => {
    const topArr: { id: string; left: number }[] = [];

    let minBB = 1000000;
    const objDiff: any = {};

    objects.forEach((object) => {
      const objBB = getObjectBoundingBox(object);
      minBB = Math.min(minBB, objBB.x!);
      objDiff[object.id] = object.left! - objBB.x!;
    });

    objects.forEach((object) => {
      topArr.push({ id: object.id, left: minBB + objDiff[object.id] });
    });

    return topArr;
  };

  const alignLeft = () => {
    if (objects.length <= 1) return;

    const topArr = calculateLeftAlignment(objects);

    topArr.forEach((item) => {
      const object = objects.find((o) => o.id === item.id);
      const objectClone = cloneDeep(object);
      objectClone!.left = item.left;
      _updateObject(objectClone!);
    });
  };

  const calculateTopAlignment = (objects: IObject[]) => {
    const topArr: { id: string; top: number }[] = [];

    let minBB = 1000000;
    const objDiff: any = {};

    objects.forEach((object) => {
      const objBB = getObjectBoundingBox(object);
      minBB = Math.min(minBB, objBB.y!);
      objDiff[object.id] = object.top! - objBB.y!;
    });

    objects.forEach((object) => {
      topArr.push({ id: object.id, top: minBB + objDiff[object.id] });
    });

    return topArr;
  };

  const calculateBottomAlignment = (objects: IObject[]) => {
    const topArr: { id: string; top: number }[] = [];

    let maxBB = -1000000;

    objects.forEach((object) => {
      const objBB = getObjectBoundingBox(object);
      maxBB = Math.max(maxBB, Math.abs(objBB.y!) + objBB.height!);
    });

    objects.forEach((object) => {
      const objBB = getObjectBoundingBox(object);
      topArr.push({
        id: object.id,
        top: object.top! + maxBB - (Math.abs(objBB.y!) + objBB.height!),
      });
    });

    return topArr;
  };

  const alignTop = () => {
    if (objects.length <= 1) return;

    const topArr = calculateTopAlignment(objects);

    topArr.forEach((item) => {
      const object = objects.find((o) => o.id === item.id);
      const objectClone = cloneDeep(object);
      objectClone!.top = item.top;
      _updateObject(objectClone!);
    });
  };

  const alignBottom = () => {
    if (objects.length <= 1) return;

    const topArr = calculateBottomAlignment(objects);

    topArr.forEach((item) => {
      const object = objects.find((o) => o.id === item.id);
      const objectClone = cloneDeep(object);
      objectClone!.top = item.top;
      _updateObject(objectClone!);
    });
  };

  const alignHorizontalCenter = () => {
    if (objects.length <= 1) return;

    const topArr = calculateTopAlignment(objects);
    const bottomArr = calculateBottomAlignment(objects);

    topArr.forEach((item, idx) => {
      const bottomItem = bottomArr[idx];

      const object = objects.find((o) => o.id === item.id);
      const objectClone = cloneDeep(object);
      objectClone!.top = (item.top + bottomItem.top) / 2;
      _updateObject(objectClone!);
    });
  };

  const alignVerticalCenter = () => {
    if (objects.length <= 1) return;

    const topArr = calculateLeftAlignment(objects);
    const bottomArr = calculateRightAlignment(objects);

    topArr.forEach((item, idx) => {
      const bottomItem = bottomArr[idx];

      const object = objects.find((o) => o.id === item.id);
      const objectClone = cloneDeep(object);
      objectClone!.left = (item.left + bottomItem.left) / 2;
      _updateObject(objectClone!);
    });
  };

  return (
    <div className={cx("bp5-dark", css.alignPanel)}>
      <div className={css.alignHolder}>
        <div>
          <Label>Align objects</Label>
          <div className={css.alignButtonsHolder}>
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
};

export default connect(mapStateToProps, mapDispatchToProps)(AlignPanel);
