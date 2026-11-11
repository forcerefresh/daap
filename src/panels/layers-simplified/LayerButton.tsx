import { Button } from "@blueprintjs/core";

import css from "./LayersSimplified.module.scss";
import { useDrop } from "react-dnd";
import { ItemTypes } from "./types";

export interface LayerButtonProps {
  activeLayerId: string | null;
  layerName?: string;
  layerId: string;
  onSelect: (layerId: string) => void;
  onDrop: (layerId: string, items: any) => void;
}

export function LayerButton(props: LayerButtonProps) {
  const { activeLayerId, layerId, onSelect, layerName, onDrop } = props;

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.OBJECT,
    drop: (item) => {
      onDrop(layerId, item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const style = isOver
    ? {
        border: "1px dashed green",
      }
    : { border: "1px solid transparent" };

  return (
    <div ref={drop} style={style}>
      <Button
        className={css.smallButton}
        intent={"primary"}
        active={layerId === activeLayerId}
        minimal
        small
        onClick={() => {
          onSelect(layerId);
        }}
      >
        {layerName}
      </Button>
    </div>
  );
}
