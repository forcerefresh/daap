import { mapValues, pick } from "lodash-es";
import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import cx from "classnames";
import { ILayer } from "../../store/reducers/layers";
import { IStore } from "../../store/store";

import css from "./StagePanel.module.scss";
import { generateExport, getObjectHtml } from "../../export/export-html";

import gsap from "gsap"; // TODO: remove player from here
import SmallTimeline from "./small-timeline/SmallTimeline";
import { ISlide } from "../../store/reducers/slides";
import { setStagePreview } from "../../store/actions/actions";

interface ISize {
  width: number;
  height: number;
}

type IStagePanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const StagePanel: React.FC<IStagePanel> = (props) => {
  const {
    stageSize,
    stageZoom,
    isPreview,
    exportData,
    layerArr,
    objectById,
    activeObjectId,
    slide,
    _setStagePreview,
  } = props;

  // size of visible panel area
  const [viewPortSize, setViewPortSize] = useState<ISize>({
    width: 0,
    height: 0,
  });

  const rootRef = useRef(null);

  const xOffset = (viewPortSize.width - stageSize.width * stageZoom) / 2;
  const yOffset = (viewPortSize.height - stageSize.height * stageZoom) / 2;
  const stageStyle = {
    top: 0 + yOffset + "px",
    left: 0 + xOffset + "px",
    width: stageSize.width * stageZoom + "px",
    height: stageSize.height * stageZoom + "px",
  };

  const canvasStyle: React.CSSProperties = {
    top: 0 + "px",
    left: 0 + "px",
    width: stageSize.width + "px",
    height: stageSize.height + "px",
    transform: "scale(" + stageZoom + ")",
    transformOrigin: "left top",
  };

  useEffect(() => {
    if (rootRef.current) {
      setViewPortSize({
        width: (rootRef.current as any).clientWidth,
        height: (rootRef.current as any).clientHeight,
      });
    }
  }, [rootRef]);

  // TODO: remove player from here
  // player
  // TODO: remove player from here
  const transitionsDataArr = exportData?.transitionsDataArr;
  let tl: gsap.core.Timeline = gsap.timeline();
  tl.from(".fake-non-existing-selektor", {
    duration: (slide?.duration?.customValue || 1) / 1000,
  });

  useEffect(() => {
    if (transitionsDataArr) {
      transitionsDataArr.forEach((data) => {
        if (data.transitions.in) {
          tl.from(
            "." + data.objectClass,
            {
              duration: data.transitions.in.duration / 1000,
              opacity: 0,
            },
            data.transitions.in.delay / 1000
          );
        }
      });

      tl.eventCallback("onComplete", () => {
        _setStagePreview(false);
      });
    }
  }, [transitionsDataArr]);

  const renderTimeInfo = () => {
    // tl.eventCallback("onUpdate", (e) => console.log(tl.progress()));
    return <SmallTimeline tl={tl} />;
  };

  return (
    <div className={css.stagePanel} ref={rootRef}>
      {isPreview && renderTimeInfo()}
      <div style={stageStyle} className={css.stage}>
        <div style={canvasStyle} className={css.canvas}>
          {isPreview && (
            <div
              dangerouslySetInnerHTML={{ __html: exportData?.html as string }}
            ></div>
          )}
          {!isPreview &&
            layerArr?.map((layer) => {
              return layer.objectIds.map((objectId) => {
                const object = objectById[objectId];

                const sizeObj = pick(object, "left", "top", "width", "height");
                const objectStyle = mapValues(sizeObj, (size) => `${size}px`);

                return object.isVisible ? (
                  <>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: getObjectHtml(object),
                      }}
                    />
                    <div
                      key={object.id}
                      className={cx(css[object.type], {
                        [css.active]: activeObjectId === object.id,
                      })}
                      style={objectStyle}
                    />
                  </>
                ) : null;
              });
            })}
        </div>
      </div>
      {/*  {stageSize.width}x {stageSize.height}, {stageZoom} <br />
      {viewPortSize.width}x {viewPortSize.height}*/}
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { slides, layers, objects, selection, stage } = state;
  let layerArr: ILayer[] | null = null;
  let slide: ISlide | null = null;

  if (selection.activeSlideId) {
    const layerIds = slides.slideById[selection.activeSlideId].layerIds;
    layerArr = layerIds.map((layerId) => layers.layerById[layerId]);
    slide = slides.slideById[selection.activeSlideId];
  }

  return {
    stageSize: stage.stageSize,
    stageZoom: stage.zoom,
    isPreview: stage.isPreview,

    exportData: stage.isPreview
      ? generateExport(slides, layers, objects)
      : null,

    layerArr,
    slide,
    objectById: objects.objectById,
    // activeSlideId: selection.activeSlideId,
    // activeLayerId: selection.activeLayerId,
    activeObjectId: selection.activeObjectId,
    // selectedLayerIds: selection.selectedLayerIds,
  };
};

const mapDispatchToProps = {
  _setStagePreview: (isPreview: boolean) => setStagePreview(isPreview),
};

export default connect(mapStateToProps, mapDispatchToProps)(StagePanel);
