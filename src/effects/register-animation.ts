import { registerEffect } from "../webslider-sdk/src/effects/effects-register";
import { fadeDef, fadeAppDef } from "./fade/fade";
import { slideDef, slideAppDef } from "./slide/slide";
import { tilesZoomDef, tilesZoomAppDef } from "./tiles-zoom/tiles-zoom";
import {
  fallingLeavesDef,
  fallingLeavesAppDef,
} from "./falling-leaves/falling-leaves";
import { tilesFadeDef, tilesFadeAppDef } from "./tiles-fade/tiles-fade";
import { tilesSlideDef, tilesSlideAppDef } from "./tiles-slide/tiles-slide";
import {
  execCodeAppDef,
  execCodePlayerDef,
} from "../objects/exec-code-animation";

import { kenBurnsDef, kenBurnsAppDef } from "./ken-burns/ken-burns";
import { squareMaskAppDef, squareMaskDef } from "./square-mask/square-mask";
import { typewriterAppDef, typewriterDef } from "./typewriter/typewriter";
import { flipAppDef, flipDef } from "./flip/flip";
import { flipSlideAppDef, flipSlideDef } from "./flip-slide/flip-slide";
import { parallaxAppDef, parallaxDef } from "./parallax/parallax";
import { sliceSlideAppDef, sliceSlideDef } from "./slice-slide/slice-slide";
import { splitAppDef, splitDef } from "./split/split";
import { trianglifyAppDef, trianglifyDef } from "./trianglify/trianglify";
import { zoomAppDef, zoomDef } from "./zoom/zoom";
import { timelinesDef, timelinesAppDef } from "./transform/transform";
import { fadeSlideAppDef, fadeSlideDef } from "./fade-slide/fade-slide";
import { overlapAppDef, overlapDef } from "./overlap/overlap";
import { slideSlideAppDef, slideSlideDef } from "./slide-slide/slide-slide";

registerEffect(fadeAppDef, fadeDef);
registerEffect(flipAppDef, flipDef);
registerEffect(flipSlideAppDef, flipSlideDef);
registerEffect(parallaxAppDef, parallaxDef);
registerEffect(sliceSlideAppDef, sliceSlideDef);
registerEffect(splitAppDef, splitDef);
registerEffect(trianglifyAppDef, trianglifyDef);
registerEffect(zoomAppDef, zoomDef);
registerEffect(slideAppDef, slideDef);
registerEffect(tilesZoomAppDef, tilesZoomDef);
registerEffect(fallingLeavesAppDef, fallingLeavesDef);
registerEffect(tilesFadeAppDef, tilesFadeDef);
registerEffect(tilesSlideAppDef, tilesSlideDef);

registerEffect(null, execCodePlayerDef);

registerEffect(kenBurnsAppDef, kenBurnsDef);
registerEffect(squareMaskAppDef, squareMaskDef);

registerEffect(typewriterAppDef, typewriterDef);

registerEffect(timelinesAppDef, timelinesDef);

registerEffect(fadeSlideAppDef, fadeSlideDef);

registerEffect(overlapAppDef, overlapDef);

registerEffect(slideSlideAppDef, slideSlideDef);
