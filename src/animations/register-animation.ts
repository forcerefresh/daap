import { registerAnimation } from "webslider-sdk/lib/animations/animations-register";
import { fadeDef, fadeAppDef } from "./fade/fade";
import { fadeRangeDef, fadeRangeAppDef } from "./fade-range/fade-range";
import { slideDef, slideAppDef } from "./slide/slide";
//import { tilesZoomDef, tilesZoomAppDef } from "./tiles-zoom/tiles-zoom";
import {
  fallingLeavesDef,
  fallingLeavesAppDef,
} from "./falling-leaves/falling-leaves";
// import { tilesFadeDef, tilesFadeAppDef } from "./tiles-fade/tiles-fade";
// import { tilesSlideDef, tilesSlideAppDef } from "./tiles-slide/tiles-slide";
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
// import { sliceSlideAppDef, sliceSlideDef } from "./slice-slide/slice-slide";
import { splitAppDef, splitDef } from "./split/split";
import { trianglifyAppDef, trianglifyDef } from "./trianglify/trianglify";
import { zoomAppDef, zoomDef } from "./zoom/zoom";
import { timelinesDef, timelinesAppDef } from "./transform/transform";
import { fadeSlideAppDef, fadeSlideDef } from "./fade-slide/fade-slide";
import { overlapAppDef, overlapDef } from "./overlap/overlap";
import { slideSlideAppDef, slideSlideDef } from "./slide-slide/slide-slide";
import { textAppDef, textDef } from "./text/text";

registerAnimation(fadeAppDef, fadeDef);
registerAnimation(fadeRangeAppDef, fadeRangeDef);
registerAnimation(flipAppDef, flipDef);
registerAnimation(flipSlideAppDef, flipSlideDef);
registerAnimation(parallaxAppDef, parallaxDef);
// registerAnimation(sliceSlideAppDef, sliceSlideDef);
registerAnimation(splitAppDef, splitDef);
//registerAnimation(trianglifyAppDef, trianglifyDef);
registerAnimation(zoomAppDef, zoomDef);
registerAnimation(slideAppDef, slideDef);
//registerAnimation(tilesZoomAppDef, tilesZoomDef);
registerAnimation(fallingLeavesAppDef, fallingLeavesDef);
// registerAnimation(tilesFadeAppDef, tilesFadeDef);
// registerAnimation(tilesSlideAppDef, tilesSlideDef);
registerAnimation(textAppDef, textDef);

registerAnimation(null, execCodePlayerDef);

registerAnimation(kenBurnsAppDef, kenBurnsDef);
registerAnimation(squareMaskAppDef, squareMaskDef);

registerAnimation(typewriterAppDef, typewriterDef);

registerAnimation(timelinesAppDef, timelinesDef);

registerAnimation(fadeSlideAppDef, fadeSlideDef);

registerAnimation(overlapAppDef, overlapDef);

registerAnimation(slideSlideAppDef, slideSlideDef);
