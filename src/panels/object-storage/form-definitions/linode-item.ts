import {
  InputType,
  ISelectInput,
  ITextInput,
} from "../../../webslider-sdk/src/inputs/i-inputs";
import { object, string, ValidationError } from "yup";

export type LinodeOSFormDefinitionTuple = [
  ISelectInput<"environment">,
  ITextInput<"bucketName">,
  ITextInput<"region">,
  ITextInput<"key">,
  ITextInput<"secretKey">,
  ITextInput<"description">
];

export const linodeOSFormDefinition: LinodeOSFormDefinitionTuple = [
  {
    displayName: "Environment",
    propertyName: "environment",
    inputType: InputType.SELECT,
    value: "",
    defaultValue: "",
    options: [
      { label: "Select use type...", value: "" },
      { label: "Production", value: "production" },
      { label: "Development", value: "development" },
      { label: "QA", value: "qa" },
    ],
  },
  {
    displayName: "Bucket name (Linode object storage)",
    propertyName: "bucketName",
    inputType: InputType.TEXT,
    value: "",
    defaultValue: "",
    inputProps: { style: { width: "300px" } },
  },
  {
    displayName: "Bucket name (Linode object storage)",
    propertyName: "region",
    inputType: InputType.TEXT,
    value: "",
    defaultValue: "",
    inputProps: { style: { width: "300px" } },
  },

  {
    displayName: "Key",
    propertyName: "key",
    inputType: InputType.TEXT,
    value: "",
    defaultValue: "",
    inputProps: { style: { width: "500px" } },
  },
  {
    displayName: "Secret key",
    propertyName: "secretKey",
    inputType: InputType.TEXT,
    value: "",
    defaultValue: "",
    inputProps: { style: { width: "500px" } },
  },
  {
    displayName: "Description (optional)",
    propertyName: "description",
    inputType: InputType.TEXT,
    value: "",
    defaultValue: "",
    inputProps: { style: { width: "600px" } },
  },
];

const userSchema = object({
  environment: string().required("Environment is required"),
  bucketName: string().required("Bucket name is required"),
  region: string().required("Region is required"),
  key: string().required("Key is required"),
  secretKey: string().required("Secret key is required"),
});

export const validateLinodeOS = (
  valuesToValidate: any
): { valid: boolean; errors?: any } => {
  try {
    userSchema.validateSync(valuesToValidate, { abortEarly: false });
  } catch (err) {
    if (err instanceof ValidationError) {
      const allErrors: any = {};
      err.inner.forEach((e: any) => {
        allErrors[e.path] = e.message;
      });
      return { valid: false, errors: allErrors };
    } else {
      return { valid: false, errors: {} };
    }
  }

  return { valid: true };
};
