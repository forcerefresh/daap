export function relativePosition2Gsap(value: number, position: "abs" | "rel") {
  const sign = Math.sign(value);
  switch (position) {
    case "rel":
      return (sign !== -1 ? "+=" : "-=") + Math.abs(value);
    case "abs":
      return value;
  }
}
