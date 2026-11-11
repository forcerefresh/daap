import { CSSProperties } from "react";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { ILayer } from "../../store/reducers/i-layers";
import StageObject from "./StageObject";

interface StageGroupObjectProps {
  object: IObject;
  objectStyle: CSSProperties;
  maskStyle: CSSProperties;
  groupStyle: string;
  objectById: { [key: string]: IObject };
  parentLayer: ILayer;
  objectZoom: number;
  breakpointConfig?: BreakpointConfiguration;
}

export function StageGroupObject({
  object,
  objectStyle,
  maskStyle,
  groupStyle,
  objectById,
  parentLayer,
  objectZoom,
}: StageGroupObjectProps) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: ".group-object-" + object.id + "{" + groupStyle + "}",
        }}
      ></style>
      <div
        className={"group-object-" + object.id}
        style={{
          ...objectStyle,
          ...maskStyle,
          overflow: object.style?.overflow ?? "visible",
        }}
      >
        {object.objectIds?.map((objectId) => {
          const childObject = objectById[objectId];
          const layoutChildren = parentLayer.properties?.hasLayoutChildren
            ? parentLayer.properties.layoutChildren
            : undefined;
          return (
            <StageObject
              key={objectId}
              object={childObject}
              parentGroup={object}
              layer={parentLayer}
              layoutChildren={layoutChildren}
              objectZoom={objectZoom * (childObject.scale ?? 1)}
            />
          );
        })}
      </div>
    </>
  );
}
