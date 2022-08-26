import { Player } from "./player/player/Player";
import "./objects/register-object";
import "./effects/register-animation";
require("./effects/effects");
require("./objects/exec-code-effect");

(window as any).WebSliderPlayer = Player;
