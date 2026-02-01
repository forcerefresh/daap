import React, { useContext, useEffect, useRef, useState } from "react";
import { getObjectToolDefinitions } from "../../objects/objectToolFactory";
import {
  SnapBounds,
  IToolClass,
  Point,
  Rect,
} from "../../webslider-sdk/object/i-tool-class";
import { getCanvas, getStage } from "./ToolsProviderUtils";
import {
  updateObject as updateObjectAction,
  updateObjectForPreview as updateObjectForPreviewAction,
  addNewObject,
  deleteObjects,
} from "../../store/actions/actions";
import { IStore } from "../../store/store";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { useSelector, useStore } from "react-redux";
import { cloneDeep, forEach, forOwn } from "lodash-es";
import { IToolConfig } from "./types";
import {
  CursorContext,
  ICursorContext,
  ICursorStyle,
} from "../../panels/stage-panel-new/CursorProvider";
import { getZoom } from "../../store/helpers/calculateZoom";
import {
  isObjectGroup,
  populateObjectThreeIds,
} from "../../store/actions/actions-utils";
import { getGroupMatrixFromSelectionPath } from "../../panels/stage-panel-new/stage-panel-utils";
import {
  getObjectBounds,
  objectPointToStageSpace_New,
  stagePointToObjectSpace_New,
} from "../transform/transform-utils";
import { globals } from "../../store/reducers/globals";
import { ILayer } from "../../store/reducers/i-layers";
import { IPage } from "../../store/reducers/i-pages";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { AppToaster } from "../components/app-toaster/AppToaster";

export interface ToolsContextInterface {
  isToolActive: boolean;
  activeTool: { tool: string; version?: string } | null;
  activeObjectId?: string | null;
  activateTool: (tool: string, objectId?: string) => void;
  deactivateTool: () => void;
  deleteCurrentObject: () => void;
  applyCurrentObject: () => void;
  deleteObject: (object: IObject) => void;
  // tool state
  toolConfig: IToolConfig;
  setToolConfig: (state: IToolConfig) => void;
  updateObject: (_object: IObject) => void;
  updateObjectForPreview: (_object: IObject) => void;

  //
  cursorStyle: ICursorStyle | undefined;
  //
  appZoom?: number;
  //
  snapBounds: { bounds: SnapBounds; objectId: string }[];
}

export const ToolsContext = React.createContext<ToolsContextInterface>({
  isToolActive: false,
  activeTool: null,
  activeObjectId: null,
  activateTool: (tool: string, objectId?: string) => {},
  deactivateTool: () => {},
  deleteCurrentObject: () => {},
  applyCurrentObject: () => {},
  deleteObject: (object: IObject) => {},
  //
  toolConfig: {},
  setToolConfig: (_state: unknown) => {},
  //
  updateObject: (_object: IObject) => undefined,
  updateObjectForPreview: (_object: IObject) => undefined,

  //
  cursorStyle: undefined,
  //
  snapBounds: [],
});

export const ToolsProvider = (
  props: React.PropsWithChildren<React.ReactNode>,
) => {
  const { children } = props;

  const { dispatch } = useStore<IStore>();

  const {
    stageZoom,
    activeLayerId,
    objectById,
    allObjects,
    layerById,
    appZoom,
    globals,
    activePageId,
    allLayers,
    pageById,
    margins,
    pageSize,
  } = useSelector((_state: IStore) => {
    const breakpointConfig: BreakpointConfiguration | undefined =
      _state.project.settings.breakpoints.breakpointsConfiguration.find(
        (breakpointConfig: any) =>
          breakpointConfig.type === _state.stage.selectedDevice,
      );

    return {
      appZoom: _state.globals.appZoom,
      stageZoom: getZoom(_state.stage, _state.project.settings),
      activeLayerId: _state.project.selection.activeLayerId,
      activePageId: _state.project.selection.activeSlideId,

      objectById: _state.project.objects.objectById,
      allObjects: _state.project.objects.allObjects,
      layerById: _state.project.layers.layerById,
      allLayers: _state.project.layers.allLayers,
      pageById: _state.project.pages.pageById,

      margins: breakpointConfig?.normal.margins!,
      pageSize: breakpointConfig?.normal.maxSliderSize!,

      globals: _state.globals,
    };
  });

  const storeRef = useRef({
    stageZoom,
    activeLayerId,
    objectById,
    allObjects,
    layerById,
    activePageId,
    allLayers,
    pageById,
  });
  storeRef.current = {
    stageZoom,
    activeLayerId,
    objectById,
    allObjects,
    layerById,
    activePageId,
    allLayers,
    pageById,
  };

  const [snapBounds, setSnapBounds] = useState<
    { bounds: SnapBounds; objectId: string; snapThreshold: number }[]
  >([]);

  useEffect(() => {
    if (!globals.snapToObject) {
      setSnapBounds([]);
      return;
    }

    const allObjectBounds: {
      bounds: SnapBounds;
      objectId: string;
      snapThreshold: number;
    }[] = [];

    const pageObjects = getPageObjects(storeRef.current);

    pageObjects.forEach((object) => {
      if (isObjectGroup(object)) {
        return;
      }

      const objectPathArr = getObjectPath(object.id, objectById);

      if (objectPathArr.length > 0) {
        const bounds = getObjectBounds(objectPathArr);

        allObjectBounds.push({
          bounds,
          objectId: object.id,
          snapThreshold: globals.snapToObjectThreshold,
        });
      }
    });

    // NOTE: append margins
    if (globals.snapToMargin) {
      const bounds = {
        ...margins,
        right: pageSize.width - margins.right,
        bottom: pageSize.height - margins.bottom,
      };

      allObjectBounds.push({
        objectId: "",
        bounds: {
          ...bounds,
          vcenter: bounds.left + (bounds.right - bounds.left) / 2,
          hcenter: bounds.top + (bounds.bottom - bounds.top) / 2,
        },
        snapThreshold: globals.snapToMarginThreshold,
      });
    }

    if (globals.snapToDocument) {
      const bounds = {
        left: 0,
        top: 0,
        right: pageSize.width,
        bottom: pageSize.height,
      };

      allObjectBounds.push({
        objectId: "",
        bounds: {
          ...bounds,
          vcenter: bounds.right / 2,
          hcenter: bounds.bottom / 2,
        },
        snapThreshold: globals.snapToMarginThreshold,
      });
    }

    setSnapBounds(allObjectBounds);
  }, [
    objectById,
    layerById,
    activePageId,
    pageById,
    allLayers,
    globals.snapToObject,
  ]);

  const [cursorStyle, setCursorStyle] = useState<ICursorStyle | undefined>();
  // const { setCursorStyle } = useContext(CursorContext);
  // const state = getState();
  // const activeLayerId = state.project.selection.activeLayerId;
  //const stageZoom = state.stage.zoom;

  const [toolConfig, setToolConfigState] = useState<IToolConfig>({});
  const [activeTool, setActiveTool] = useState<{
    tool: string;
    version?: string;
  } | null>(null);
  const [activeObjectId, setActiveObjectId] = useState<
    string | null | undefined
  >(null);

  const activeToolRef = useRef<{ tool: string; version?: string } | null>(null);

  const activeToolInst = useRef<IToolClass | null>(null);

  const requestDeactivation = () => {
    deactivateTool();
  };

  const requestObjectUpdate = (params: {
    objectValues?: unknown;
    bounds?: Rect;
    isEdit?: boolean;
    objectId?: string;
    points?: {
      x1: number;
      x2: number;
      y1: number;
      y2: number;
    };
    reactivate: boolean;
  }) => {
    if (!params.isEdit) {
      if (!storeRef.current.activeLayerId) {
        AppToaster.show({
          intent: "warning",
          message: `No layer selected. Please choose a layer first.`,
        });
        return;
      }

      dispatch(
        addNewObject(
          storeRef.current.activeLayerId!,
          activeToolRef.current!.tool, // TODO VERSION
          {
            left: params.bounds?.x ?? 100,
            top: params.bounds?.y ?? 100,
            width: params.bounds?.width ?? 100,
            height: params.bounds?.height ?? 100,
            // layout: "absolute" as "absolute",
            // absoluteLayout: {
            //   type: "common" as "common",
            //   perDevice: [],
            //   relativeTo: "stage",
            //   common: {
            //     deviceType: "common" as "common",
            //     left: (params.bounds?.x ?? "100") + "px",
            //     top: (params.bounds?.y ?? "100") + "px",
            //     width: (params.bounds?.width ?? "100") + "px",
            //     height: (params.bounds?.height ?? "100") + "px",
            //   },
            // },
          },
          {
            ...(params.objectValues as any),
          },
        ),
      );
    } else {
      const newObj = cloneDeep(storeRef.current.objectById[params.objectId!]);
      // NOTE maybe replace, rather that merge
      if (params.objectValues) {
        newObj.properties = {
          ...(newObj.properties ?? {}),
          ...(params.objectValues as any),
        };
      }
      if (params.points) {
        newObj.x1 = params.points.x1;
        newObj.x2 = params.points.x2;
        newObj.y1 = params.points.y1;
        newObj.y2 = params.points.y2;
      }

      if (params.bounds) {
        // NOTE: LAYOUT CHANGE
        newObj.left = params.bounds.x;
        newObj.top = params.bounds.y;
        newObj.width = params.bounds.width;
        newObj.height = params.bounds.height;
      }

      dispatch(updateObjectAction(newObj));
    }

    if (params.reactivate) {
      const tool = activeToolRef.current;
      deactivateTool();
      activateTool(tool!.tool, "latest" /*tool?.version*/, params.objectId);
    }
    //deactivateTool();
  };

  const updateObject = (object: IObject) => {
    const newObj = cloneDeep(object);
    dispatch(updateObjectAction(newObj));
  };

  const updateObjectForPreview = (object: IObject) => {
    const newObj = cloneDeep(object);
    dispatch(updateObjectForPreviewAction(newObj));
  };

  // const updateObject = (params: { objectValues: IObject,, objectId: }) => {
  //   const newObj = cloneDeep(objectById[params.objectId!]);
  //   // NOTE maybe replace, rather that merge
  //   newObj.definition.values = {
  //     ...newObj.definition.values,
  //     ...(params.objectValues as any),
  //   };

  //   dispatch(_updateObject(newObj));
  // };

  const getMousePoint = (e: MouseEvent) => {
    const appRootEl = document.getElementById(
      "daap-forcerefresh-root",
    ) as HTMLDivElement;

    const stageEl = getCanvas().getElementsByClassName(
      "MainToolStage",
    )[0] as HTMLDivElement;

    const stageRect = stageEl?.getBoundingClientRect()!;
    const appRect = appRootEl?.getBoundingClientRect() ?? { x: 0, y: 0 };

    const xx = appRect.x + (appRect.x - stageRect.x) * appZoom;
    const yy = appRect.y + (appRect.y - stageRect.y) * appZoom;

    const x = (e.pageX - stageRect.x) / storeRef.current.stageZoom / appZoom; //(e.currentTarget as HTMLElement).offsetLeft;
    const y = (e.pageY - stageRect.y) / storeRef.current.stageZoom / appZoom; //(e.currentTarget as HTMLElement).offsetTop;

    return { x, y };
  };

  const getObjectTransform = (
    objectId: string,
    options?: { includeTranslate?: boolean; skipStageScale?: boolean },
    overrideObjectSize?: {
      [key: string]: Pick<IObject, "left" | "top" | "width" | "height">;
    },
  ): DOMMatrix => {
    // >>>>>>>>>>>>>>>>>>
    // duplicate 123
    const objectPath: string[] = [];

    populateObjectThreeIds(
      objectPath,
      objectId,
      storeRef.current.objectById,
      storeRef.current.layerById,
    );

    const groupsMatrix = getGroupMatrixFromSelectionPath(
      [...objectPath, objectId],
      storeRef.current.objectById,
      options,
      overrideObjectSize,
    );

    //groupsMatrix.e = groupsMatrix.f = 0;

    const transform = options?.skipStageScale
      ? groupsMatrix
      : groupsMatrix.multiply(new DOMMatrix("scale(" + stageZoom + ")"));

    return transform;
    /////
  };

  const objectPointToStageSpace = (
    objectId: string,
    p: Point,
    includeTranslate = true,
  ) => {
    return objectPointToStageSpace_New(
      [storeRef.current.objectById[objectId]],
      p,
      1, // stageZoom - do not send stage zoom as we have same scale.
    );
    // const objTransform = getObjectTransform(objectId, {
    //   includeTranslate,
    //   skipStageScale: true,
    // });

    // const pointMatrix = new DOMMatrix(
    //   `translateX(${p.x}px) translateY(${p.y}px)`
    // );

    // // return objTransform.transformPoint(p);

    // objTransform.multiplySelf(pointMatrix);
    // const translateX = objTransform.e;
    // const translateY = objTransform.f;

    // return { x: translateX, y: translateY };
  };

  const stagePointToObjectSpace = (
    objectId: string,
    p: Point,
    overrideObjectSize?: Pick<IObject, "left" | "top" | "width" | "height">,
    includeTranslate: boolean = true,
  ) => {
    // return stagePointToObjectSpace_New(
    //   [storeRef.current.objectById[objectId]],
    //   p,
    //   1
    // );

    const objTransform = getObjectTransform(
      objectId,
      {
        includeTranslate,
        skipStageScale: true,
      },
      overrideObjectSize ? { [objectId!]: overrideObjectSize } : {},
    );

    const pointMatrix = new DOMMatrix(
      `translateX(${p.x}px) translateY(${p.y}px)`,
    );

    // return objTransform.transformPoint(p);

    objTransform.invertSelf().multiplySelf(pointMatrix);
    const translateX = objTransform.e;
    const translateY = objTransform.f;

    return { x: translateX, y: translateY };
  };

  const activateTool = (tool: string, version?: string, objectId?: string) => {
    const toolDef =
      getObjectToolDefinitions(tool, version) ??
      getAppObjectDefinition(tool, "latest");

    if (toolDef?.toolClass) {
      const object = objectId ? storeRef.current.objectById[objectId] : null;
      const values = object?.properties;

      // NOTE: LAYOUT CHANGE
      const x = object?.left;
      const y = object?.top;

      const canvas = getCanvas();
      const rootStage = getStage();

      const clazz = toolDef.toolClass;
      if (clazz) {
        const inst = new clazz();
        inst.activate({
          rootStage,
          canvas,
          object,
          requestDeactivation,
          requestObjectUpdate,
          objectPointToStageSpace,
          stagePointToObjectSpace,
          getMousePoint,
          getObjectTransform,
          isEdit: !!objectId,
          editorConfig: { stageZoom },
          objectValues: values,
          objectId,
          position: object ? { x: x ?? 0, y: y ?? 0 } : { x: 0, y: 0 },
          getObjects: (type: string): IObject[] => {
            const retObjs: IObject[] = [];
            allObjects.forEach((objectId) => {
              if (storeRef.current.objectById[objectId].type === type) {
                retObjs.push(storeRef.current.objectById[objectId]);
              }
            });
            return retObjs;
          },
          requestObjectDelete: (objectId: string) => {
            dispatch(deleteObjects([objectId]));
          },
          requestCursorChange: (cursor) => {
            setCursorStyle(cursor);
          },
        });
        activeToolInst.current = inst;
      }

      setActiveTool({ tool, version });
      setActiveObjectId(objectId);
      activeToolRef.current = { tool, version };
    } else {
      console.error(`Tool ${tool} is not registered.`);
    }
  };

  const deactivateTool = () => {
    if (activeToolInst.current) {
      activeToolInst.current.deactivate({});
      activeToolInst.current = null;
      setActiveTool(null);
      setActiveObjectId(null);
      setToolConfigState({});
      setCursorStyle(undefined);
    }
  };

  const deleteCurrentObject = () => {
    if (activeToolInst.current) {
      activeToolInst.current.deactivate({ delete: true });
      activeToolInst.current = null;
      setActiveTool(null);
      setToolConfigState({});
    }
  };

  const deleteObject = (object: IObject) => {
    dispatch(deleteObjects([object.id]));
  };

  const applyCurrentObject = () => {
    if (activeToolInst.current) {
      activeToolInst.current.deactivate({});
      activeToolInst.current = null;
      setActiveTool(null);
      setToolConfigState({});
    }
  };

  const setToolConfig = (config: IToolConfig) => {
    setToolConfigState(config);
    if (activeToolInst.current) {
      activeToolInst.current.toolConfigChange(config);
    }
  };

  useEffect(() => {
    activeToolInst.current?.editorChange({ stageZoom });
  }, [stageZoom]);

  useEffect(() => {
    if (!activeTool) return;

    const retObjs: IObject[] = [];

    allObjects.forEach((objectId) => {
      if (
        objectById[objectId].type === activeTool.tool &&
        objectById[objectId].version === activeTool.version
      ) {
        retObjs.push(objectById[objectId]);
      }
    });
    activeToolInst.current?.objectsChange(retObjs);
  }, [allObjects, objectById, activeTool]);

  return (
    <ToolsContext.Provider
      value={{
        activeTool,
        activeObjectId,

        activateTool,
        deactivateTool,
        deleteCurrentObject,
        deleteObject,
        applyCurrentObject,
        isToolActive: activateTool !== null,
        //
        toolConfig,
        setToolConfig,
        //
        updateObject,
        updateObjectForPreview,
        cursorStyle,
        //
        appZoom,
        //
        snapBounds,
      }}
    >
      {children}
    </ToolsContext.Provider>
  );
};

export function getObjectPath(objectId: string, objectById: any) {
  const objectPathArr: IObject[] = [];
  populateObjectPathRec(objectPathArr, objectId, objectById);
  return objectPathArr;
}

function populateObjectPathRec(
  objectPathArr: IObject[],
  objectId: string,
  objectById: any,
) {
  const object = objectById[objectId];

  if (object) {
    objectPathArr.unshift(object);
    populateObjectPathRec(objectPathArr, object.parentId, objectById);
  }
}

function getPageObjects(store: {
  activeLayerId: string | null;
  objectById: {
    [id: string]: IObject<{}>;
  };
  allObjects: string[];
  layerById: {
    [id: string]: ILayer;
  };
  activePageId: string | null;
  allLayers: string[];
  pageById: {
    [id: string]: IPage;
  };
}) {
  const objects: IObject[] = [];

  const pageLayerIds = store.allLayers.filter((layerId) => {
    const layer = store.layerById[layerId];
    return layer.pageId === store.activePageId;
  });

  forOwn(store.objectById, (obj, objId) => {
    if (pageLayerIds.includes(obj.layerId)) {
      objects.push(obj);
    }
  });

  return objects;
}
