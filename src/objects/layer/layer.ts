import { UpdateObjectSizeFuncPropsType } from "webslider-sdk/lib/objects/objects-register";
import {
  getLayerElementById,
  getLayerWrapperElementById,
} from "../../animations/animation-utils";

export async function layerSizeUpdate(
  props: UpdateObjectSizeFuncPropsType
): Promise<void> {
  const { id, calculatedObjectSize, className, skipSizeUpdate } = props;

  // const layerId = getLayerElementById(id)
  const layerWrapper = getLayerWrapperElementById(id);
  // const els = document.getElementsByClassName(className);
  // const div = els[0] as HTMLDivElement;
  // const parent = div.parentNode! as HTMLDivElement;
  // parent.style.width = calculatedObjectSize.width;
  // parent.style.height = calculatedObjectSize.height;
  // parent.style.left = calculatedObjectSize.left;
  // parent.style.top = calculatedObjectSize.top;

  // div.style.width = calculatedObjectSize.width;
  // div.style.height = calculatedObjectSize.height;

  if (!skipSizeUpdate) {
    layerWrapper.style.width = calculatedObjectSize.width;
    layerWrapper.style.height = calculatedObjectSize.height;
  }

  layerWrapper.style.left = calculatedObjectSize.left;
  layerWrapper.style.top = calculatedObjectSize.top;
}
