import { IObject } from "../../webslider-sdk/src/objects/i-object";

export interface IObjects {
  objectById: { [id: string]: IObject<{}> };
  allObjects: string[];
  nextObjectId: { [objectType: string]: number };
}
