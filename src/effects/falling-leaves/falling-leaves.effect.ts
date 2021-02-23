import gsap from "gsap";
import { fallingLeaves, IFallingLeaves } from "./falling-leaves.types";

gsap.registerEffect({
  name: fallingLeaves,
  effect: function (targets: any, config: IFallingLeaves) {
		gsap.set(targets, {
			perspective: 500,
			xPercent:"-50%",
			yPercent:"-50%"
		})
    const url = "/images/leaf.png";

    const size = { w: 50, h: 50 };
    const amount = 30;
    const h = 900;

    const animate = (element: Element) => {
			let tl = gsap.timeline()
			
        tl.to(element, {
          duration: R(config.duration! + 4, config.duration! + 11),
          y: h + 100,
          ease: "easeNone",
        })
        tl.to(
          element,
          {
            duration: R(config.duration! + 2, config.duration! + 4),
            x: "+=200",
            rotationZ: R(0, 180),
            ease: "easeInOut",
          },
          "<"
        )
        tl.to(
          element,
          {
            duration: R(config.duration!, config.duration! + 6),
            rotationX: R(0, 360),
            rotationY: R(0, 360),
            ease: "easeInOut",
          },
          "<"
				);
				return tl
    };

    for (let i = 0; i < amount; i++) {
      let leaf = createLeaf(size, url);
      targets[0].appendChild(leaf[0]);
      animate(leaf[0]);
    }
  },
  defaults: {},
  extendTimeline: true,
});

function R(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createLeaf(size: { w: number; h: number }, url: string): Element[] {
  const holder = document.createElement("div");
  let html = "";
  html = `<div style="transform:translate3d(${R(0, 600)}px, ${R(
    -600,
    -400
  )}px, ${R(-200, 200)}px);">
					<img src="${url}" width="${size.w}" height="${size.h}"/>
					</div>`;

  holder.innerHTML = html;
  return Array.from(holder.children);
}
