import React, { useEffect, useRef, useState } from "react";
import { getObjectToolDefinitions } from "../../objects/objectToolFactory";
import {
  IToolClass,
  Point,
  Rect,
} from "../../webslider-sdk/object/i-tool-class";
import { getCanvas } from "./ToolsProviderUtils";
import { FREE_DRAW } from "../../objects/free-draw/free-draw";
import {
  updateObject as updateObjectAction,
  addNewObject,
  deleteObjects,
} from "../../store/actions/actions";
import { IStore } from "../../store/store";
import { IObject, ObjectType } from "webslider-sdk/lib/objects/i-object";
import { connect, useSelector, useStore } from "react-redux";
import { cloneDeep } from "lodash-es";

// type UpdateType = React.Dispatch<React.SetStateAction<DevelopmentItem[]>>;
// const defaultUpdate: UpdateType = () => [];

export type IToolConfig<T = unknown> = T;

export interface ToolsContextInterface {
  isToolActive: boolean;
  activeTool: string | null;
  activeObjectId?: string | null;
  activateTool: (tool: string, objectId?: string) => void;
  deactivateTool: () => void;
  deleteCurrentObject: () => void;
  applyCurrentObject: () => void;
  deleteObject: (objectId: string) => void;
  // tool state
  toolConfig: IToolConfig;
  updateToolConfig: (state: IToolConfig) => void;
  updateObject: (_object: IObject) => void;
}

export const ToolsContext = React.createContext<ToolsContextInterface>({
  isToolActive: false,
  activeTool: null,
  activeObjectId: null,
  activateTool: (tool: string, objectId?: string) => {},
  deactivateTool: () => {},
  deleteCurrentObject: () => {},
  applyCurrentObject: () => {},
  deleteObject: (objectId: string) => {},
  //
  toolConfig: {},
  updateToolConfig: (_state: unknown) => {},
  updateObject: (_object: IObject) => undefined,
});

export const ToolsProvider = (
  props: React.PropsWithChildren<React.ReactNode>
) => {
  const { children } = props;

  const { dispatch } = useStore<IStore>();

  const { stageZoom, activeLayerId, objectById, allObjects } = useSelector(
    (_state: IStore) => {
      return {
        stageZoom: _state.stage.zoom,
        activeLayerId: _state.project.selection.activeLayerId,
        objectById: _state.project.objects.objectById,
        allObjects: _state.project.objects.allObjects,
      };
    }
  );

  // const state = getState();
  // const activeLayerId = state.project.selection.activeLayerId;
  //const stageZoom = state.stage.zoom;

  console.log(stageZoom);
  const [toolConfig, setToolConfig] = useState<IToolConfig>({});
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
    console.log(params.objectValues);
    console.log(params);
    if (!params.isEdit) {
      console.log(params);
      dispatch(
        addNewObject(
          activeLayerId!,
          activeToolRef.current!,
          {
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
        newObj.definition.values = {
          ...newObj.definition.values,
          ...(params.objectValues as any),
        };
      }

      if (params.bounds) {
        newObj.absoluteLayout!.common.left = params.bounds.x + "px";
        newObj.absoluteLayout!.common.top = params.bounds.y + "px";
        newObj.absoluteLayout!.common.width = params.bounds.width + "px";
        newObj.absoluteLayout!.common.height = params.bounds.height + "px";
      }

      dispatch(updateObjectAction(newObj));
    }
    //deactivateTool();
  };

  const updateObject = (object: IObject) => {
    const newObj = cloneDeep(object);
    dispatch(updateObjectAction(newObj));
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

  const activateTool = (tool: string, objectId?: string) => {
    const toolDef = getObjectToolDefinitions(tool);
    if (toolDef) {
      const object = objectId ? objectById[objectId] : null;
      const values = object?.definition?.values;

      const x = object?.absoluteLayout?.common.left;
      const y = object?.absoluteLayout?.common.top;

      //console.log(values);
      const canvas = getCanvas();

      //console.log(toolDef.toolClass);

      const clazz = toolDef.toolClass;
      const inst = new clazz();
      inst.activate({
        canvas,
        object,
        requestDeactivation,
        requestObjectUpdate,
        getMousePoint,
        isEdit: !!objectId,
        editorConfig: { stageZoom },
        objectValues: values,
        objectId,
        position: object ? { x: x ?? "0", y: y ?? "0" } : { x: "0", y: "0" },
        getObjects: (type: string): IObject[] => {
          console.log(type);
          console.log(allObjects);
          console.log(objectById);

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
      });
      activeToolInst.current = inst;

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
      setToolConfig({});
    }
  };

  const deleteCurrentObject = () => {
    if (activeToolInst.current) {
      activeToolInst.current.deactivate({ delete: true });
      activeToolInst.current = null;
      setActiveTool(null);
      setToolConfig({});
    }
  };

  const deleteObject = (objectId: string) => {
    dispatch(deleteObjects([objectId]));
  };

  const applyCurrentObject = () => {
    if (activeToolInst.current) {
      activeToolInst.current.deactivate({});
      activeToolInst.current = null;
      setActiveTool(null);
      setToolConfig({});
    }
  };

  const updateToolConfig = (config: IToolConfig) => {
    setToolConfig(config);
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
        updateToolConfig,
        //
        updateObject,
      }}
    >
      {children}
    </ToolsContext.Provider>
  );
};
