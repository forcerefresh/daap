import { CSSProperties } from "react";
import cx from "classnames";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { calculateObjectSize } from "../stage-panel/StagePanelUtils";
import { getObjectHtml } from "../../export/export-html";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";
import { ILayoutChildrenValue } from "webslider-sdk/lib/inputs/i-inputs";
import { getObjectTransform } from "./stage-panel-utils";
import { ILayer } from "../../store/reducers/i-layers";


type IStageObjectMinimap = {
  isRoot?: boolean;
  object: IObject;
  layoutChildren?: ILayoutChildrenValue;
  parentLayer: ILayer;
  breakpointConfig: BreakpointConfiguration;
  objectById: { [id: string]: IObject<{}> };
};

export function StageObjectMinimap(props: IStageObjectMinimap) {
  const {
    object,
    parentLayer,
    layoutChildren,
    breakpointConfig,
    objectById,
    isRoot,
  } = props;

  if (!object) return <>qwe</>;

  const calculatedObjectSize = calculateObjectSize(
    object,
    parentLayer,
    breakpointConfig!,
    {
      resetPosition: false,
    }
  );

  if (isRoot) {
    calculatedObjectSize.left = "0px";
    calculatedObjectSize.top = "0px";
  }

  const objectStyle = { ...calculatedObjectSize, left: "0px", top: "0px" };

  const objectHolderStyle: CSSProperties = {
    zIndex: 100,
    left: !layoutChildren ? calculatedObjectSize.left : "0px",
    top: !layoutChildren ? calculatedObjectSize.top : "0px",
    width: calculatedObjectSize.width ?? "0px",
    height: calculatedObjectSize.height ?? "0px",
    ...(isRoot
      ? { position: "relative" }
      : {
          transform: getObjectTransform(object),
          position: "absolute", //!layoutChildren ? "relative" : "static",
        }),
  };

  const calculatedObjectSizeForObject = { ...calculatedObjectSize };

  return (
    <div
      style={{
        ...objectHolderStyle,
      }}
      className={cx(`object-holder-${object.id}`)}
    >
      {object.type === "group" ? (
        object.objectIds?.map((objectId) => {
          const object = objectById[objectId]; //objectByIdLocalRef
          const layoutChildren = parentLayer.properties?.hasLayoutChildren
            ? parentLayer.properties.layoutChildren
            : undefined;
          return (
            <StageObjectMinimap
              key={objectId}
              object={object}
              parentLayer={parentLayer}
              layoutChildren={layoutChildren}
              objectById={objectById}
              breakpointConfig={breakpointConfig}
            />
          );
        })
      ) : (
        <>
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
                  `Object '${object.type}' is not installed.<br/>Go to Library > Extensions (or My Extensions) to install missing extension.`
                ),
            }}
            style={objectStyle}
          />
        </>
      )}
    </div>
  );
}

export default StageObjectMinimap;
