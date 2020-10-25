import React, { Component } from "react";
import { connect } from "react-redux";
import cx from "classnames";
import { IObject } from "../../objects/types";
import { ILayer } from "../../store/reducers/layers";
import { IStore } from "../../store/store";
import css from "./TimelinePanel.module.scss";

type ITimelinePanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

export const TimelinePanel: React.FC<ITimelinePanel> = (props) => {
  const { objectArr, activeObjectId } = props;
  return (
    <div className={css.timeline}>
      <div>Header</div>

      {objectArr?.map((object) => {
        return (
          <div
            className={cx(css.timelineRow, {
              [css.active]: activeObjectId === object.id,
            })}
          >
            <div className={css.timelineHeader}> {object.type}</div>
            <div className={css.timelineContent}>Content</div>
          </div>
        );
      })}
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { slides, layers, objects, selection } = state;
  let layer: ILayer | null = null;
  let objectArr: IObject[] | null = null;

  console.log({ ...selection });
  if (selection.activeLayerId) {
    const layer = layers.layerById[selection.activeLayerId];
    objectArr = layer.objectIds.map((objectId) => objects.objectById[objectId]);
  }

  // layers.allLayers.map((layerId: string) => {});
  return {
    layer,
    objectArr,
    activeObjectId: selection.activeObjectId,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(TimelinePanel);
