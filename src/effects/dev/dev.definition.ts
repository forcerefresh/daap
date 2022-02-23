import { InputType } from "../../inputs/types";
import { FormType } from "../../utils/form-layout/i-form-layout";
import { IEffectDefinition } from "../trianglify/trianglify.definition";
import { dev, IDevEffect } from "./dev.types";

/*
{
  type: FormType.SWITCH_GROUP,
  displayName: "",
  propertyName: "sg",
  groups: [
    {
      groupName: "Tab 1 op",
      elements: [...]
    },
    {
      groupName: "Tab 1 op",
      elements: [...]
    }
  ]
}

{
  type: FormType.GROUP,
  displayName: "Group in the tab",
  propertyName: "groupInTab",
  optional: true,
  elements: [...]
  ],
},
*/

export const devDefinition: IEffectDefinition = {
  id: dev,
  name: "Dev *",
  form: [
    {
      type: FormType.SWITCH_GROUP,
      displayName: "",
      propertyName: "sg",
      groups: [
        {
          groupName: "Tab 1 op",
          groupValue: "tab1",
          elements: [
            {
              type: FormType.GROUP,
              displayName: "Group in the tab",
              propertyName: "groupInTab",
              optional: true,
              elements: [
                {
                  displayName: "Number 20",
                  propertyName: "num20",
                  inputType: InputType.NUMBER,
                  //optional: true,
                },
                {
                  displayName: "Number 21",
                  propertyName: "num21",
                  inputType: InputType.NUMBER,
                  //optional: true,
                },
              ],
            },
            {
              displayName: "Number A",
              propertyName: "numA",
              inputType: InputType.NUMBER,
              //optional: true,
            },
            {
              displayName: "Number B",
              propertyName: "numB",
              inputType: InputType.NUMBER,
              //optional: true,
            },
          ],
        },
        {
          groupName: "Tab 2 op",
          groupValue: "tab2",
          elements: [
            {
              displayName: "Number C",
              propertyName: "numC",
              inputType: InputType.NUMBER,
              //optional: true,
            },
            {
              displayName: "Number D",
              propertyName: "numD",
              inputType: InputType.NUMBER,
              //optional: true,
            },
          ],
        },
      ],
    },
    {
      displayName: "Slider",
      helperText: "",
      propertyName: "slider",
      inputType: InputType.SLIDER_INPUT,
      inputProps: {
        min: 0,
        max: 1000,
        sufix: "%",
        stepSize: 1,
        labelStepSize: 1,
        trackFill: false,
        thumbPosition: "top",
        hideLabels: false,
      },
    },
    {
      type: FormType.GROUP,
      displayName: "Basic",
      propertyName: "basicGroup",
      optional: true,
      elements: [
        {
          type: FormType.GROUP,
          displayName: "Basic sub",
          propertyName: "basicSubGroup",
          optional: true,
          elements: [
            {
              displayName: "Color 3",
              propertyName: "color3",
              inputType: InputType.COLOR,
              optional: true,
            },
            {
              displayName: "Color 4",
              propertyName: "color4",
              inputType: InputType.COLOR,
              optional: true,
            },
          ],
        },
        {
          type: FormType.GROUP,
          displayName: "Basic sub 2",
          propertyName: "basicSubGroup2",
          optional: true,
          elements: [
            {
              displayName: "Number 6",
              propertyName: "num6",
              inputType: InputType.NUMBER,
              //optional: true,
            },
            {
              displayName: "Number 7",
              propertyName: "num7",
              inputType: InputType.NUMBER,
              //optional: true,
            },
          ],
        },
        {
          displayName: "Color 1",
          propertyName: "color1",
          inputType: InputType.COLOR,
          optional: true,
        },
        {
          displayName: "Color 2",
          propertyName: "color2",
          inputType: InputType.COLOR,
          optional: true,
        },
      ],
    },

    /*{
      displayName: "Opcije",
      helperText: "dsfdsfsd safdsa das dsad sa das",
      propertyName: "buttonGroup",
      inputType: InputType.BUTTON_GROUP_INPUT,
      options: [
        { label: "Tab1", value: "Tab1" },
        { label: "Tab2", value: "Tab2" },
      ],
    },*/

    {
      displayName: "Number 8",
      propertyName: "num8",
      inputType: InputType.NUMBER,
      // optional: true,
    },
    {
      displayName: "Number 9",
      propertyName: "num9",
      inputType: InputType.NUMBER,
      // optional: true,
    },
    {
      displayName: "Number 10",
      propertyName: "num10",
      inputType: InputType.NUMBER,
      // optional: true,
    },
  ],
};

export const devDefaults: IDevEffect = {
  id: dev,
  hasDelay: false,
  hasDuration: false,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out", "effect", "slide", "layer"],
  canBeCombined: true,
  //effect properties
  color1: { r: 256, g: 256, b: 256, a: 1 },
  color2: { r: 256, g: 256, b: 256, a: 1 },
  color3: { r: 256, g: 256, b: 256, a: 1 },
  color4: { r: 256, g: 256, b: 256, a: 1 },
  num5: 3,
  num6: 4,
  num7: 7,
  num8: 4,
  num9: 3,
  num10: 4,
  numA: 4,
  numB: 4,
  numC: 4,
  numD: 4,
  num20: 20,
  num21: 21,
  sg: 0,
  slider: 33,
  buttonGroup: "Tab1",
  groupInTab: true,
};
