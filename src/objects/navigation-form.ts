import {
  InputType,
  ISelectInput,
  ISliderInput,
  ITextInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import {
  FormType,
  IFormSwitchGroup,
  IFormSwitchGroupItem,
} from "webslider-sdk/lib/form/i-form-layout";

export type NavigationTuple = [
  // ITextInput<"targetId">,
  IFormSwitchGroupItem<
    "navigationType",
    [
      IFormSwitchGroup<[]>,
      IFormSwitchGroup<
        [
          ISelectInput<"linkEvent">,
          ITextInput<"linkTarget">,
          ITextInput<"linkHref">,
          ISelectInput<"cursor">
        ]
      >,
      IFormSwitchGroup<
        [
          ISelectInput<"slideEvent">,
          IFormSwitchGroupItem<
            "slideReferenceType",
            [
              IFormSwitchGroup<[ITextInput<"slideNo">]>,
              IFormSwitchGroup<[ITextInput<"slideId">]>,
              IFormSwitchGroup<[]>,
              IFormSwitchGroup<[]>
            ]
          >,
          ISelectInput<"cursor">
        ]
      >
    ]
  >
];

export const navigationDefinition: NavigationTuple = [
  // {
  //   inputType: InputType.TEXT,
  //   propertyName: "targetId",
  //   defaultValue: "",
  //   displayName: "Target ID",
  //   value: "",
  // },
  {
    type: FormType.SWITCH_GROUP,
    displayName: "",
    propertyName: "navigationType",
    groups: [
      {
        groupName: "None",
        groupValue: "none",
        elements: [],
      },
      {
        groupName: "Link",
        groupValue: "link",
        elements: [
          {
            displayName: "Event",
            propertyName: "linkEvent",
            inputType: InputType.SELECT,
            value: "click",
            defaultValue: "click",
            options: [
              { label: "click", value: "click" },
              { label: "contextmenu", value: "contextmenu" },
              { label: "dblclick", value: "dblclick" },
              { label: "mousedown", value: "mousedown" },
              { label: "mouseenter", value: "mouseenter" },
              { label: "mouseleave", value: "mouseleave" },
              { label: "mousemove", value: "mousemove" },
              { label: "mouseout", value: "mouseout" },
              { label: "mouseover", value: "mouseover" },
              { label: "mouseup", value: "mouseup" },
            ],
          },
          {
            displayName: "Target",
            propertyName: "linkTarget",
            inputType: InputType.TEXT,
            value: "",
            defaultValue: "",
          },
          {
            displayName: "Url",
            propertyName: "linkHref",
            inputType: InputType.TEXT,
            value: "",
            defaultValue: "",
          },
          {
            displayName: "Cursor",
            propertyName: "cursor",
            inputType: InputType.SELECT,
            value: "pointer",
            defaultValue: "pointer",
            options: [
              { label: "default", value: "default" },
              { label: "pointer", value: "pointer" },
            ],
          },
        ],
      },
      {
        groupName: "Slide",
        groupValue: "slide",
        elements: [
          {
            displayName: "Event",
            propertyName: "slideEvent",
            inputType: InputType.SELECT,
            value: "click",
            defaultValue: "click",
            options: [
              { label: "click", value: "click" },
              { label: "contextmenu", value: "contextmenu" },
              { label: "dblclick", value: "dblclick" },
              { label: "mousedown", value: "mousedown" },
              { label: "mouseenter", value: "mouseenter" },
              { label: "mouseleave", value: "mouseleave" },
              { label: "mousemove", value: "mousemove" },
              { label: "mouseout", value: "mouseout" },
              { label: "mouseover", value: "mouseover" },
              { label: "mouseup", value: "mouseup" },
            ],
          },
          {
            type: FormType.SWITCH_GROUP,
            displayName: "",
            propertyName: "slideReferenceType",
            groups: [
              {
                groupName: "No",
                groupValue: "slideNo",
                elements: [
                  {
                    displayName: "Slide No",
                    propertyName: "slideNo",
                    inputType: InputType.TEXT,
                    value: "1",
                    defaultValue: "1",
                  },
                ],
              },
              {
                groupName: "Id",
                groupValue: "slideId",
                elements: [
                  {
                    displayName: "Slide Id",
                    propertyName: "slideId",
                    inputType: InputType.TEXT,
                    value: "",
                    defaultValue: "",
                  },
                ],
              },
              {
                groupName: "Next",
                groupValue: "next",
                elements: [],
              },
              {
                groupName: "Prev",
                groupValue: "prev",
                elements: [],
              },
            ],
          },
          {
            displayName: "Event",
            propertyName: "cursor",
            inputType: InputType.SELECT,
            value: "pointer",
            defaultValue: "pointer",
            options: [
              { label: "default", value: "default" },
              { label: "pointer", value: "pointer" },
            ],
          },
        ],
      },
    ],
  },
];
