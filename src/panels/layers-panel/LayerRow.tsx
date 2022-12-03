import * as React from "react";
import { ILayer } from "../../store/reducers/i-layers";
import cx from "classnames";
import css from "./LayersPanel.module.scss";
import {
  moveObjects,
  selectForPropertiesProps,
} from "../../store/actions/actions";
import { Button, Checkbox, Icon, Popover } from "@blueprintjs/core";
import {
  BreakpointConfiguration,
  Breakpoints,
} from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { cloneDeep, includes, remove } from "lodash-es";
import { getIconByType } from "../../store/reducers/settings";
import { getIconSize, getIconStyle } from "../action-panel/ActionPanel";
import { getResponsiveIcon } from "../../utils/icons/responsive-icons-factory";
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
    breakpointsConfiguration,
    disableVisibility,
    toggleLayer,
    onLayerClick,
    updateLayer,
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
      canDrag: (monitor: DragSourceMonitor) => {
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

  const dropHandler = (item: any, monitor: any) => {
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

  const renderSelectedDevices = (layer: ILayer) => {
    const resVis = layer.responsiveVisibility;
    if (resVis.showAll) {
      return <span className={css.layerResponseVisibilityAll}>ALL</span>;
    } else if (resVis.displayOn.length === 0) {
      return <span className={css.layerResponseVisibilityNone}>NONE</span>;
    } else {
      return breakpointsConfiguration.breakpointsConfiguration.map(
        (bpConfig) => {
          if (!includes(resVis.displayOn, bpConfig.type)) {
            return null;
          }
          const iconName = getIconByType(bpConfig.type);
          const size = getIconSize(iconName);
          const iconStyle = getIconStyle(iconName);

          if (disableVisibility) iconStyle.fill = "#ff5f6d";

          const icon = getResponsiveIcon(
            iconName,
            size.w,
            size.h,
            "lightgray",
            bpConfig.portrait,
            { verticalAlign: "text-bottom", ...iconStyle }
          );

          return icon;
        }
      );
    }
  };

  const renderDeviceOptions = (layer: ILayer) => {
    return breakpointsConfiguration.breakpointsConfiguration.map(
      (bpConfig: BreakpointConfiguration) => {
        if (!bpConfig.enabled) return null;

        const iconName = getIconByType(bpConfig.type);
        const size = getIconSize(iconName);

        const icon = getResponsiveIcon(
          iconName,
          size.w,
          size.h,
          "lightgray",
          bpConfig.portrait
        );

        return (
          <Checkbox
            key={bpConfig.type}
            disabled={layer.responsiveVisibility.showAll}
            checked={
              layer.responsiveVisibility.showAll ||
              includes(layer.responsiveVisibility.displayOn, bpConfig.type)
            }
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              let newLayer = cloneDeep(layer);
              remove(
                newLayer.responsiveVisibility.displayOn,
                (type) => type === bpConfig.type
              );

              if (event.target.checked) {
                newLayer.responsiveVisibility.displayOn.push(bpConfig.type);
              }

              newLayer.responsiveVisibility.showAll = false;
              updateLayer(newLayer);
            }}
          >
            <span
              style={{
                marginRight: "5px",
                verticalAlign: "middle",
              }}
            >
              {icon}
            </span>
            {bpConfig.name}
          </Checkbox>
        );
      }
    );
  };

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
          selectedLayerIds.length > 0 /*1*/ &&
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
          className={cx(css.layerToggle, {
            /*[css.layerOpen]: openLayerById[layer.id],*/
          })}
          small={true}
          icon={isOpen ? "folder-open" : "folder-close"}
        ></Button>

        <div className={css.layerName}>{layer.name}</div>

        <div className={css.layerResponseVisibility}>
          <Popover
            position="bottom"
            usePortal={true}
            minimal
            popoverClassName={css.devicePopup}
          >
            <div className={css.devicesHolder}>
              {renderSelectedDevices(layer)}{" "}
              <Icon icon="caret-down" style={{ marginBottom: "2px" }} />
            </div>
            <div className={css.devicePopup}>
              <div
                style={{
                  textAlign: "left",
                  marginBottom: "15px",
                  color: "gray",
                }}
              >
                {layer.name}
              </div>

              <Checkbox
                checked={layer.responsiveVisibility.showAll}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  const newLayer = cloneDeep(layer);
                  newLayer.responsiveVisibility.showAll = event.target.checked;
                  updateLayer(newLayer);
                }}
              >
                <span
                  style={{
                    marginRight: "5px",
                    verticalAlign: "middle",
                  }}
                >
                  {null}
                </span>
                ALL
              </Checkbox>
              <hr />
              {renderDeviceOptions(layer)}
            </div>
          </Popover>
        </div>
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
