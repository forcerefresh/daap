import { VectorData } from "./VectorLibraryPanel";

const dataArr: VectorData[] = [
  {
    title: "Arrow 1",
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10.477 0h-8.977l12.024 12-12.024 12h8.977l12.023-12z"/></svg>`,
    categories: ["Arrows"],
    tags: ["Arrows"],
    rating: 5,
  },
  {
    title: "Arrow 2",
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M22 12l-20 12 7.289-12-7.289-12z"/></svg>`,
    categories: ["Arrows"],
    tags: ["Arrows"],
    rating: 5,
  },
];
export function fetchMock(): Promise<{ vectors: VectorData[] }> {
  return new Promise((resolve, rejecte) => {
    resolve({ vectors: dataArr });
  });
}
