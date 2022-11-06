import { IObject } from "webslider-sdk/lib/objects/i-object";

export interface IObjects {
  objectById: { [id: string]: IObject<{}> };
  allObjects: string[];
  nextObjectId: { [objectType: string]: number };
}
