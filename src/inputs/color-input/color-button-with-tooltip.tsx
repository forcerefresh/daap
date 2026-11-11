import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";
import {
  Button,
  Popover,
  PopoverInteractionKind,
  Position,
} from "@blueprintjs/core";

import { rgbaToHex } from "./color-utils";
import { omit } from "lodash-es";
import copyToClipboard from "copy-to-clipboard";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { ColorButton } from "./color-button";

export interface ColorButtonWithTooltipProps {
  color: RGBColor;
  onClick: () => void;
  className?: string;
  onDelete?: () => void;
  onAddToBrand?: () => void;
  small?: boolean;
}

export const ColorButtonWithTooltip: React.FC<ColorButtonWithTooltipProps> = (
  props
) => {
  const { color, onClick, className, onDelete, onAddToBrand, small } = props;

  return (
    <Popover
      interactionKind={PopoverInteractionKind.HOVER}
      position={Position.BOTTOM}
      hoverOpenDelay={500}
      content={
        <div style={{ display: "flex" }}>
          <div style={{ padding: "10px" }}>{rgbaToHex(omit(color, "a"))}</div>
          <Button
            minimal
            icon="duplicate"
            onClick={() => {
              const hexColor = rgbaToHex(omit(color, "a"))!;

              copyToClipboard(hexColor);
              AppToaster.show({
                intent: "success",
                message: `Color ${hexColor} has been copied to clipboard`,
              });
            }}
          ></Button>

          {onAddToBrand && (
            <Button minimal icon="add" onClick={onAddToBrand}>
              Add to brand
            </Button>
          )}

          {onDelete && (
            <Button
              minimal
              icon="trash"
              intent={"danger"}
              onClick={onDelete}
            ></Button>
          )}
        </div>
      }
    >
      <ColorButton
        color={color}
        onClick={onClick}
        className={className}
        small={small}
      />
    </Popover>
  );
};
