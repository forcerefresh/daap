import React, { useContext, useEffect, useRef, useState } from "react";
import { getObjectToolDefinitions } from "../../objects/objectToolFactory";
import { IToolClass, Rect } from "../../webslider-sdk/object/i-tool-class";
import { getCanvas } from "./ToolsProviderUtils";
import {
  updateObject as updateObjectAction,
  updateObjectForPreview as updateObjectForPreviewAction,
  addNewObject,
  deleteObjects,
} from "../../store/actions/actions";
import { IStore } from "../../store/store";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { useSelector, useStore } from "react-redux";
import { cloneDeep } from "lodash-es";
import { IToolConfig } from "./types";
import {
  CursorContext,
  ICursorContext,
  ICursorStyle,
} from "../../panels/stage-panel-new/CursorProvider";
import { getZoom } from "../../store/helpers/calculateZoom";
import { populateObjectThreeIds } from "../../store/actions/actions-utils";
import { getGroupMatrixFromSelectionPath } from "../../panels/stage-panel-new/stage-panel-utils";

export interface ToolsContextInterface {
  isToolActive: boolean;
  activeTool: string | null;
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
});

export const ToolsProvider = (
  props: React.PropsWithChildren<React.ReactNode>
) => {
  const { children } = props;

  const { dispatch } = useStore<IStore>();

  const { stageZoom, activeLayerId, objectById, allObjects, layerById } =
    useSelector((_state: IStore) => {
      return {
        stageZoom: getZoom(_state.stage, _state.project.settings),
        activeLayerId: _state.project.selection.activeLayerId,
        objectById: _state.project.objects.objectById,
        allObjects: _state.project.objects.allObjects,
        layerById: _state.project.layers.layerById,
      };
    });

  const [cursorStyle, setCursorStyle] = useState<ICursorStyle | undefined>();
  // const { setCursorStyle } = useContext(CursorContext);
  // const state = getState();
  // const activeLayerId = state.project.selection.activeLayerId;
  //const stageZoom = state.stage.zoom;

  //console.log(stageZoom);
  const [toolConfig, setToolConfigState] = useState<IToolConfig>({});
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeObjectId, setActiveObjectId] = useState<
    string | null | undefined
  >(null);

  const activeToolRef = useRef<string | null>(null);

  const activeToolInst = useRef<IToolClass | null>(null);

  const requestDeactivation = () => {
    deactivateTool();
  };

  const requestObjectUpdate = (params: {
    objectValues?: unknown;
    bounds?: Rect;
    isEdit?: boolean;
    objectId?: string;
  }) => {
    //debugger;
    // console.log(params.objectValues);
    // console.log(params);
    if (!params.isEdit) {
      // console.log(params);
      dispatch(
        addNewObject(
          activeLayerId!,
          activeToolRef.current!,
          {
            left: params.bounds?.x ?? 100,
            top: params.bounds?.y ?? 100,
            width: params.bounds?.width ?? 100,
            height: params.bounds?.height ?? 100,
            layout: "absolute" as "absolute",
            absoluteLayout: {
              type: "common" as "common",
              perDevice: [],
              relativeTo: "stage",
              common: {
                deviceType: "common" as "common",
                left: (params.bounds?.x ?? "100") + "px",
                top: (params.bounds?.y ?? "100") + "px",
                width: (params.bounds?.width ?? "100") + "px",
                height: (params.bounds?.height ?? "100") + "px",
              },
            },
          } as any,
          {
            ...(params.objectValues as any),
          }
        )
      );
    } else {
      const newObj = cloneDeep(objectById[params.objectId!]);
      // NOTE maybe replace, rather that merge
      if (params.objectValues) {
        newObj.properties = {
          ...(newObj.properties ?? {}),
          ...(params.objectValues as any),
        };
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
    const stageEl = getCanvas().getElementsByClassName(
      "MainToolStage"
    )[0] as HTMLDivElement;

    const rect = stageEl?.getBoundingClientRect()!;
    const x = (e.pageX - rect.left) / stageZoom; //(e.currentTarget as HTMLElement).offsetLeft;
    const y = (e.pageY - rect.top) / stageZoom; //(e.currentTarget as HTMLElement).offsetTop;

    return { x, y };
  };

  const getObjectTransform = (
    objectId: string,
    options?: { includeTranslate?: boolean }
  ): DOMMatrix => {
    // >>>>>>>>>>>>>>>>>>
    // duplicate 123
    const objectPath: string[] = [];

    populateObjectThreeIds(objectPath, objectId, objectById, layerById);

    console.log(objectPath, "objectPath123");
    const groupsMatrix = getGroupMatrixFromSelectionPath(
      [...objectPath, objectId],
      objectById,
      options
    );

    //groupsMatrix.e = groupsMatrix.f = 0;

    const transform = groupsMatrix.multiply(
      new DOMMatrix("scale(" + stageZoom + ")")
    );

    console.log(transform);

    return transform;
    /////
  };

  const activateTool = (tool: string, objectId?: string) => {
    const toolDef = getObjectToolDefinitions(tool);
    if (toolDef) {
      const object = objectId ? objectById[objectId] : null;
      const values = object?.properties;

      // NOTE: LAYOUT CHANGE
      const x = object?.left;
      const y = object?.top;

      const canvas = getCanvas();

      const clazz = toolDef.toolClass;
      if (clazz) {
        const inst = new clazz();
        inst.activate({
          canvas,
          object,
          requestDeactivation,
          requestObjectUpdate,
          getMousePoint,
          getObjectTransform,
          isEdit: !!objectId,
          editorConfig: { stageZoom },
          objectValues: values,
          objectId,
          position: object ? { x: x ?? 0, y: y ?? 0 } : { x: 0, y: 0 },
          getObjects: (type: string): IObject[] => {
            // console.log(type);
            // console.log(allObjects);
            // console.log(objectById);

            const retObjs: IObject[] = [];
            allObjects.forEach((objectId) => {
              if (objectById[objectId].type === type) {
                retObjs.push(objectById[objectId]);
              }
            });
            return retObjs;
          },
          requestObjectDelete: (objectId: string) => {
            dispatch(deleteObjects([objectId]));
          },
          requestCursorChange: (cursor) => {
            console.log(cursor);
            setCursorStyle(cursor);
          },
        });
        activeToolInst.current = inst;
      }

      setActiveTool(tool);
      setActiveObjectId(objectId);
      activeToolRef.current = tool;
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
      if (objectById[objectId].type === activeTool) {
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
      }}
    >
      {children}
    </ToolsContext.Provider>
  );
};
