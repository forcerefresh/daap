import { ISettings } from "../store/reducers/settings";
import { ISlide } from "../store/reducers/slides";

export function getRealSlideDuration(slide: ISlide, settings: ISettings) {
  return slide.duration.inheritFrom === "inherit"
    ? settings.slideDuration
    : slide.duration.customValue;
}

export function getRealSlideDurationVisual(slide: ISlide, settings: ISettings) {
  const dur = getRealSlideDuration(slide, settings);
  return (dur / 1000).toString() + " sec";
}
