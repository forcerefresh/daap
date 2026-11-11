import { UpdateObjectSizeFuncPropsType } from "webslider-sdk/lib/objects/objects-register";
import {
  addCommonStyleToObjectElementContent,
  addTransformStyleToObjectElementContent,
  getLayerElementById,
  getLayerWrapperElementById,
} from "../../utils/animation-utils";

export async function layerSizeUpdate(
  props: UpdateObjectSizeFuncPropsType
): Promise<void> {
  const {
    id,
    calculatedObjectSize,
    skipSizeUpdate,
    deviceType,
  } = props;
  const { commonStyleDefinition } = props as any;

  const layerWrapper = getLayerWrapperElementById(id);
  const layer = getLayerElementById(id);

  if (!skipSizeUpdate) {
    layerWrapper.style.width = calculatedObjectSize.width;
    layerWrapper.style.height = calculatedObjectSize.height;
    layer.style.width = calculatedObjectSize.width;
    layer.style.height = calculatedObjectSize.height;
  }

  layerWrapper.style.left = calculatedObjectSize.left;
  layerWrapper.style.top = calculatedObjectSize.top;

  addCommonStyleToObjectElementContent(
    layer,
    commonStyleDefinition,
    deviceType
  );

  addTransformStyleToObjectElementContent(
    layer,
    commonStyleDefinition,
    deviceType
  );
}
