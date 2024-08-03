import React, {
  CSSProperties,
  MouseEventHandler,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cx from "classnames";
import { cloneDeep, includes, last } from "lodash-es";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { ILayer, IObject } from "webslider-sdk/lib/objects/i-object";
import { getZoom } from "../../store/helpers/calculateZoom";
import { ISlide } from "../../store/reducers/i-slides";
import { calculateObjectSize } from "../stage-panel/StagePanelUtils";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import { addTransformPropertiesToStyle } from "webslider-sdk/lib/objects/transform-properties";
import css from "./StagePanelNew.module.scss";
import { IStore } from "../../store/store";
import { withErrorBoundary } from "react-use-error-boundary";
import { connect } from "react-redux";
import { ToolsContext } from "../../utils/tools/ToolsProvider";
import { WithRotationHandle } from "./WithRotationHandle";
import {
  activateObject,
  addObjectsToSelection,
  deactivateObject,
  removeObjectsFromSelection,
  selectForProperties,
  selectForPropertiesProps,
  selectObjects,
  selectObjectsByRect,
  setStageTool,
  setStageZoom,
  setViewPortSize,
  updateObject,
} from "../../store/actions/actions";
import { getObjectHtml } from "../../export/export-html";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";
import { ILayoutChildrenValue } from "webslider-sdk/lib/inputs/i-inputs";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";
import { StageTools } from "../../store/reducers/stage";
import { IRect, getMousePosition } from "../../utils/doom-utils/common";
import {
  getUngroupObjectsCalculation,
  createTransformForPath,
  decomposeMatrix2DW3,
  getFullMatrixFromTransformArr,
  getGroupMatrixFromSelectionPath,
  getObjectTransform,
} from "./stage-panel-utils";
import { ReactComponent as RotateIcon } from "../../assets/icons/rotate-icon.svg";
import { setGlobalProp } from "./utils";
import { Point, Rect } from "../../webslider-sdk/object/i-tool-class";
import useDeepCompareEffect from "use-deep-compare-effect";
import {
  boundsUnion,
  getObjectBoundingBox,
} from "../../store/helpers/objectBoundingBox";
import { StageManagerContext } from "./StageManagerProvider";
import { StageToolEnum } from "../../utils/selection-manager/types";
import { populateObjectThreeIds } from "../../store/actions/actions-utils";
import { WithResizeHandle } from "./WithResizeHandle";

const groupSelectionColor = "#48aff0"; /// "#48f08d";
const objectSelectionColor = "#48aff0";

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

  // // ++
  // const groupsPath = [...selectionPath];
  // groupsPath.shift();

  // const [transformsArray, setTransformArray] = useState<string[]>();

  // const transformArrayRef = useRef<string[]>([]);
  // transformArrayRef.current = createTransformForPath(groupsPath, objectById, {
  //   inverseRotation: false,
  // });

  // useDeepCompareEffect(() => {
  //   const ta = createTransformForPath(groupsPath, objectById, {
  //     inverseRotation: false,
  //   });
  //   //console.log(ta);
  //   transformArrayRef.current = ta;
  //   setTransformArray(ta);
  // }, [groupsPath, objectById]);

  // //console.log(groupsPath);

  // // ++++

  // const childRef = useRef<HTMLDivElement | null>(null);

  // const { stageManager } = useContext(StageManagerContext);

  // const [mouseDiff, setMouseDiff] = useState({ x: 0, y: 0 });

  // const mouseInitialPos = useRef<Point | undefined>();
  // const mouseDiffPos = useRef<Point | undefined>({ x: 0, y: 0 });

  // // NOTE: handleRotation is using cached version of object
  // // we are using ref to access latest object
  // const objectRef = useRef(object);
  // objectRef.current = object;

  // //console.log("AAAAA");

  // // console.log(object?.absoluteLayout?.common?.left);
  // // console.log(object2?.absoluteLayout?.common?.left);

  // const {
  //   activeTool,
  //   activateTool,
  //   activeObjectId: activeEditObjectId,
  // } = useContext(ToolsContext);

  // // const isRotationInProgress = useRef(false);
  // // const handleRotationStart = () => {
  // //   isRotationInProgress.current = true;
  // // };
  // // const handleRotationDone = (rotation: number) => {
  // //   isRotationInProgress.current = false;
  // //   //console.log(objectRef.current?.absoluteLayout?.common?.left);

  // //   // not using object as there is a caching
  // //   const obj = cloneDeep(objectRef.current); //(objectByIdRef.current[object.id]);
  // //   //obj.absoluteLayout!.common!.top = "300px"; //TODO
  // //   //console.log(rotation, "ROTATION");
  // //   obj.rotation = rotation;
  // //   _updateObject(obj);
  // // };

  // const objectId = object.id;
  // const isSelected = selectedObjectIds.indexOf(objectId) !== -1;
  // const isInSelectionPath = selectionPath.indexOf(objectId) !== -1;
  // const isAbsolutePosition = object.layout === "absolute" && !layoutChildren;

  // //const cssPosition = !layoutChildren ? "absolute" : "static";
  // const cssPosition = "absolute";
  // // *** NOTE: we are rendering different for selected and non selected object

  // // 1. NON SELECTED  (NON-DRAGGABLE)

  // //if (!isSelected || !isAbsolutePosition) {
  // //
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
  // //debug
  // // useEffect(() => {
  // //   if (object?.objectIds && object.objectIds.length > 0) {
  // //     getUngroupObjectsCalculation({
  // //       group: object,
  // //       objects: object.objectIds.map((objectId) => objectById[objectId]),
  // //       breakpointConfig: breakpointConfig!,
  // //       parentLayer,
  // //     });
  // //   }
  // // });

  // useLayoutEffect(() => {
  //   const objectHolder = document.getElementsByClassName(
  //     `object-holder-${object.id}`
  //   )[0] as HTMLDivElement;

  //   if (objectHolder) {
  //     objectHolder.style.transform = getObjectTransform(object);

  //     // translateX(" +
  //     // translateX +
  //     // "px) translateY(" +
  //     // translateY +
  //     // "px)";
  //   }
  // }, [object.rotation, object.scale, object.id, object]);

  // // TODO: mode this to parent
  // if (activeEditObjectId === objectId) return null;

  const objectStyle = { ...calculatedObjectSize, left: "0px", top: "0px" };
  // objectStyle.position = cssPosition;
  // if (object.transformDefinition?.values?.hasPerspective) {
  //   objectStyle.perspective = `${object.transformDefinition?.values?.transformPerspective}`;
  // }

  // // object holder
  const objectHolderStyle: CSSProperties = {
    zIndex: 100,
    position: "absolute", //!layoutChildren ? "relative" : "static",
    left: !layoutChildren ? calculatedObjectSize.left : "0px",
    top: !layoutChildren ? calculatedObjectSize.top : "0px",
    width: calculatedObjectSize.width ?? "0px",
    height: calculatedObjectSize.height ?? "0px",
    ...(isRoot
      ? { position: "relative" }
      : { transform: getObjectTransform(object) }),
  };

  // if (layoutChildren?.type === "inline") {
  //   objectHolderStyle.display = "inline-block";
  // }

  // objectHolderStyle.pointerEvents = "none"; // "all";

  // // NOTE: FOR TEXT
  const calculatedObjectSizeForObject = { ...calculatedObjectSize };
  // if (object.definition.values?.autoHeight) {
  //   //calculatedObjectSizeForObject.height = "auto";
  //   //objectStyle.height = "auto";
  // }

  // const isOnlyThisObjectSelected =
  //   selectedObjectIds.length === 1 &&
  //   selectedObjectIds[0] === objectRef.current.id;

  // console.log(
  //   "Obj:" + objectRef.current?.name + " :  sel: " + isOnlyThisObjectSelected
  // );
  // const onObjectClick = (
  //   event: React.MouseEvent<HTMLDivElement>,
  //   objectId: string
  // ) => {
  //   if (event.shiftKey) {
  //     selectedObjectIds.indexOf(objectId) === -1
  //       ? _addObjectsToSelection([objectId])
  //       : _removeObjectsFromSelection([objectId]);
  //     if (activeObjectId === objectId) {
  //       _deactivateObject(objectId);
  //     }

  //     //setSelectionStartPosition(null);
  //   } else {
  //     if (isOnlyThisObjectSelected) {
  //       // NOTE: activate tool editor
  //       const deff = getAppObjectDefinition(objectById[objectId].type);
  //       if (deff?.meta.isEditable) {
  //         // TODO>TODO>>
  //         console.log("Uncomment");
  //         //activateTool(objectById[objectId].type, objectId);
  //       }
  //     }
  //     _activateObject(objectId);
  //     _selectObjects([objectId]);
  //     _selectForProperties({ type: "object", id: objectId });
  //   }
  // };

  // const rootObjectSelection =
  //   selectedObjectIds.length === 0 && !!layerById[object.parentId!];

  // const childObjectInGroupSelection =
  //   selectedObjectIds.length === 1 &&
  //   objectById[selectedObjectIds[0]].objectIds &&
  //   objectById[selectedObjectIds[0]].objectIds!.length > 0 &&
  //   objectById[selectedObjectIds[0]].objectIds?.includes(object.id);

  // let siblingObjectSelection = false;
  // if (selectedObjectIds.length > 0) {
  //   const parentId = objectById[selectedObjectIds[0]].parentId;
  //   if (layerById[object.parentId!]) {
  //     siblingObjectSelection = true;
  //   } else if (objectById[parentId!]?.objectIds?.includes(object.id)) {
  //     siblingObjectSelection = true;
  //   }
  // }

  // let allowObjectSelection =
  //   rootObjectSelection ||
  //   childObjectInGroupSelection ||
  //   siblingObjectSelection;

  // console.log(objectHolderStyle);
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
          const layoutChildren = parentLayer.definition.values.hasLayoutChildren
            ? parentLayer.definition.values.layoutChildren
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
                  breakpointConfig?.type
                  // thumbnailHtmlArr,
                  // slidesCounter
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
