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

registerEffect(fadeAppDef, fadeDef);
registerEffect(slideAppDef, slideDef);
registerEffect(tilesZoomAppDef, tilesZoomDef);
registerEffect(fallingLeavesAppDef, fallingLeavesDef);
registerEffect(tilesFadeAppDef, tilesFadeDef);
registerEffect(tilesSlideAppDef, tilesSlideDef);

registerEffect(null, execCodePlayerDef);
