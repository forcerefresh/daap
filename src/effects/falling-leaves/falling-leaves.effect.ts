import gsap from "gsap";
import { fallingLeaves, IFallingLeaves } from "./falling-leaves.types";

gsap.registerEffect({
  name: fallingLeaves,
  effect: function (targets: any, config: IFallingLeaves) {
    gsap.set(targets[0], { perspective: 600, display: "none" });
    targets[0].style.overflow = "hidden";

    // required in order to cleanup  when restart
    gsap.killTweensOf(targets[0].children);

    var total = config.number;
    var w = config.objectProperties?.width!;
    var h = config.objectProperties?.height!;

    targets[0].innerHTML = "";
    for (let i = 0; i < total; i++) {
      var leafEl = document.createElement("div");
      leafEl.style.position = "absolute";
      leafEl.innerHTML = `<img src="${config.image.url}" width="${config.width}" height="${config.height}" />`;

      gsap.set(leafEl, {
        //attr: { class: "dot" },
        x: rangeRandom(-50, w - 100),
        y: rangeRandom(-150, -100),
        z: rangeRandom(-200, 200),
      });

      targets[0].appendChild(leafEl);

      leafEffect(leafEl, w, h);
    }

    // return ROOT timeline
    const rootTimeline = gsap.timeline({
      onComplete: () => {
        console.log("onComplete");
      },
      onStart: () => {
        console.log("onStart");
      },
      onInterrupt: () => {
        console.log("onSTart");
      },
    });
    rootTimeline.to(targets[0], { display: "block", duration: 0.0000001 });
    rootTimeline.to(targets[0], {
      duration: config.duration! - 0.0000002,
    });
    rootTimeline.to(targets[0], { display: "none", duration: 0.0000001 });

    return rootTimeline;
  },
  defaults: {},
  extendTimeline: true,
});

function rangeRandom(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function leafEffect(elm: Element, w: number, h: number) {
  const tl = gsap.timeline();

  gsap.to(elm, {
    duration: rangeRandom(6, 15),
    y: h + 100,
    ease: "none",
    repeat: -1,
    delay: -15,
    onStart: () => {
      console.log("start");
    },
    onComplete: () => {
      console.log("complete");
    },
  });

  gsap.to(elm, {
    duration: rangeRandom(4, 8),
    x: "+=100",
    rotationZ: rangeRandom(0, 180),
    repeat: -1,
    yoyo: true,
    ease: "Sine.easeInOut",
  });

  gsap.to(elm, {
    duration: rangeRandom(2, 8),
    rotationX: rangeRandom(0, 360),
    rotationY: rangeRandom(0, 360),
    repeat: -1,
    yoyo: true,
    ease: "Sine.easeInOut",
    delay: -5,
  });

  return tl;
}
