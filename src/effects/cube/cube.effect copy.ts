import gsap from "gsap";
import { forEach } from "lodash";
import { getMethodByType, getObjectContentElementAndHtml } from "../common";
import { cube, ICubeEffect } from "./cube.types";

function setCss(el: HTMLDivElement, className: string, styleObj: any) {
  const target = el.getElementsByClassName(className)?.[0] as HTMLDivElement;
  if (target) {
    target.style.width = styleObj.width + "px";
    target.style.height = styleObj.height + "px";
    /*
    for (const [key, value] of Object.entries(styleObj)) {
      target.style[`${key}`] = value;
      console.log(`${key}: ${value}`);
    }*/
  }
}
function createCube(target: HTMLDivElement) {
  target.innerHTML += `
  
    <div class="container container1" style="left:0px; top:0px;">
      <div class="cuboid">
         <div class="tile right" style="transform-origin: 50% 50% -100px;">right</div>
         <div class="tile left" style="transform-origin: 50% 50% -100px;">left</div>
         <div class="tile bottom" style="transform-origin: 50% 50% -100px;">bottom</div>
         <div class="tile top" style="transform-origin: 50% 50% -100px;">top</div>
         <div class="tile front" style="transform-origin: 50% 50% -100px;">front</div>
         <div class="tile back" style="transform-origin: 50% 50% -100px;">back</div>
      </div>
    
  </div>
  `;

  setCss(target, "container", {
    width: w,
    height: h,
  });

  setCss(target, "right", {
    width: d,
    height: h,
  });

  setCss(target, "left", {
    width: d,
    height: h,
  });

  setCss(target, "bottom", {
    width: w,
    height: d,
  });

  setCss(target, "top", {
    width: w,
    height: d,
  });

  setCss(target, "front", {
    width: w,
    height: h,
  });

  setCss(target, "back", {
    width: w,
    height: h,
  });

  gsap.set(".tile", {
    // apply transform rotations to each face of the cube

    transformOrigin: "50% 50% 0px",
    //z: 150,
  });
}

gsap.registerEffect({
  name: cube,
  effect: function (targets: any, config: ICubeEffect) {
    const target = targets[0];
    addCSS(target);
    createCube(target);
    (target.getElementsByClassName("object-content")[0] as any).style.display =
      "none";

    //  target.style.display = "none";
    //targets[1]
    //target.style.opacity = 0.5;

    /* target.getElementsByClassName("bottom")[0].innerHTML = target.innerHTML;
    ((target.getElementsByClassName("bottom")[0] as HTMLElement)
      .firstElementChild as HTMLElement).style.width = "100%";
    ((target.getElementsByClassName("bottom")[0] as HTMLElement)
      .firstElementChild as HTMLElement).style.height = "100%";*/

    target.getElementsByClassName(
      "bottom"
    )[0].innerHTML = `<img src="/images/2.jpg" style="width: 100%; height: 100%;" ></img>`;

    target.getElementsByClassName(
      "front"
    )[0].innerHTML = `<img src="/images/1.jpg" style="width: 100%; height: 100%;" ></img>`;

    target.getElementsByClassName(
      "back"
    )[0].innerHTML = `<img src="/images/3.jpg" style="width: 100%; height: 100%;" ></img>`;

    target.getElementsByClassName(
      "top"
    )[0].innerHTML = `<img src="/images/4.jpg" style="width: 100%; height: 100%;" ></img>`;

    target.getElementsByClassName(
      "left"
    )[0].innerHTML = `<img src="/images/4.jpg" style="width: 100%; height: 100%;" ></img>`;

    target.getElementsByClassName(
      "right"
    )[0].innerHTML = `<img src="/images/4.jpg" style="width: 100%; height: 100%;" ></img>`;

    const tl = start();
    tl.play();

    return tl;
    /*return gsap[getMethodByType(config.type)]([target], {
      ease: config.ease,
      duration: config.duration!,
      scale: 1.5,
    });*/
  },
  defaults: {},
  extendTimeline: true,
});

function addCSS(target: HTMLDivElement) {
  target.innerHTML =
    target.innerHTML +
    `<style>
  
  .container{
    position: absolute;

    perspective: 1000px; 
    left:50%;
    top:50%;
    transform:translate(-50%,-50%);
  }

  .cuboid{
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .tile{
    position: absolute;
    left: 0;
    top: 0;
    color: #000;
    font-size: 20px;
    text-shadow: 0 0 3px #fff;
    overflow: hidden;

  }
  .front{
    //background: #f00;
  }
  .right{
    background: #ff0;
  }
  .left{
    background: #0ff;
  }
  .bottom{
    //background: #f0f;
  }
  .top{
    background: #40a;
  }
  .back{
    background: #fa3;
  }

  .pause,
  .animate{
    //margin-top: 100px;
    border: 1px solid #000;
    background: #eee;
    cursor:pointer;
  }

  .pause{
    margin-top: 5px;
  }
  </style>



`;
}

var w = 400,
  h = 200,
  d = 200,
  row = 1,
  col = 1;

function start() {
  const tl = gsap.timeline({
    paused: true,
    //repeat: -1
  });

  gsap.set(".container", {
    perspective: 1000,
    force3D: "auto",
    left: "50%",
    top: "50%",
    transform: "translate(-50%,-50%)",
  });

  gsap.set(".cuboid", {
    backfaceVisibility: "hidden",
    transformStyle: "preserve-3d",
    transformOrigin: "top",
  });

  gsap.set(".tile", {
    backfaceVisibility: "hidden",
    transformStyle: "preserve-3d",
  });

  gsap.set(".right", {
    rotationY: 90,
    x: w - d / 2,
    y: 0,
    z: -d / 2,
  });

  gsap.set(".left", {
    rotationY: -90,
    x: -d / 2,
    y: 0,
    z: -d / 2,
  });

  gsap.set(".bottom", {
    rotationX: -90,
    x: 0,
    y: d / 2,
    z: -d / 2,
  });

  gsap.set(".top", {
    rotationX: 90,
    x: 0,
    y: -d / 2,
    z: -d / 2,
  });

  gsap.set(".back", {
    rotationX: -180,
    rotationZ: -180, // Back for horizontal animation
    x: 0,
    y: 0,
    z: -d,
  });

  //_bottom(tl);

  _back(tl);
  _right(tl);
  _left(tl);

  return tl;
  /*
    _back();
  _front();
  _left();
  _right();
  _bottom();
  _top();
  */
}

function _front(tl: any) {
  pre(tl);
  tl.to(".cuboid", 2, {
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
  });
  post(tl);
}

function _back(tl: any) {
  pre(tl);
  tl.to(".cuboid", 1, {
    rotationX: -360,
    rotationY: 0,
    rotationZ: 0,
  });
  post(tl);
}

function _left(tl: any) {
  pre(tl);
  tl.to(".cuboid", 2, {
    rotationX: 0,
    rotationY: 90,
    rotationZ: 0,
  });
  post(tl);
}

function _right(tl: any) {
  pre(tl);
  tl.to(".cuboid", 1, {
    rotationX: 0,
    rotationY: -90,
    rotationZ: 0,
  });
  post(tl);
}

function _bottom(tl: any) {
  pre(tl);
  tl.to(".cuboid", 1, {
    rotationX: 90,
    rotationY: 0,
    rotationZ: 0,
    ease: "elastic.out(1, 0.4)",
  });
  post(tl);
}

function _top(tl: any) {
  pre(tl);
  tl.to(".cuboid", 2, {
    y: 200,
    rotationX: -90,
    rotationY: 0,
    rotationZ: 0,
  });
  post(tl);
}

function pre(tl: any) {
  tl.to(
    ".cubes",
    0.4,
    {
      scaleX: 0.6,
      scaleY: 0.6,
      scaleZ: 0.6,
    },
    "+=0.5"
  );
  /*
  tl.to(
    ".cubes",
    0.4,
    {
      perspective: 5000,
    },
    "+=0.5"
  );*/
}

function post(tl: any) {
  tl.to(".cubes", 0.4, {
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
  });
}
