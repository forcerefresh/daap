import {
  linodeOSFormDefinition,
  validateLinodeOS,
} from "./form-definitions/linode-item";
import {
  digitalOceanOSFormDefinition,
  validateDigitalOceanOS,
} from "./form-definitions/digital-ocean-item";
import { s3FormDefinition, validateS3 } from "./form-definitions/s3-item";
import { BucketType } from "./ObjectStorageItemForm";

export function getObjectStorageItemFormDefinition(type: BucketType): any[] {
  switch (type) {
    case "s3":
      return s3FormDefinition;
    case "linode":
      return linodeOSFormDefinition;
    case "digital-ocean":
      return digitalOceanOSFormDefinition;
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
    case "digital-ocean":
      return validateDigitalOceanOS;
    default:
      return (_d) => ({ valid: false });
  }
}

export function getPlatformName(type: string) {
  switch (type) {
    case "s3":
      return "AWS S3";
    case "linode":
      return "Linode Object Storage";
    case "digital-ocean":
      return "Digital Ocean Space";
    default:
      return [];
  }
}

export function getPlatformList() {
  return ["s3", "linode", "digital-ocean"].map((type) => ({
    label: getPlatformName(type) as string,
    value: type,
  }));
}
