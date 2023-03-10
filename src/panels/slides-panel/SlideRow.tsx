import * as React from "react";
import { ISlide } from "../../store/reducers/i-slides";
import css from "./SlidesPanel.module.scss";
import cx from "classnames";
import { selectForPropertiesProps } from "../../store/actions/actions";
import { Button } from "@blueprintjs/core";
import { IPreviewState } from "../../store/reducers/stage";
import { DragSourceMonitor, useDrag, useDrop } from "react-dnd";
import { useEffect } from "react";
import { getEmptyImage } from "react-dnd-html5-backend";

export interface ISlideRowProps {
  slide: ISlide;
  onSlideClick: (
    event: React.MouseEvent<HTMLDivElement>,
    slideId: string
  ) => void;
  setStagePreview: (preview: Partial<IPreviewState>) => void;
  deleteSlideThree: (id: string) => void;
  onDragingChange: (isDragging: boolean) => void;
  activeSlideId: string | null;
  selectedSlideIds: string[];
  selectionForProperties: selectForPropertiesProps | null;
  realSlideDuration: string;
  realSlideExitDuration: string;
  inPlay: boolean;
  _moveLayers: (
    refId: string,
    where: "above" | "below" | "layer" | "slide" | "bottom",
    moveIds: string[]
  ) => void;
}

export function SlideRow(props: ISlideRowProps) {
  const {
    slide,
    selectedSlideIds,
    activeSlideId,
    selectionForProperties,
    realSlideDuration,
    realSlideExitDuration,
    inPlay,
    onSlideClick,
    setStagePreview,
    deleteSlideThree,
    onDragingChange,
    _moveLayers,
  } = props;

  const dropLayersHandler = (item: any, monitor: any) => {
    _moveLayers(slide.id, "slide", item.ids);
    onSlideClick({} as any, slide.id);
  };

  const [{ isOver: isLayerOver, item }, drop] = useDrop<any, any, any>(() => ({
    accept: "layer",
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      item: monitor.getItem(),
    }),
    drop: dropLayersHandler,
    // canDrop: (monitor: DropTargetMonitor): boolean => {
    //   return slide.layerIds.indexOf(item[0]) !== -1;
    // },
  }));

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "slide",
      // The collect function utilizes a "monitor" instance (see the Overview for what this is)
      // to pull important pieces of state from the DnD system.
      item: {
        ids: selectedSlideIds,
      },
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: (monitor: DragSourceMonitor) => {
        return selectedSlideIds.indexOf(slide.id) !== -1;
      },
    }),
    [selectedSlideIds]
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  useEffect(() => {
    onDragingChange(isDragging);
  }, [isDragging]);

  return (
    <div ref={drop} style={{ position: "relative" }}>
      <div
        className={cx(css.dropHereHint, {
          [css.dropHereHintVisible]: isLayerOver,
        })}
      >
        Drop {item?.ids?.length} layers
      </div>
      <div
        ref={drag}
        key={slide.id}
        onClick={(event) => onSlideClick(event, slide.id)}
        className={cx(
          css.slide,
          {
            [css.selected]:
              selectedSlideIds.length > 0 /*1*/ &&
              selectedSlideIds.indexOf(slide.id) !== -1,
          },
          {
            [css.propertiesActive]:
              selectionForProperties?.id === slide.id &&
              selectionForProperties?.type === "slide",
          },
          {
            [css.active]: slide.id === activeSlideId,
          },
          {
            [css.layerOver]: isLayerOver,
          }
        )}
      >
        <div className={css.actionButtons}>
          <Button
            minimal
            active={inPlay}
            onClick={(e) => {
              e.stopPropagation();
              if (inPlay) {
                setStagePreview({
                  previewState: "stop",
                  isPreview: false,
                  scope: null,
                });
              } else {
                setStagePreview({
                  previewState: "play",
                  isPreview: true,
                  scope: {
                    entityType: "slide",
                    entityId: slide.id,
                  },
                });
              }
            }}
            className={css.playButton}
            small={true}
            icon={inPlay ? "stop" : "play"}
          ></Button>
          {/*<Button
                  minimal
                  onClick={() => setShowSettingsPanelForSlideId(slideId)}
                  className={css.slideProperties}
                  small={true}
                  icon="cog"
                ></Button>*/}
        </div>
        <div className={css.slideDescription}>
          <span className={css.slideName}>{slide.name}</span>
          <span className={css.durationLabel}>
            {realSlideDuration} [{realSlideExitDuration}]
          </span>
        </div>
        <Button
          minimal
          onClick={(event: any) => {
            event.stopPropagation();
            deleteSlideThree(slide.id);
          }}
          className={css.deleteSlide}
          small={true}
          icon="delete"
        ></Button>
      </div>
    </div>
  );
}
