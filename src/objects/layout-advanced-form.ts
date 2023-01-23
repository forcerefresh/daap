import { ICheckboxInput, InputType } from "webslider-sdk/lib/inputs/i-inputs";
import { FormType, IFormGroupItem } from "webslider-sdk/lib/form/i-form-layout";

export type LayoutAdvancedTuple = [
  IFormGroupItem<[ICheckboxInput<"updateSize">, ICheckboxInput<"updateScale">]>
];

export const layoutAdvancedDefinition: LayoutAdvancedTuple = [
  {
    type: FormType.GROUP,
    displayName: "Advanced",
    propertyName: "hasLayoutAdvance",
    optional: true,
    elements: [
      {
        displayName: "Size",
        helperText: "Size object on resize",
        propertyName: "updateSize",
        inputType: InputType.CHECKBOX,
        value: true,
        defaultValue: true,
      },
      {
        displayName: "Scale",
        helperText: "Scale object on resize",
        propertyName: "updateScale",
        inputType: InputType.CHECKBOX,
        value: false,
        defaultValue: false,
      },
    ],
  },
];
