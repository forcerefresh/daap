import gsap from "gsap";
import { RGBColor } from "react-color";
import { cube, ICubeEffect } from "./cube.types";

const areaW = 1000;
const areaH = 500;
const ratio = areaH / areaW;
const moveP = ratio * areaH;
const moveP2 = (areaW - areaH) / 2;

//console.log(areaH / 2);
//console.log(moveP);
//console.log(moveP2);

function createCube(target: HTMLDivElement) {
  target.innerHTML += `
    <div class="container">
      <div class="cube">
          <div class="face front"></div>
          <div class="face right"></div>
          <div class="face back"></div>
          <div class="face left"></div>
          <div class="face front"></div>
          <div class="face bottom"></div>
      </div>
    </div>
  `;
}

gsap.registerEffect({
  name: cube,
  effect: function (targets: any, config: ICubeEffect) {
    const slideTransitionHolder = document.getElementsByClassName(
      "slideTransitionHolder"
    )[0];

    let target: HTMLDivElement;
    if (!slideTransitionHolder) {
      target = document.createElement("div");
      target.style.position = "absolute";
      target.style.width = `${areaW}px`;
      target.style.height = `${areaH}px`;
      target.className = "slideTransitionHolder";
      target.style.zIndex = "100";

      document.getElementsByClassName("slidesHolder")[0].append(target);

      addCSS(target, config);
      createCube(target);
    } else {
      target = slideTransitionHolder as HTMLDivElement;
    }

    if (
      (config?.nextSlideEl?.getElementsByClassName("object-content")[0] as any)
        ?.style?.display
    ) {
      (
        config?.nextSlideEl?.getElementsByClassName("object-content")[0] as any
      ).style.display = "none";
    }

    if (
      (config?.prevSlideEl?.getElementsByClassName("object-content")[0] as any)
        ?.style?.display
    ) {
      (
        config?.prevSlideEl?.getElementsByClassName("object-content")[0] as any
      ).style.display = "none";
    }

    let rots = [
      { ry: 0, rx: 0, image: "/images/1.jpg", slide: config.prevSlideEl }, // 1
      { ry: 90, rx: 0, image: "/images/2.jpg" }, // 2
      { ry: 180, rx: 0, image: "/images/3.jpg" }, // 3
      { ry: 270, rx: 0, image: "/images/4.jpg" }, // 4
      { ry: 0, rx: 90, image: "/images/2.jpg" }, // 5
      { ry: 0, rx: -90, image: "/images/4.jpg", slide: config.nextSlideEl }, // 6
    ];

    gsap.set(".face", {
      // apply transform rotations to each face of the cube
      rotateY: (i) => rots[i].ry,
      rotateX: (i) => rots[i].rx,
      transformOrigin: `50% 50% -${moveP2}px`,
      z: moveP2,
      backgroundSize: "100% 100%",
      backgroundImage: (i) =>
        !rots[i].image ? "url(" + rots[i].image + ")" : "",
    });

    const cube = target.getElementsByClassName("cube")[0];

    const tl = gsap.timeline({
      paused: true,
    });
    //tl.to(cube, { rotateX: 0, rotateY: -90, duration: 1 });
    //tl.to(cube, { rotateX: 0, rotateY: -180, duration: 1 });
    //tl.to(cube, { rotateX: 0, rotateY: -270, duration: 1 });
    //tl.to(cube, { rotateX: -90, rotateY: -360, duration: 1 });
    //tl.to(cube, { rotateX: 90, rotateY: -360, duration: 1 });
    tl.to(".container", { scale: 0.5, duration: 1 });
    //tl.to(cube, { scaleX: 0.6, scaleY: 0.6, scaleZ: 0.6, duration: 1 }); // short rotation back to 1
    tl.to(cube, { rotateX: 90, rotateY: 0, duration: 1 }); // short rotation back to 1
    tl.to(".container", { scale: 0.75, duration: 1 });
    //tl.to(cube, { rotateX: 90, rotateY: 90, duration: 1 }); // short rotation back to 1
    //tl.to(cube, { rotateX: 180, rotateY: 180, duration: 1 }); // short rotation back to 1
    //tl.to(cube, { rotateX: 0, rotateY: 360, duration: 1 }); // short rotation back to 1
    //tl.to(cube, { rotateX: 45, rotateY: 0, duration: 1 }); // short rotation back to 1
    //tl.to(cube, { rotateX: 90, rotateY: 0, duration: 1 }); // short rotation back to 1

    tl.play();

    let started = false;

    tl.eventCallback("onComplete", () => {
      if (started) {
        //console.log("onComplete SLIDE TRANSITION");

        if (config?.prevSlideEl) {
          (
            document.getElementsByClassName("slidesHolder")[0] as HTMLDivElement
          ).appendChild(config?.prevSlideEl);
        }

        (
          document.getElementsByClassName("slidesHolder")[0] as HTMLDivElement
        ).appendChild(config?.nextSlideEl!);

        if (config.prevSlideEl) config.prevSlideEl.style.display = "none";

        started = false;

        const slideTransitionHolder2 = document.getElementsByClassName(
          "slideTransitionHolder"
        )[0];
        slideTransitionHolder2?.parentNode?.removeChild(slideTransitionHolder2);

        //console.log("ATTACH 23");
      }
    });

    tl.eventCallback("onUpdate", () => {
      if (!started) {
        //console.log("onUpdate SLIDE TRANSITION");

        const cube = target.getElementsByClassName("cube")[0];
        gsap.set(cube, {
          rotateY: 0,
          rotateX: 0,
        });

        // NOTE: reattach slide
        if (config?.prevSlideEl) {
          (
            target.getElementsByClassName("front")[0] as HTMLDivElement
          ).appendChild(config?.prevSlideEl);
        }
        (
          target.getElementsByClassName("bottom")[0] as HTMLDivElement
        ).appendChild(config?.nextSlideEl!);

        config!.nextSlideEl!.style.display = "block";

        started = true;
      }
    });

    return tl;
  },
  defaults: {},
  extendTimeline: true,
});

function colorToString(color: RGBColor) {
  const { r, g, b, a } = color;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function addCSS(target: HTMLDivElement, config: ICubeEffect) {
  const bgColor = colorToString(config.cubeBackgroundColor);
  const edgeColor = colorToString(config.cubeEdgeColor);

  target.innerHTML = `
    <style>
      .container {
        width: ${areaH}px;
        height: ${areaH}px;
        perspective: 1000px; /* psst...something fun happens when this is a really small number */

        position:absolute;
        opacity: 1;
        left: 25%;
        transform: scale(0.75);
        top: 0px;
      }
      .face {
        background: ${bgColor};
        border: 1px solid ${edgeColor};
      }
      .cube, .face {
        position: absolute;
        height: 100%;
        width: 100%;
        transform-style: preserve-3d;
        background-size: 100% 100%;
      }
      .front {
        left: -${moveP2}px;
        width: ${areaW}px;
        height: ${areaH}px;
      }
      .back {
        left: -${moveP2}px;
        width: ${areaW}px;
        height: ${areaH}px;
      }
      .left {
        left: -${moveP2}px;
      
      }
      .right {
        left: ${moveP2}px;
      
      }
      .bottom{
        left: -${moveP2}px;
        width:${areaW}px;
        height: ${areaH}px;
      }
    </style>
 `;
}
