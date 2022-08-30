import cubeDef from "./cube/cube.animation";
import fadeDef from "./fade/fade.animation";
import fallingLeavesDef from "./falling-leaves/falling-leaves.animation";
import slideDef from "./slide/slide.animation";
import tilesZoomDef from "./tiles-zoom/tiles-zoom.animations";

const animations: any[] = [];

export function registerAnimation(animation: any) {
  animations.push(animation);
}

export function getAnimationDefinition(effectId: string): any {
  return animations.find((item) => item.effectId === effectId);
}

registerAnimation({ ...fadeDef });
registerAnimation({ ...slideDef });
registerAnimation({ ...tilesZoomDef });
registerAnimation({ ...fallingLeavesDef });
registerAnimation({ ...cubeDef });
