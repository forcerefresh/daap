import gsap from "gsap";
import { format } from "path";
import { flip, IFlipEffect } from "./flip.types";

gsap.registerEffect({
  name: flip,
  effect: function (targets: any, config: IFlipEffect) {
    /////
    const durationPerItem = 2;
    const durationBetweenItems = 3;
    // ///
    const main = targets[0] as HTMLElement;
    const cardCont = main.firstChild as HTMLDivElement;
    const images: HTMLDivElement[] = [];

    /*let firstPhoto: HTMLDivElement;
    firstPhoto = document.createElement("div");
    firstPhoto.style.position = "absolute";
    firstPhoto.style.width = "100%";
    firstPhoto.style.height = "100%";
    firstPhoto.style.backfaceVisibility = "hidden";*/
    // cardCont.prepend(firstPhoto);

    if (cardCont?.hasChildNodes()) {
      let children = cardCont.childNodes;

      for (let i = 0; i < children.length; i++) {
        images.push(children[i] as HTMLDivElement);
      }
    }

    console.log(images);

    const containers = [];
    const emptyDiv = document.createElement("div");
    images.unshift(emptyDiv);
    for (let i = 0; i < images.length - 1; i++) {
      const card = cardCont.cloneNode(false) as HTMLDivElement;
      card.style.position = "absolute";
      card.style.display = "none";
      card.style.transformStyle = "preserve-3d";
      card.style.transformOrigin = "center right";
      containers.push(card);
      main.appendChild(card);
    }

    console.log(containers);

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
    //images.forEach((img, idx) => {
    //img.style.backfaceVisibility = "hidden";
    //img.style.display = "none";
    //img.style.zIndex = 100 - idx + "";
    //});

    const tl = gsap.timeline();

    //images[0].style.display = "block";
    //images[1].style.display = "block";
    //images[1].style.transform = "rotateY(180deg)";

    tl.to(
      containers[0],
      {
        duration: 0,
        display: "block",
        rotateY: -90,
        translateX: "-50%",
      },
      0
    );

    tl.to(
      containers[0],
      {
        duration: durationPerItem / 2,
        display: "block",
        rotateY: -180,
        translateX: "-100%",
        ease: config.ease,
      },
      0
    );

    // 4 slike imam 3 rotacije
    let currentPosition = 0;
    //durationPerItem / 2 + durationBetweenItems;

    console.log(currentPosition);

    for (let i = 0; i < containers.length; i++) {
      console.log(currentPosition);
      // turn on card
      tl.to(
        containers[i],
        {
          duration: 0,
          display: "block",
        },
        currentPosition
      );

      // effect
      tl.to(
        containers[i],
        {
          duration: durationPerItem,
          rotateY: -180,
          translateX: "-100%",
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
        currentPosition + durationPerItem + durationBetweenItems
      );

      currentPosition += durationPerItem + durationBetweenItems;
    }

    return tl;
  },

  defaults: {},
  extendTimeline: true,
});
