import { Player } from "./player/player/Player";
import "./objects/register-object";
require("./effects/effects");
require("./objects/exec-code-effect");

(window as any).WebSliderPlayer = Player;

console.log(Player);
