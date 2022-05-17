import { RGBColor } from "react-color";
import {
  IBorderInput,
  IBorderSideValue,
  IBorderValue,
  IColorInput,
  ICornerRadiusInput,
  ICornerRadiusValue,
  IInputMetadataValues,
  InputType,
  ISelectInput,
  ITextAreaInput,
} from "../inputs/types";
import { FormType, IFormGroupItem } from "../utils/form-layout/i-form-layout";
import { getOverflowOptions } from "./create-object-factory";

export type CommonPropertiesTuple = [
  IFormGroupItem<
    [
      ICornerRadiusInput<"commonCornerRadius">,
      IBorderInput<"commonBorder">,
      ISelectInput<"commonOverflow">,
      ITextAreaInput<"commonInlineStyle">,
      IColorInput<"commonBackgroundColor">
    ]
  >
];

export interface CommonPropertiesValues {
  hasCommonProperties: boolean;
  commonCornerRadius: ICornerRadiusValue;
  commonBorder: IBorderValue;
  commonOverflow: string;
  commonInlineStyle: string;
  commonBackgroundColor: RGBColor;
}

export const getCommonObjectPropertiesDefinition =
  (): CommonPropertiesTuple => [
    {
      displayName: "Other",
      type: FormType.GROUP,
      propertyName: "hasCommonProperties",
      optional: true,
      elements: [
        {
          displayName: "Corner radius",
          propertyName: "commonCornerRadius",
          inputType: InputType.CORNER_RADIUS,
          value: {},
          defaultValue: { tl: "0", tr: "0", bl: "0", br: "", common: "0" },
          optional: true,
        },
        {
          displayName: "Border",
          propertyName: "commonBorder",
          inputType: InputType.BORDER,
          value: getDefaultBorderValue(),
          defaultValue: getDefaultBorderValue(),
          optional: true,
        },
        {
          displayName: "Overflow",
          propertyName: "commonOverflow",
          inputType: InputType.SELECT,
          options: getOverflowOptions(),
          value: "visible",
          defaultValue: "visible",
          optional: true,
        },
        {
          displayName: "Inline style",
          propertyName: "commonInlineStyle",
          inputType: InputType.TEXTAREA,
          value: "",
          defaultValue: "",
          optional: true,
        },
        {
          displayName: "Background color",
          helperText: "",
          propertyName: "commonBackgroundColor",
          inputType: InputType.COLOR,
          value: {} as any,
          defaultValue: {} as any,
          optional: true,
        },
      ],
    },
  ];

export const getCommonPropertiesValues = (): CommonPropertiesValues => ({
  hasCommonProperties: false,
  commonCornerRadius: { tl: "0", tr: "0", bl: "0", br: "", common: "0" },
  commonBorder: getDefaultBorderValue(),
  commonOverflow: "visible",
  commonInlineStyle: "",
  commonBackgroundColor: { r: 255, g: 255, b: 255, a: 1 },
});

export const getCommonPropertiesMetadataValues = (): {
  [key: string]: IInputMetadataValues;
} => {
  return {
    commonCornerRadius: { exportForWizard: false, disabled: true },
    commonBorder: { exportForWizard: false, disabled: true },
    commonOverflow: { exportForWizard: false, disabled: true },
    commonInlineStyle: { exportForWizard: false, disabled: true },
    commonBackgroundColor: { exportForWizard: false, disabled: true },
  };
};

export function getDefaultBorderValue(): IBorderValue {
  return {
    useCommonValue: true,
    top: getDefaultBorderSideValue(),
    bottom: getDefaultBorderSideValue(),
    left: getDefaultBorderSideValue(),
    right: getDefaultBorderSideValue(),
    commonBorder: getDefaultBorderSideValue(),
  };
}

export function getDefaultBorderSideValue(): IBorderSideValue {
  return {
    color: { r: 255, g: 255, b: 255, a: 1 },
    style: "solid",
    width: "10px",
  };
}
