import gsap from "gsap";
import { MultiImageValues } from "../../objects/multiple-images/multiple-images";
import { IObject, ITransition } from "webslider-sdk2/lib/objects/i-object";
import { FADE_ANIMATION } from "../fade/fade.types";
import { IFlipAnimation } from "./flip.types";

export function getFlipAnimationDuration(object: IObject, config: ITransition) {
  const effValues = config?.animation?.values as IFlipAnimation;

  const rotationTime = effValues.rotationTime;
  const pauseTime = effValues.pauseTime;
  const images = object.definition.values as MultiImageValues;
  const cards = images.images.length;
  return cards * (rotationTime + pauseTime) - rotationTime / 2;
}

gsap.registerEffect({
  name: FADE_ANIMATION,
  effect: function (targets: any, config: IFlipAnimation) {
    const main = targets[0] as HTMLElement;
    const cardCont = main.firstChild as HTMLDivElement;
    const images: HTMLDivElement[] = [];
    const rotationTime = config.rotationTime / 1000;
    const pauseTime = config.pauseTime / 1000;

    if (cardCont?.hasChildNodes()) {
      let children = cardCont.childNodes;

      for (let i = 0; i < children.length; i++) {
        images.push(children[i] as HTMLDivElement);
      }
    }

    const containers = [];
    const emptyDiv = document.createElement("div");
    images.unshift(emptyDiv);
    for (let i = 0; i < images.length - 1; i++) {
      const card = cardCont.cloneNode(false) as HTMLDivElement;
      card.style.position = "absolute";
      card.style.display = "none";
      card.style.transformStyle = "preserve-3d";
      card.style.transformOrigin = `center ${
        config.spinDirection === "cc" ? "right" : "left"
      }`;
      containers.push(card);
      main.appendChild(card);
    }

    gsap.set(main, {
      perspective: "600px",
    });

    containers.forEach((card, idx) => {
      const front = images[idx].cloneNode(true) as HTMLDivElement;
      const back = images[idx + 1].cloneNode(true) as HTMLDivElement;
      back.style.transform = "rotateY(180deg)";
      card.appendChild(front);
      card.appendChild(back);
    });

    cardCont.style.display = "none";
    const tl = gsap.timeline();
    tl.to(
      containers[0],
      {
        duration: 0,
        display: "block",
        rotateY: config.spinDirection === "cc" ? -90 : 90,
        translateX: `${config.spinDirection === "cc" ? "-" : ""}50%`,
      },
      0
    );

    tl.to(
      containers[0],
      {
        duration: rotationTime / 4,
        display: "block",
        rotateY: config.spinDirection === "cc" ? -180 : 180,
        translateX: `${config.spinDirection === "cc" ? "-" : ""}100%`,
        ease: config.ease,
      },
      0
    );

    let currentPosition = 0;

    for (let i = 0; i < containers.length; i++) {
      // turn on card
      tl.to(
        containers[i],
        {
          duration: 0,
          display: "block",
        },
        currentPosition
      );

      // flip animation
      tl.to(
        containers[i],
        {
          duration: rotationTime,
          rotateY: config.spinDirection === "cc" ? -180 : 180,
          translateX: `${config.spinDirection === "cc" ? "-" : ""}100%`,
          ease: config.ease,
        },
        currentPosition
      );

      // turn off card
      tl.to(
        containers[i],
        {
          duration: 0,
          display: "none",
        },
        currentPosition + pauseTime + rotationTime
      );

      currentPosition += pauseTime + rotationTime;
    }

    return tl;
  },

  defaults: {},
  extendTimeline: true,
});
