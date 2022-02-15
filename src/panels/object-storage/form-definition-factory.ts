import {
  linodeOSFormDefinition,
  validateLinodeOS,
} from "./form-definitions/linode-item";
import { s3FormDefinition, validateS3 } from "./form-definitions/s3-item";
import { BucketType } from "./ObjectStorageItemForm";

export function getObjectStorageItemFormDefinition(type: BucketType): any[] {
  switch (type) {
    case "s3":
      return s3FormDefinition;
    case "linode":
      return linodeOSFormDefinition;
    default:
      return [];
  }
}

export function getObjectStorageValidationFunc(
  type: BucketType
): (valuesToValidate: any) => { valid: boolean; errors?: any } {
  switch (type) {
    case "s3":
      return validateS3;
    case "linode":
      return validateLinodeOS;
    default:
      return (d) => ({ valid: false });
  }
}

export function getPlatformName(type: string) {
  switch (type) {
    case "s3":
      return "AWS S3";
    case "linode":
      return "Linode Object Storage";
    default:
      return [];
  }
}

export function getPlatformList() {
  return ["s3", "linode"].map((type) => ({
    label: getPlatformName(type) as string,
    value: type,
  }));
}
