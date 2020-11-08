import React from "react";
import { connect } from "react-redux";
import { IObject } from "../../objects/types";
import { ILayer } from "../../store/reducers/layers";
import { IStore } from "../../store/store";
import css from "./TimelinePanel.module.scss";

type ITimelinePanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

export const TimelinePanel: React.FC<ITimelinePanel> = (props) => {
  const { objectArr } = props;
  return (
    <div className={css.wrapper}>
      <div className={css.timeline}>
        <div className={css.timelineHeader}>HEADER</div>
        <div className={css.timelineBody}>
          <div className={css.timelineLeft}>
            {objectArr?.map((object) => {
              return <div> {object.definition.type}</div>;
            })}
          </div>
          <div className={css.timelineRight}>
            {objectArr?.map((object) => {
              return (
                <div className={css.timelineLine}>
                  <div
                    className={css.timelineContent}
                    style={{
                      marginLeft: object.timeline.keyFrames[0].time + "px",
                    }}
                  >
                    {object.definition.type}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { layers, objects, selection } = state;
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
