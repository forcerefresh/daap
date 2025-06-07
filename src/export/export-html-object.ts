import { forOwn, mapValues, pick } from "lodash-es";
import { ILayerValues, IObject } from "webslider-sdk/lib/objects/i-object";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";
import {
  calculateObjectSize,
  calculateObjectSizePerDevice,
} from "../panels/stage-panel/StagePanelUtils";
import { ILayer } from "../store/reducers/i-layers";
import {
  BreakpointConfiguration,
  Breakpoints,
} from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { getObjectTransform } from "../panels/stage-panel-new/stage-panel-utils";
import { getCustomIdClass, getObjectArr, getObjectHtml } from "./export-html";
import { IItemsData } from "./i-export-html";
import { IObjects } from "../store/reducers/i-objects";

export function generateObjectData(
  objects: IObjects,
  object: IObject<{}>,
  itemsData: IItemsData[],
  extensionTypes: string[],
  layer: ILayer,
  breakpointConfig: BreakpointConfiguration,
  breakpoints: Breakpoints,
  layerValues: ILayerValues,
  layerTransformValues: Record<string, any> | undefined,
  options: { isSave: boolean; isForThumbnail?: boolean }
) {
  let html = "";

  // if (!visibleForAllDevices) {
  //   itemsVisibility.push({
  //     itemType: "object",
  //     id: object.id,
  //     displayOn: layer.responsiveVisibility.displayOn,
  //   });
  // }

  //part for externals
  const objDeff = getAppObjectDefinition(object.type);
  if (objDeff?.external) {
    extensionTypes.push(object.type);
  }

  // TODO; we have similar code for layer
  const effectWrappers: string[] = [];
  // const ot = object.transitions;
  // [ot.animation, ot.in, ot.out, ot.event].forEach((tArr) => {
  //   //forOwn(object.transitions, (tArr: ITransition[] | any) => {
  //   tArr?.forEach((t: ITransition) => {
  //     const def = getAppAnimationDefinition(t?.animation?.id);
  //     if (def) {
  //       const requireWrapperElement = (def.formDefaults as IAnimationBase)
  //         .requireWrapperElement;
  //       if (requireWrapperElement) {
  //         const animationWrapperClassName = `animation-wrapper-${t.uid}`;
  //         effectWrappers.push(animationWrapperClassName);
  //       }
  //       if (def?.external) {
  //         extensionTypes.push(t.animation.id);
  //       }
  //     }
  //   });
  // });

  // << part for externlas
  // const objectValues = object.properties;

  const objectClass = "object-" + object.id;

  // >> "left", "top", "width", "height"
  const sizeObj = pick(object, "left", "top", "width", "height");
  const objectStyle = mapValues(sizeObj, (size) => `${size}px`);

  // TODO: IMPORTANT (size issue)
  const calculatedObjectSize = calculateObjectSize(
    object,
    layer,
    breakpointConfig,
    { resetPosition: false },
    undefined,
    { skipHeight: !!object.properties?.autoHeight }
  );

  const calculatedObjectSizePerDevice = calculateObjectSizePerDevice(
    object,
    layer,
    breakpoints,
    { skipHeight: !!object.properties?.autoHeight }
  );

  let style = "";
  forOwn(calculatedObjectSize, function (value, key) {
    style += key + ":" + value + ";";
  });

  style += layerValues.hasLayoutChildren
    ? "position: static;"
    : "position: absolute;";
  // : object.layout === "absolute"
  // ? "position: absolute;"
  // : "position: absolute;"; //"position: relative;";

  // const cd = object.commonStyleDefinition;
  // const overflow = cd?.valuesMetadata?.commonOverflow
  //   ? cd.values?.commonOverflow
  //   : "visible";
  const overflowValue = object.style?.overflow ?? "visible";
  style += `overflow: ${overflowValue};`;
  // << "left", "top", "width", "height"

  let wrapperStyle = style;
  wrapperStyle += "pointer-events: none;";

  style +=
    "position: relative; left:initial; top: initial; overflow: visible; pointer-events:all;";

  style += "transform :" + getObjectTransform(object) + ";";

  let objectAnimWrapperStyle = "";
  // NOTE exception for perspective >>>
  if (
    object.transform?.perspective &&
    object.transform?.perspective !== "0px"
  ) {
    style += `perspective: ${object.transform?.perspective};`;
    wrapperStyle += `perspective: ${object.transform?.perspective};`;
    objectAnimWrapperStyle += `perspective: ${layerTransformValues?.perspective};`;
  }

  // if (object.transformDefinition?.values?.transformOriginX) {
  const trOrigin = `transform-origin: ${
    object.transform?.transformOriginX ?? "left"
  }  ${object.transform?.transformOriginY ?? "top"};`;

  style += trOrigin;
  wrapperStyle += trOrigin;
  objectAnimWrapperStyle += trOrigin;
  // }

  // style+=
  // wrapperStyle
  // TODO: check this
  //wrapperStyle += `overflow: hidden;`;

  html += `      <div class="object-wrapper object-wrapper-${object.id}" style='${wrapperStyle}'>`; // open object wrapper
  html += effectWrappers
    .map(
      (cn) =>
        `<div class="animation-wrapper ${cn}" style='${objectAnimWrapperStyle}position:absolute;width:100%;height:100%;'>`
    )
    .join("");
  html += `      <div class="object ${objectClass} ${getCustomIdClass(
    object
  )}" style='${style}'>`; // open object

  let objectHtml = "";
  if (object.type === "group") {
    const innerObjectArr = getObjectArr(objects, object.objectIds ?? []);

    innerObjectArr.forEach((innerObject) => {
      const objectData = generateObjectData(
        objects,
        innerObject,
        itemsData,
        extensionTypes,
        layer,
        breakpointConfig,
        breakpoints,
        layerValues,
        layerTransformValues,
        options
      );

      objectHtml += objectData.html;
    });
  } else {
    objectHtml = getObjectHtml(
      object,
      calculatedObjectSize,
      true,
      options.isSave,
      breakpointConfig.type,
      options.isForThumbnail
    );
  }

  itemsData.push({
    itemId: object.id,
    parentItemId: layer.id,
    // customId: object.customId,
    itemType: object.type,
    properties: object.properties,
    // itemValuesMetadata: object.definition.valuesMetadata,
    style: object.style ?? {},
    transform: object.transform ?? {},
    itemSystemType: getAppObjectDefinition(object.type)?.meta?.coreType,
    calculatedObjectSize,
    calculatedObjectSizePerDevice,
    objectClass: objectClass,
    // transitions: object.transitions,
    // events: getObjectEvents(object),
    data: {
      // slideDuration: slide.duration,
      // exitSlideDuration: slide.exitDuration,
      // TODO: IMPORTANT (size issue)
      objectWidth: parseInt(calculatedObjectSize!.width + "", 10),
      objectHeight: parseInt(calculatedObjectSize!.height + "", 10),
      objectLeft: parseInt(calculatedObjectSize!.left + "", 10),
      objectTop: parseInt(calculatedObjectSize!.top + "", 10),
      overflow: overflowValue,
      objectHtml,
    },
    layout: {
      //layout: object.layout,
      //layoutAdvance: object.layoutAdvance?.values,
      selfSize: object.selfSize,
      //...pickLayoutFromLayouts(object.layout, object),
    },
  });
  html += objectHtml;

  html += "      </div>"; // object close
  html += effectWrappers.map((cn) => `</div>`).join(""); // object-effect close
  html += "      </div>"; // object close wrapper

  return {
    html,
  };
}
