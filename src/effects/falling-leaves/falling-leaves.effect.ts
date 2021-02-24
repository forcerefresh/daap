import gsap from "gsap";
import { fallingLeaves, IFallingLeaves } from "./falling-leaves.types";

gsap.registerEffect({
  name: fallingLeaves,
  effect: function (targets: any, config: IFallingLeaves) {
    gsap.set(targets[0], { perspective: 600 });
    //targets[0].style.overflow = "hidden";

    targets[0].style.border = "1px solid red";

    var total = 30;
    var container = document.getElementById("container");
    var w = 300;
    var h = 200;

    const url = "/images/leaf.png";

    const size = { w: 35, h: 35 };

    const rootTimeline = gsap.timeline({});

    for (let i = 0; i < total; i++) {
      var Div = document.createElement("div");
      Div.style.position = "absolute";
      Div.innerHTML = `<img src="${url}" width="${size.w}" height="${size.h}" />`;

      gsap.set(Div, {
        attr: { class: "dot" },
        x: R(0, w),
        y: R(-200, -150),
        z: R(-200, 200),
      });
      targets[0].appendChild(Div);
      rootTimeline.add(animm(Div), 0);
    }

    const tweenns = [];
    function animm(elm: Element) {
      const tl = gsap.timeline();

      const tween = gsap.to(elm, {
        duration: R(6, 15),
        y: h + 100,
        ease: "none",
        repeat: -1,
      });

      tween.startTime(16);
      tl.smoothChildTiming = true;
      tl.add(tween, 0);
      tl.startTime(4);
      /* tl.add(
        gsap.to(elm, R(4, 8), {
          x: "+=100",
          rotationZ: R(0, 180),
          repeat: -1,
          yoyo: true,
          ease: "Sine.easeInOut",
        })
      );
      tl.add(
        gsap.to(elm, R(2, 8), {
          rotationX: R(0, 360),
          rotationY: R(0, 360),
          repeat: -1,
          yoyo: true,
          ease: "Sine.easeInOut",
          delay: -5,
        })
      );*/
      return tl;
    }
    //rootTimeline.startTime(15);
    return rootTimeline;
  },
  defaults: {},
  extendTimeline: true,
});

function createLeaf(size: { w: number; h: number }, url: string): Element {
  const leaf = document.createElement("div");
  leaf.style.position = "absolute";
  leaf.innerHTML = `<img src="${url}" width="${size.w}" height="${size.h}" />`;
  const w = 1500;

  gsap.set(leaf, {
    attr: { class: "dot" },
    x: R(0, w),
    y: R(-0, -10),
    z: R(-200, 200),
  });
  return leaf;
  /*
  container.appendChild(Div);



  let html = "";
  html = `<div style="transform:translate3d(${R(0, 600)}px, ${R(
    -200,
    -150
  )}px, ${R(-200, 200)}px);">
					<img src="${url}" width="${size.w}" height="${size.h}"/>
					</div>`;

  holder.innerHTML = html;
  return holder.firstElementChild as Element;*/
}

function R(min: number, max: number) {
  return min + Math.random() * (max - min);
}
