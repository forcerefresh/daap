/**
 * Preset group shod be created from multiple parts
 * Pattern: {WHAT}-{TYPE}-{VERSION}  note: version is optional
 * e.g:
 * input-color  // cor colors
 * input-colors  // for multiple colors
 * effect-text
 * object-image
 */
export type PresetGroup = string;

export interface Preset<T> {
  uid: string;
  name: string;
  value: T;
  created?: Date;
  modified?: Date;
}
