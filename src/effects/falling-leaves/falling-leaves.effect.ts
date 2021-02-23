import gsap from "gsap";
import { fallingLeaves, IFallingLeaves } from "./falling-leaves.types";

gsap.registerEffect({
  name: fallingLeaves,
  effect: function (targets: any, config: IFallingLeaves) {
    gsap.set(targets[0], {
      perspective: 600,
    });
    const url = "/images/leaf.png";

    const size = { w: 50, h: 50 };
    const amount = 30;
    const h = 900;

    const rootTimeline = gsap.timeline();
    function animate(elm: Element) {
      let tl = gsap.timeline();

      tl.to(
        elm,
        {
          duration: R(6, 15),
          y: h + 100,
          //ease: Linear.easeNone,
          repeat: -1,
          delay: -15,
        },
        0
      );
      tl.to(
        elm,
        {
          duration: R(4, 8),
          x: "+=100",
          rotationZ: R(0, 180),
          repeat: -1,
          yoyo: true,
          //ease: Sine.easeInOut,
        },
        0
      );
      tl.to(
        elm,
        {
          duration: R(2, 8),
          rotationX: R(0, 360),
          rotationY: R(0, 360),
          repeat: -1,
          yoyo: true,
          //ease: Sine.easeInOut,
          delay: -5,
        },
        0
      );

      /*
      tl.to(
        element,
        {
          duration: R(config.duration! + 4, config.duration! + 11),
          y: h + 100,
          //ease: "easeNone",
        },
        0
      );
      tl.to(
        element,
        {
          duration: R(config.duration! + 2, config.duration! + 4),
          x: "+=200",
          rotationZ: R(0, 180),
          //ease: "easeInOut",
        },
        0
      );
      tl.to(
        element,
        {
          duration: R(config.duration!, config.duration! + 6),
          rotationX: R(0, 360),
          rotationY: R(0, 360),
          //ease: "easeInOut",
        },
        0
      );*/
      return tl;
    }

    for (let i = 0; i < amount; i++) {
      let leaf = createLeaf(size, url);
      targets[0].appendChild(leaf);
      rootTimeline.add(animate(leaf), 0);
    }
    return rootTimeline;
  },
  defaults: {},
  extendTimeline: true,
});

function R(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createLeaf(size: { w: number; h: number }, url: string): Element {
  const holder = document.createElement("div");

  let html = "";
  html = `<div style="transform:translate3d(${R(0, 600)}px, ${R(
    -200,
    -150
  )}px, ${R(-200, 200)}px);">
					<img src="${url}" width="${size.w}" height="${size.h}"/>
					</div>`;

  holder.innerHTML = html;
  return holder.firstElementChild as Element;
}
