import gsap from "gsap";
import { ICSSRectangle, ISize } from "../../utils/doom-utils/common";
import { canvasCopy, ICanvasCopyEffect } from "./canvas-copy";

gsap.registerEffect({
  name: canvasCopy,
  effect: function (targets: any, config: ICanvasCopyEffect) {
    const objectEL = targets[0]! as HTMLElement;
    const canvasEl = objectEL.firstChild as HTMLCanvasElement;
    const ctx = canvasEl.getContext("2d");

    const rootTimeline = gsap.timeline({ duration: config.duration });

    let sourceEl: HTMLImageElement;

    const renderFrame = ({
      container,
      canvas,
      image,
      imageRect,
    }: {
      imageRect: ICSSRectangle;
      image: ISize;
      container: ICSSRectangle;
      canvas: ICSSRectangle;
    }) => {
      //const renderFrame = () => {
      // if (ctx)
      //   ctx.filter = "contrast(1.2) sepia(0.7) drop-shadow(-3px 3px 1px #e81)";
      //ctx?.drawImage(sourceEl, 0, 0, sourceEl.width, sourceEl.height);

      /*  ctx?.drawImage(
        sourceEl,
        canvas.left,
        canvas.top,
        sourceEl.width,
        sourceEl.height
      );*/

      //const { container, canvas, image, imageRect } = calculate();

      const mpl = (imageRect.width - imageRect.left) / image.width;

      ctx?.drawImage(
        sourceEl,
        canvas.left / mpl,
        canvas.top / mpl,
        sourceEl.width,
        sourceEl.height,
        imageRect.left + container.left,
        imageRect.top + container.top,
        sourceEl.width * mpl,
        sourceEl.height * mpl
      );

      setTimeout(function () {
        renderFrame({
          container,
          canvas,
          image,
          imageRect,
        });
        //renderFrame(imageRect, image, container, canvas);
      }, 1000);
    };

    let isInitialized = false;
    let rootObjectEl: HTMLElement;

    const initializeIfNotInitialized = () => {
      if (!isInitialized) {
        sourceEl = document.getElementById("source1") as HTMLImageElement;
        rootObjectEl = sourceEl.parentElement?.parentElement!;

        if (rootObjectEl!.offsetHeight === 0) return;

        isInitialized = true;

        //const { container, canvas, image, imageRect } = calculate();
        renderFrame(calculate());

        /*
        const container = {
          height: rootObjectEl!.offsetHeight,
          width: rootObjectEl!.offsetWidth,
          left: rootObjectEl!.parentElement!.offsetLeft,
          top: rootObjectEl!.parentElement!.offsetTop,
        };

        const image = {
          height: sourceEl.naturalHeight,
          width: sourceEl.naturalWidth,
        };

        const imageSize = getImageSize({ size: "cover", container, image });

        const vDiff = container.height! - imageSize.height;
        const hDiff = container.width! - imageSize.width;

        const imageRect = {
          ...imageSize,
          top: vDiff ? vDiff / 2 : 0,
          left: hDiff ? hDiff / 2 : 0,
        };

        const canvas = {
          left: canvasEl.parentElement?.parentElement?.offsetLeft!,
          top: canvasEl.parentElement?.parentElement?.offsetTop!,
          width: canvasEl.parentElement?.parentElement?.offsetWidth!,
          height: canvasEl.parentElement?.parentElement?.offsetHeight!,
        };

        renderFrame(imageRect, image, container, canvas);
        */
      }
    };

    const calculate = () => {
      const container = {
        height: rootObjectEl!.offsetHeight,
        width: rootObjectEl!.offsetWidth,
        left: rootObjectEl!.parentElement!.offsetLeft,
        top: rootObjectEl!.parentElement!.offsetTop,
      };

      const image = {
        height: sourceEl.naturalHeight,
        width: sourceEl.naturalWidth,
      };

      const imageSize = getImageSize({ size: "cover", container, image });

      const vDiff = container.height! - imageSize.height;
      const hDiff = container.width! - imageSize.width;

      const imageRect = {
        ...imageSize,
        top: vDiff ? vDiff / 2 : 0,
        left: hDiff ? hDiff / 2 : 0,
      };
      //////////
      //const bounds =
      //  canvasEl.parentElement?.parentElement?.getBoundingClientRect();

      /*  const parentPos =
        canvasEl.parentElement?.parentElement?.parentElement?.parentElement?.getBoundingClientRect();
      const childPos =
        canvasEl.parentElement?.parentElement?.getBoundingClientRect();

      const bounds = {
        top: childPos!.top - parentPos!.top,
        left: childPos!.left - parentPos!.left,
        width:
          childPos!.right -
          parentPos!.right -
          (childPos!.left - parentPos!.left),
        height:
          childPos!.bottom -
          parentPos!.bottom -
          (childPos!.top - parentPos!.top),
      };

      const canvas = {
        left: bounds?.left!, //canvasEl.parentElement?.parentElement?.offsetLeft!,
        top: bounds?.top!, //canvasEl.parentElement?.parentElement?.offsetTop!,
        width: bounds?.width!, //canvasEl.parentElement?.parentElement?.offsetWidth!,
        height: bounds?.height!, //canvasEl.parentElement?.parentElement?.offsetHeight!,
      };*/

      const canvas = {
        left: canvasEl.parentElement?.parentElement?.offsetLeft!,
        top: canvasEl.parentElement?.parentElement?.offsetTop!,
        width: canvasEl.parentElement?.parentElement?.offsetWidth!,
        height: canvasEl.parentElement?.parentElement?.offsetHeight!,
      };

      return { container, canvas, image, imageRect };
    };
    const teardownIfInitialized = () => {
      if (isInitialized) {
        isInitialized = false;
      }
    };
    rootTimeline.eventCallback("onStart", () => {
      initializeIfNotInitialized();
    });

    rootTimeline.eventCallback("onUpdate", () => {
      initializeIfNotInitialized();
    });

    rootTimeline.eventCallback("onComplete", () => {
      teardownIfInitialized();
    });
    return rootTimeline;
  },

  defaults: {},
  extendTimeline: true,
});

/*
function waves() {
  var canvas = document.querySelector("canvas"),
      ctx = canvas.getContext("2d"),
      w = canvas.width,
      h = canvas.height;

  ctx.drawImage(this, 0, 0);

  var o1 = new Osc(0.05), o2 = new Osc(0.03), o3 = new Osc(0.06),  // osc. for vert
      o4 = new Osc(0.08), o5 = new Osc(0.04), o6 = new Osc(0.067), // osc. for hori
      
      // source grid lines
      x0 = 0, x1 = w * 0.25, x2 = w * 0.5, x3 = w * 0.75, x4 = w,
      y0 = 0, y1 = h * 0.25, y2 = h * 0.5, y3 = h * 0.75, y4 = h,
      
      // cache source widths/heights
      sw0 = x1, sw1 = x2 - x1, sw2 = x3 - x2, sw3 = x4 - x3,
      sh0 = y1, sh1 = y2 - y1, sh2 = y3 - y2, sh3 = y4 - y3,
      
      vcanvas = document.createElement("canvas"),  // off-screen canvas for 2. pass
      vctx = vcanvas.getContext("2d");

  vcanvas.width = w; vcanvas.height = h;           // set to same size as main canvas

  (function loop() {
    ctx.clearRect(0, 0, w, h);
    
    for (var y = 0; y < h; y++) {

      // segment positions
      var lx1 = x1 + o1.current(y * 0.2) * 2.5,
          lx2 = x2 + o2.current(y * 0.2) * 2,
          lx3 = x3 + o3.current(y * 0.2) * 1.5,

          // segment widths
          w0 = lx1,
          w1 = lx2 - lx1,
          w2 = lx3 - lx2,
          w3 =  x4 - lx3;

      // draw image lines
      ctx.drawImage(img, x0, y, sw0, 1, 0        , y, w0      , 1);
      ctx.drawImage(img, x1, y, sw1, 1, lx1 - 0.5, y, w1 + 0.5, 1);
      ctx.drawImage(img, x2, y, sw2, 1, lx2 - 0.5, y, w2 + 0.5, 1);
      ctx.drawImage(img, x3, y, sw3, 1, lx3 - 0.5, y, w3 + 0.5, 1);
    }

    // pass 1 done, copy to off-screen canvas:
    vctx.clearRect(0, 0, w, h);    // clear off-screen canvas (only if alpha)
    vctx.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, w, h);     // clear main (onlyif alpha)

    for (var x = 0; x < w; x++) {
      var ly1 = y1 + o4.current(x * 0.32),
          ly2 = y2 + o5.current(x * 0.3) * 2,
          ly3 = y3 + o6.current(x * 0.4) * 1.5;

      ctx.drawImage(vcanvas, x, y0, 1, sh0, x, 0        , 1, ly1);
      ctx.drawImage(vcanvas, x, y1, 1, sh1, x, ly1 - 0.5, 1, ly2 - ly1 + 0.5);
      ctx.drawImage(vcanvas, x, y2, 1, sh2, x, ly2 - 0.5, 1, ly3 - ly2 + 0.5);
      ctx.drawImage(vcanvas, x, y3, 1, sh3, x, ly3 - 0.5, 1,  y4 - ly3 + 0.5);
    }

    requestAnimationFrame(loop);
  })();
}

function Osc(speed) {

  var frame = 0;

  this.current = function(x) {
    frame += 0.002 * speed;
    return Math.sin(frame + x * speed * 10);
  };
}*/

const ratios = {
  cover: function (wRatio: number, hRatio: number) {
    return Math.max(wRatio, hRatio);
  },

  contain: function (wRatio: number, hRatio: number) {
    return Math.min(wRatio, hRatio);
  },

  // original size
  auto: function (_wRatio: number, _hRatio: number) {
    return 1;
  },

  // stretch
  "100% 100%": function (wRatio: number, hRatio: number) {
    return { width: wRatio, height: hRatio };
  },
};

function getImageSize(options: any) {
  if (!(ratios as any)[options.size as any]) {
    throw new Error(options.size + " not found in ratios");
  }

  var r = (ratios as any)[options.size as any](
    options.container.width / options.image.width,
    options.container.height / options.image.height
  );

  return {
    width: options.image.width * (r.width || r),
    height: options.image.height * (r.height || r),
  };
}
