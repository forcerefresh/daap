import gsap from "gsap";
import { flip, IFlipEffect } from "./flip.types";

gsap.registerEffect({
  name: flip,
  effect: function (targets: any, config: IFlipEffect) {
    const main = targets[0] as HTMLElement;
    const cardCont = main.firstChild as HTMLElement;
    const images: HTMLElement[] = [];

    let firstPhoto: HTMLDivElement;
    firstPhoto = document.createElement("div");
    firstPhoto.style.position = "absolute";
    firstPhoto.style.width = "100%";
    firstPhoto.style.height = "100%";
    firstPhoto.style.backfaceVisibility = "hidden";
    // cardCont.prepend(firstPhoto);

    if (cardCont?.hasChildNodes()) {
      let childrens = cardCont.childNodes;

      for (let i = 0; i < childrens.length; i++) {
        images.push(childrens[i] as HTMLElement);
      }
    }

    gsap.set(main, {
      width: config.objectProperties?.width,
      height: config.objectProperties?.height,
      perspective: "600",
    });

    gsap.set(cardCont, {
      transformStyle: "preserve-3d",
      transformOrigin: "center right",
    });

    images.forEach((img, idx) => {
      img.style.backfaceVisibility = "hidden";
      // img.style.display = "none";
      if (idx % 2 !== 0) {
        img.style.transform = "rotateY(180deg)";
      }
    });

    const tl = gsap.timeline();

    tl.to(cardCont, {
      duration: 3,
      rotateY: 180,
      translateX: "-100%",
    });

    return tl;
  },

  defaults: {},
  extendTimeline: true,
});
