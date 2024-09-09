import { cloneDeep, compact, forIn, omit, remove, without } from "lodash-es";
import {
  ActionTypes,
  ADD_LAYER,
  ADD_OBJECT,
  CREATE_NEW_PROJECT,
  DELETE_LAYERS,
  DELETE_OBJECTS,
  DELETE_SLIDE,
  DUPLICATE,
  MOVE_OBJECTS,
  OPEN_PROJECT,
  UPDATE_LAYER,
  MOVE_LAYERS,
  GROUP_OBJECTS,
  UNGROUP_OBJECTS,
  CLIPBOARD_PASTE_OBJECTS,
} from "../actions/actions";
import update from "immutability-helper";
import { EmptyID } from "../types";
import { ILayers } from "./i-layers";
import {
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";
import { applyNewAnimationIdsToTransitionAbleElement } from "./objects";
import { getAbsEl } from "../../panels/stage-panel-new/WithRotationHandle";
import { Rect } from "../../webslider-sdk/object/i-tool-class";

const getLayersDefault = () => ({ layerById: {}, allLayers: [] });

export function layers(
  state: ILayers = getLayersDefault(),
  action: ActionTypes
) {
  switch (action.type) {
    case ADD_LAYER: {
      const layer = action.payload;

      return Object.assign({}, state, {
        layerById: {
          ...state.layerById,
          ...{ [layer.id]: layer },
        },
        allLayers: [...state.allLayers, layer.id],
      });
    }
    case UPDATE_LAYER: {
      const layer = action.payload;
      return Object.assign({}, state, {
        layerById: {
          ...state.layerById,
          ...{ [layer.id]: { ...layer } },
        },
      });
    }
    case ADD_OBJECT: {
      const object = action.payload;

      //  condition to prevent adding object to layer when object is added to group
      if (object.parentId && state.layerById[object.parentId]) {
        return update(state, {
          layerById: {
            [object.layerId]: {
              objectIds: { $push: [object.id] },
              //nextObjectIdCounter: (idx) => idx + 1,
            },
          },
        });
      }

      return state;
    }

    case GROUP_OBJECTS: {
      const { group, objectIds, groupIdsForRemoval } = action.payload;

      // do nothing if parent is not
      if (!state.layerById[group.parentId!]) {
        return state;
      }

      const newState = cloneDeep(state);

      // get index for group add
      let firstIndex = 0;
      newState.layerById[group.parentId!].objectIds?.forEach((id, idx) => {
        if (!firstIndex && objectIds.includes(id)) {
          firstIndex = idx;
        }
      });

      // remove object
      forIn(newState.layerById, function (layer, _layerId) {
        remove(layer.objectIds, (objectId) => {
          // note, remove object or removed groups
          return (
            objectIds.indexOf(objectId) !== -1 ||
            groupIdsForRemoval.indexOf(objectId) !== -1
          );
        });
      });

      // add group

      console.log(group.parentId);
      //console.log(newState.layerById[group.parentId]);

      // only if parentId is layer (exist)
      newState.layerById[group.parentId!].objectIds.splice(
        firstIndex,
        0,
        group.id
      );

      console.log(cloneDeep(newState));
      return newState;
    }
    case UNGROUP_OBJECTS: {
      const { groupId, parentId, objectIds } = action.payload;

      //ungroupTransformCalc(groupId, objectIds);

      const newState = cloneDeep(state);

      if (newState.layerById[parentId]) {
        newState.layerById[parentId].objectIds = without(
          newState.layerById[parentId].objectIds,
          groupId
        );
        newState.layerById[parentId].objectIds = [
          ...newState.layerById[parentId].objectIds,
          ...objectIds,
        ];
      }

      // return update(state, {
      //   layerById: {
      //     [object.layerId]: {
      //       objectIds: { $push: [object.id] },
      //       //nextObjectIdCounter: (idx) => idx + 1,
      //     },
      //   },
      // });

      return newState;
    }
    case CLIPBOARD_PASTE_OBJECTS: {
      const { newObjectMapping, objectIds, operation } = action.payload;

      const newState = cloneDeep(state);
      newObjectMapping.forEach((objectMap) => {
        const layer = newState.layerById[objectMap.toLayerId];
        layer.objectIds.push(objectMap.newObjectId);
      });

      if (operation === "cut") {
        forIn(newState.layerById, function (layer, _layerId) {
          remove(layer.objectIds, (objectId) => {
            return objectIds.indexOf(objectId) !== -1;
          });
        });
      }
      // if (action.payload.operation === "cut") {
      //   forEach(newState.layerById);
      // }

      return newState;
    }
    case DUPLICATE: {
      // Note: this part duplicate object
      const newState = cloneDeep(state);
      const dS = action.payload;
      dS.forEach((slideItem) => {
        slideItem.childs.forEach((layerItem) => {
          const fromLayer = state.layerById[layerItem.fromId];

          if (!layerItem.skipCreate) {
            const toLayer = cloneDeep(fromLayer);
            applyNewAnimationIdsToTransitionAbleElement(toLayer);
            toLayer.id = layerItem.toId!;
            toLayer.name += " (copy)";
            toLayer.objectIds = layerItem.childs.map((item) => item.toId!);
            toLayer.slideId = slideItem.toId!;
            newState.allLayers.push(toLayer.id);
            newState.layerById[toLayer.id] = toLayer;
          } else {
            const toLayer = cloneDeep(fromLayer);
            // add new layer ids if skipCreate is not true
            const objectIdToAdd = layerItem.childs.map((item) =>
              item.skipCreate ? undefined : item.toId!
            );
            toLayer.objectIds = [
              ...toLayer.objectIds,
              ...compact(objectIdToAdd),
            ];
            toLayer.slideId = slideItem.toId!;
            newState.layerById[toLayer.id] = toLayer;
          }
        });
      });
      return newState;
    }
    case DELETE_LAYERS: {
      const layersToDeleteIds = action.payload;

      const layerById = omit(state.layerById, layersToDeleteIds);
      const allLayers = without(state.allLayers, ...layersToDeleteIds);
      return { ...state, layerById, allLayers };
    }
    case DELETE_SLIDE: {
      const deleteId = action.payload.slideId;
      const layersToDeleteIds: string[] = Object.values(state.layerById)
        .filter((layer) => layer.slideId === deleteId)
        .map((layer) => layer.id);

      const layerById = omit(state.layerById, layersToDeleteIds);
      const allLayers = without(state.allLayers, ...layersToDeleteIds);
      return { ...state, layerById, allLayers };
    }

    case DELETE_OBJECTS: {
      const deleteObjectIds = action.payload;
      const newState = cloneDeep(state);

      forIn(newState.layerById, function (layer, _layerId) {
        remove(layer.objectIds, (objectId) => {
          return deleteObjectIds.indexOf(objectId) !== -1;
        });
      });

      return newState;

      forIn(newState.layerById, function (layer, _layerId) {
        if (layer.objectIds.indexOf(deleteObjectIds[0]) !== -1) {
          layerId = _layerId;
        }
      });

      // find layerId by first delete object id (all delete object ids belong to one layer)
      let layerId: string = EmptyID;
      forIn(state.layerById, function (layer, _layerId) {
        if (layer.objectIds.indexOf(deleteObjectIds[0]) !== -1) {
          layerId = _layerId;
        }
      });

      if (layerId === EmptyID) return state;

      return update(state, {
        layerById: {
          [layerId]: {
            objectIds: {
              $apply: (_layerIds: string[]) =>
                without(
                  state.layerById[layerId as string].objectIds,
                  ...deleteObjectIds
                ),
            },
          },
        },
      });
    }
    case MOVE_OBJECTS: {
      const payload = action.payload;
      const layerById = cloneDeep(state.layerById);

      forIn(layerById, function (layer, _layerId) {
        remove(layer.objectIds, (id) => {
          return payload.moveIds.indexOf(id) !== -1;
        });
      });

      // add object above object id
      if (payload.where === "above") {
        forIn(layerById, function (layer, _layerId) {
          const idx = layer.objectIds.indexOf(payload.refId);
          if (idx != -1) {
            layer.objectIds.splice(idx, 0, ...payload.moveIds);
          }
        });
      }

      // add object in layer (at bottom)
      if (payload.where === "layer") {
        layerById[payload.refId].objectIds.splice(
          layerById[payload.refId].objectIds.length,
          0,
          ...payload.moveIds
        );
      }

      return { ...state, layerById };
    }

    case MOVE_LAYERS: {
      const payload = action.payload;
      const layerById = cloneDeep(state.layerById);

      // If layer are moved to "slide" update slideId on each layer
      if (payload.where === "slide") {
        forIn(layerById, function (layer, _layerId) {
          if (payload.moveIds.indexOf(layer.id) !== -1) {
            layer.slideId = payload.refId;
          }
        });
      }

      return { ...state, layerById };
    }

    case OPEN_PROJECT: {
      action.payload.layers.allLayers.map((id: string) => {
        const layer = action.payload.layers.layerById[id];
        layer.definition.values = {
          ...getCommonPropertiesValues(),
          ...layer.definition.values,
        };
        layer.definition.valuesMetadata = {
          ...getCommonPropertiesMetadataValues(),
          ...layer.definition.valuesMetadata,
        };
      });

      return {
        ...action.payload.layers,
      };
    }
    case CREATE_NEW_PROJECT: {
      return getLayersDefault();
    }
    default:
      return state;
  }
}

export function ungroupTransformCalc(gropupId: string, objectIds: string[]) {
  const objectEl = document.getElementsByClassName(
    "object-holder-" + objectIds[0]
  )[0] as HTMLElement;

  console.log("object-holder-" + objectIds[0]);
  console.log(objectEl.style.transform);
  // const newObjectEl = getAbsEl("new-object-el");
  // newObjectEl.style.border = "1px solid green";
  // newObjectEl.style.background = "none";

  // Make sure "d" has the same dimensions as "c"
  const cstyle = getComputedStyle(objectEl);
  const h = parseFloat(cstyle.height);
  const w = parseFloat(cstyle.width);
  // newObjectEl.style.height = `${h}px`;
  // newObjectEl.style.width = `${w}px`;

  // Then, align "d" to "c" using their center points.
  const bbox = objectEl.getBoundingClientRect();
  const cy = bbox.top + bbox.height / 2;
  const cx = bbox.left + bbox.width / 2;
  // newObjectEl.style.top = `${cy - h / 2}px`;
  // newObjectEl.style.left = `${cx - w / 2}px`;

  // And finally, compute the total rotation, strip
  // the translation, and apply that total rotation to "d".
  console.log(objectEl.style.transform);

  const fullMatrix = getFullMatrix(objectEl);
  fullMatrix.e = fullMatrix.f = 0;
  // newObjectEl.style.transform = fullMatrix.toString();

  function getFullMatrix(element: HTMLElement): DOMMatrix {
    if (!element) return new DOMMatrix();
    const css = getComputedStyle(element).transform;
    console.log(css);
    const matrix = new DOMMatrix(css);
    return getFullMatrix(element.offsetParent as HTMLElement).multiply(matrix);
  }
}

// export function getRelativeBoundingBox(el: HTMLDivElement): Rect {
//   const w = parseInt(el?.style?.width);
//   const h = parseInt(el?.style?.height);

//   const x = parseInt(el?.style?.left);
//   const y = parseInt(el?.style?.top);

//   const rXCenter = x + w / 2;
//   const rYCenter = y + h / 2;

//   const boundsEl = document.getElementsByClassName(
//     `object-bounds-${props.object.id}`
//   )[0] as HTMLDivElement;

//   //////////console.log(rect);

//   const fullRotation = initialRotationRef.current + rotation;
//   const H =
//     w * Math.abs(Math.sin(fullRotation)) + h * Math.abs(Math.cos(fullRotation));
//   const W =
//     w * Math.abs(Math.cos(fullRotation)) + h * Math.abs(Math.sin(fullRotation));

//   const X = rXCenter - W / 2;
//   const Y = rYCenter - H / 2;

//   ////////console.log({ X, Y });
//   ////////console.log({ H, W });
//   ////////console.log({ rXCenter, rYCenter });

//   if (boundsEl) {
//     boundsEl.style.position = "absolute";
//     boundsEl.style.top = Y - (H * (initialScaleRef.current - 1)) / 2 + "px";
//     boundsEl.style.left = X - (W * (initialScaleRef.current - 1)) / 2 + "px";
//     boundsEl.style.width = W * initialScaleRef.current + "px"; //rect.width / stageZoom + "px";
//     boundsEl.style.height = H * initialScaleRef.current + "px"; //rect.height / stageZoom + "px";
//   }
// }
