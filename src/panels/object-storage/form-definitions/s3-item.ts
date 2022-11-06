import {
  InputType,
  ISelectInput,
  ITextInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { object, string, ValidationError } from "yup";

export type S3FormDefinitionTuple = [
  ISelectInput<"environment">,
  ITextInput<"bucketName">,
  ITextInput<"region">,
  ITextInput<"key">,
  ITextInput<"secretKey">,
  ITextInput<"description">
];

export const s3FormDefinition: S3FormDefinitionTuple = [
  {
    displayName: "Environment",
    propertyName: "environment",
    inputType: InputType.SELECT,
    value: "",
    defaultValue: "",
    options: [
      { label: "Select use type...", value: "" },
      { label: "Development", value: "development" },
      { label: "Testing", value: "testing" },
      { label: "Staging", value: "staging" },
      { label: "Production", value: "production" },
    ],
  },
  {
    displayName: "Bucket name (S3)",
    propertyName: "bucketName",
    inputType: InputType.TEXT,
    value: "",
    defaultValue: "",
    inputProps: { style: { width: "300px" } },
  },
  {
    displayName: "Region",
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

export const validateS3 = (
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
