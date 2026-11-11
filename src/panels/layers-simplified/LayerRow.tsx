import * as React from "react";
import { ILayer } from "../../store/reducers/i-layers";
import cx from "classnames";
import css from "./LayersPanel.module.scss";
import {
  selectForPropertiesProps,
} from "../../store/actions/actions";
import { Button } from "@blueprintjs/core";
import { Breakpoints } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { DragSourceMonitor, useDrag, useDrop } from "react-dnd";
import { useEffect } from "react";
import { getEmptyImage } from "react-dnd-html5-backend";

export interface ILayerRowProps {
  layer: ILayer;
  activeLayerId: string | null;
  selectedLayerIds: string[];
  selectionForProperties: selectForPropertiesProps | null;

  isOpen: boolean;
  breakpointsConfiguration: Breakpoints;
  disableVisibility: boolean;
  updateLayer: (layer: ILayer) => void;

  onLayerClick: (
    event: React.MouseEvent<HTMLDivElement>,
    layerId: string
  ) => void;
  toggleLayer: (layerId: string) => void;
  deleteLayers: (layerIds: string[]) => void;
  moveObjects: (
    refId: string,
    where: "above" | "below" | "layer" | "slide" | "bottom",
    moveIds: string[]
  ) => void;
  onDragingChange: (isDragging: boolean) => void;
}

export function LayerRow(props: ILayerRowProps) {
  const {
    layer,
    activeLayerId,
    selectedLayerIds,
    selectionForProperties,
    isOpen,
    toggleLayer,
    onLayerClick,
    deleteLayers,
    moveObjects,
    onDragingChange,
  } = props;

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "layer",
      // The collect function utilizes a "monitor" instance (see the Overview for what this is)
      // to pull important pieces of state from the DnD system.
      item: {
        ids: selectedLayerIds,
      },
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: (_monitor: DragSourceMonitor) => {
        return selectedLayerIds.indexOf(layer.id) !== -1;
      },
    }),
    [selectedLayerIds]
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  useEffect(() => {
    onDragingChange(isDragging);
  }, [isDragging]);

  const dropHandler = (item: any, _monitor: any) => {
    moveObjects(layer.id, "layer", item.ids);
  };

  const [{ isOver: isObjectOver, item }, drop] = useDrop<any, any, any>(() => ({
    accept: "object",
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      item: monitor.getItem(),
    }),
    drop: dropHandler,
  }));

  return (
    <div
      ref={drop}
      style={{ position: "relative" }}
      key={layer?.id}
      onClick={(event) => onLayerClick(event, layer.id)}
      className={cx(css.layerInner, {
        [css.active]: activeLayerId === layer.id,
        [css.propertiesActive]:
          selectionForProperties?.id === layer.id &&
          selectionForProperties.type === "layer", //activeLayerId === layer.id,
        [css.selected]:
          selectedLayerIds.length > 0 &&
          selectedLayerIds.indexOf(layer.id) !== -1,
        [css.layerOver]: isObjectOver,
      })}
    >
      <div ref={drag} className={css.layerInnerInner}>
        <Button
          minimal
          onClick={(event: any) => {
            event.stopPropagation();
            toggleLayer(layer.id);
          }}
          className={cx(css.layerToggle)}
          small={true}
          icon={isOpen ? "folder-open" : "folder-close"}
        ></Button>

        <div className={css.layerName}>{layer.name}</div>
      </div>

      <div
        className={cx(css.dropHereHint, {
          [css.dropHereHintVisible]: isObjectOver,
        })}
      >
        Drop {item?.ids?.length} layers
      </div>
      <div>
        <Button
          minimal
          onClick={(event: any) => {
            event.stopPropagation();
            deleteLayers([layer.id]);
          }}
          className={css.deleteLayer}
          small={true}
          icon="delete"
        ></Button>
      </div>
    </div>
  );
}
