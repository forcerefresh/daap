import { IObject } from "../../objects/types";

export interface IObjects {
  objectById: { [id: string]: IObject<{}> };
  allObjects: string[];
  nextObjectId: { [objectType: string]: number };
}
