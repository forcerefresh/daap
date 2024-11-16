import { forEach } from "lodash-es";
import { IObject } from "webslider-sdk/lib/objects/i-object";

const MAX_COPY_NUMBER = 50;

export function getCopyName(
  objectById: {
    [id: string]: IObject<{}>;
  },
  name?: string
) {
  if (!name) return;

  const newNameBse = name.replace(/\s+copy \d+/, "");
  let fromIdx = parseInt(name.split("copy").pop()?.trim() ?? "0");
  fromIdx = isNaN(fromIdx) ? 0 : fromIdx;
  if (fromIdx < 50) {
    for (let i = fromIdx + 1; i < MAX_COPY_NUMBER; i++) {
      const newName = `${newNameBse} copy ${i}`;
      if (isNameUnique(objectById, newName)) {
        return newName;
      }
    }
  }

  return `${name} copy`;
}

function isNameUnique(
  objectById: {
    [id: string]: IObject<{}>;
  },
  name: string
) {
  let unique = true;
  forEach(objectById, (object) => {
    if (object.name === name) {
      unique = false;
    }
  });

  return unique;
}
