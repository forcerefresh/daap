import { uniq } from "lodash-es";
import { v4 as uuid } from "uuid";
import { GetFontsFuncReturnType } from "webslider-sdk/lib/objects/objects-register";
import { FontPreloader } from "../../objects/font-preloader";

export function updateObjectWithNewIds<T>(
  obj: T,
  fromToIds: { from: string; to: string }[]
) {
  let dataStr = JSON.stringify(obj);

  fromToIds.forEach((fromToId) => {
    dataStr = dataStr.replaceAll(fromToId.from, fromToId.to);
  });

  return JSON.parse(dataStr);
}

export function updateProjectWithNewIds<T>(project: T): {
  updatedProject: T;
  fromToIds: { from: string; to: string }[];
} {
  const projectStr = JSON.stringify(project);
  const res = projectStr.matchAll(
    /[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/g
  );

  const arrayOfIds = uniq(Array.from(res).map((item) => item[0]));
  const fromToIds = arrayOfIds.map((id) => ({
    from: id,
    to: uuid(),
  }));

  const updatedProject = updateObjectWithNewIds(project, fromToIds);

  return { updatedProject, fromToIds };
}

const fontPreloader = new FontPreloader();

export function preloadFonts(fonts: GetFontsFuncReturnType) {
  fonts.forEach((font) => {
    fontPreloader.subscribe(font.fontFamily).then(() => {});
  });
}
