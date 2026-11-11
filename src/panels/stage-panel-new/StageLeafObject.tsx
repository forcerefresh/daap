import { CSSProperties } from "react";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { ICalculatedObjectSize } from "webslider-sdk/lib/objects/objects-register";
import { getObjectHtml } from "../../export/export-html";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";

interface StageLeafObjectProps {
  object: IObject;
  objectStyle: CSSProperties;
  maskStyle: CSSProperties;
  calculatedObjectSizeForObject: ICalculatedObjectSize;
  breakpointConfig?: BreakpointConfiguration;
}

export function StageLeafObject({
  object,
  objectStyle,
  maskStyle,
  calculatedObjectSizeForObject,
  breakpointConfig,
}: StageLeafObjectProps) {
  return (
    <div
      key={object.id + "_1"}
      dangerouslySetInnerHTML={{
        __html:
          getObjectHtml(
            object,
            calculatedObjectSizeForObject,
            false,
            false,
            breakpointConfig?.type,
          ) ||
          getObjectPlaceholder(
            `Object '${object.type}' is not installed.<br/>Go to Library > Extensions (or My Extensions) to install missing extension.`,
          ),
      }}
      style={{
        ...objectStyle,
        ...maskStyle,
        overflow: object.style?.overflow ?? "visible",
      }}
    />
  );
}
