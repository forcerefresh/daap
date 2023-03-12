import { Button, Checkbox, Icon } from "@blueprintjs/core";
import classnames from "classnames";
import React, { useEffect, useState } from "react";
import { InputType } from "webslider-sdk/lib/inputs/i-inputs";
import { AppToaster } from "../components/app-toaster/AppToaster";
import css from "./form-layout.module.scss";
import { flatten } from "lodash";
import { IFormState } from "../../store/reducers/i-uiforms";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import { setFormState } from "../../store/actions/actions";
import {
  FormType,
  IFormLayoutItem,
} from "webslider-sdk/lib/form/i-form-layout";

type FormWithLayoutProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    inputs: { propertyName: string; input: React.ReactElement | undefined }[];
    form: IFormLayoutItem[];
    values: any;
    formId: string;
    depth?: number;
    skipOpeningGroupByDefault?: boolean;
  };

const FormWithLayout: React.FC<FormWithLayoutProps> = (props) => {
  const {
    inputs,
    values,
    form,
    depth = 0,
    formId,
    uiFormSate,
    _setFormState,
    skipOpeningGroupByDefault,
  } = props;

  const visibleSectionIds = uiFormSate[formId] ?? {};

  const setVisibleSectionIds = (formState: IFormState) => {
    _setFormState(formId, formState);
  };

  /*const [visibleSectionIds, setVisibleSectionIds] = useState<IFormState>({});

  useEffect(() => {
    setVisibleSectionIds(uiFormSate[formId] ?? {});
    //return () => {
     // _setFormState(formId, visibleSectionIds);
    //};
  }, []);

  useEffect(() => {
    _setFormState(formId, visibleSectionIds);
  }, [visibleSectionIds, formId, _setFormState]);
*/

  const toggleSection = (section: string) => {
    setVisibleSectionIds({
      ...visibleSectionIds,
      [section]: !visibleSectionIds[section],
    });
  };

  const renderElement = (
    element: IFormLayoutItem
  ): React.ReactElement | undefined => {
    if (element.type === FormType.GROUP) {
      return (
        <FormWithLayoutConnected
          inputs={inputs}
          values={values}
          form={[element]}
          depth={depth + 1}
          formId={formId}
        />
      );
    } else if (element.type === FormType.SWITCH_GROUP) {
      return (
        <>
          {findInput(element.propertyName, inputs, element.duplicate)}
          {renderSwitchGroups(element.propertyName, element.groups!, values)}
        </>
      );
    }

    // get per device input
    const perDeviceInputs = inputs.filter((input) => {
      return input.propertyName?.startsWith(element.propertyName + "_D_");
    });

    return (
      <>
        {findInputWithWrapper(element.propertyName, inputs, element.duplicate)}
        {perDeviceInputs.map((dInput) =>
          findInputWithWrapper(dInput.propertyName, inputs, element.duplicate)
        )}
      </>
    );
  };

  const renderSwitchGroups = (
    propertyName: string,
    groups: {
      groupName: string;
      groupValue: string;
      propertyName: string;
      elements?: IFormLayoutItem[] | undefined;
    }[],
    values: any
  ) => {
    return groups.map((group) => {
      if (values[propertyName] === group.groupValue) {
        return group?.elements?.map((element: any) => {
          return renderElement(element);
        });
      }
      return null;
    });

    //return <section className={css.tabPanel}></section>;
  };

  const renderPanel = (
    title: string,
    optional: boolean = false,
    optionalProperty: string = "",
    elements: IFormLayoutItem[] = [],
    inputs: any,
    values: any,
    indexInArray: number,
    skipOpeningGroupByDefault = false
  ) => {
    const shouldBeOpenAnyhow =
      typeof visibleSectionIds[title] === "undefined" &&
      indexInArray === 0 &&
      !skipOpeningGroupByDefault;

    if (shouldBeOpenAnyhow) {
      setVisibleSectionIds({
        ...visibleSectionIds,
        [title]: !visibleSectionIds[title],
      });
    }

    const isOpen = visibleSectionIds[title]; // && (!optional || values[optionalProperty]);

    const isDisabled = optional && !values[optionalProperty];

    return (
      <section className={classnames(css[`depth${depth}`])}>
        <Button
          className={css.sectionHeader}
          onClick={() => {
            /*if (!values[optionalProperty] && optional) {
              AppToaster.show({
                intent: "warning",
                message:
                  "Group options are disabled. Please click on checkbox to enable it.",
              });
            } else {*/
            toggleSection(title);
            /* }*/
          }}
          icon={isOpen ? "caret-down" : "caret-right"}
          small
          minimal
          alignText={"left"}
        >
          <span
            onClick={(e) => {
              if (!values[optionalProperty]) {
                e.stopPropagation();
                setVisibleSectionIds({
                  ...visibleSectionIds,
                  [title]: true,
                });
              } else {
              }
            }}
          >
            {!!optional &&
              inputs.find((item: any) => item.propertyName === optionalProperty)
                .input}
          </span>
          {title}
        </Button>
        {isOpen && !isDisabled && (
          <div className={css.elementsHolder}>
            {elements.map((element) => renderElement(element))}
          </div>
        )}

        {isOpen && isDisabled && (
          <div className={css.elementsHolder}>
            <i>
              Group is disabled.
              <br /> To activate options enable group.
            </i>
          </div>
        )}
      </section>
    );
  };

  return (
    <>
      {form.map((formItem, idx) => {
        if (formItem.type === FormType.GROUP) {
          return (
            <div
              key={"group_" + formItem.propertyName}
              className={css.formSections}
            >
              {renderPanel(
                formItem.displayName,
                formItem.optional,
                formItem.propertyName,
                formItem.elements,
                inputs,
                values,
                idx,
                skipOpeningGroupByDefault
              )}
            </div>
          );
        } else if (formItem.type === FormType.INPUT) {
          return renderElement(formItem);
          // return findInputWithWrapper(
          //   formItem.propertyName,
          //   inputs,
          //   formItem.duplicate
          // );
        } else if (formItem.type === FormType.SWITCH_GROUP) {
          return (
            <div key={"switch_group_" + formItem.propertyName}>
              {findInputWithWrapper(
                formItem.propertyName,
                inputs,
                formItem.duplicate
              )}
              {renderSwitchGroups(
                formItem.propertyName,
                formItem.groups!,
                values
              )}
            </div>
          );
        }
        return null;
      })}
    </>
  );
};

const mapStateToProps = (state: IStore) => {
  const {
    uiforms: { uiFormSate },
  } = state;
  return { uiFormSate };
};

const mapDispatchToProps = {
  _setFormState: (formId: string, formState: IFormState) =>
    setFormState({ formId, formState }),
};

const FormWithLayoutConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(FormWithLayout);
export default FormWithLayoutConnected;

export function flattenForm(form: IFormLayoutItem[]): IFormLayoutItem[] {
  const itemsArr: IFormLayoutItem[] = [];
  flattenFormRec(itemsArr, form);
  return itemsArr;
}

export function flattenFormRec(
  itemsArr: IFormLayoutItem[],
  form: IFormLayoutItem[]
): void {
  form.forEach((formItem) => {
    // set default type if not set
    if (!formItem.type) formItem.type = FormType.INPUT;

    switch (formItem.type) {
      case FormType.INPUT: {
        itemsArr.push(formItem);
        break;
      }
      case FormType.GROUP: {
        // TODO: check if optional ??
        if (formItem.optional) {
          itemsArr.push({
            displayName: "",
            propertyName: formItem.propertyName,
            inputType: InputType.CHECKBOX,
          });
        }

        flattenFormRec(itemsArr, formItem.elements ?? []);
        break;
      }
      case FormType.SWITCH_GROUP: {
        itemsArr.push({
          displayName: formItem.displayName,
          propertyName: formItem.propertyName,
          inputType: InputType.BUTTON_GROUP_INPUT,
          options: formItem.groups?.map((group) => ({
            value: group.groupValue,
            label: group.groupName,
          })),
        });

        const allElements = flatten(
          formItem?.groups?.map((group) => group.elements!)
        );

        flattenFormRec(itemsArr, allElements ?? []);
        break;
      }

      default: {
        break;
      }
    }
  });
}

const findInput = (
  propertyName: string,
  inputs: {
    propertyName: string;
    input: React.ReactElement | undefined;
    duplicate?: string;
  }[],
  duplicate = ""
): React.ReactElement | undefined => {
  return inputs.find(
    (item) => item.propertyName === propertyName && item.duplicate === duplicate
  )?.input;
};

const findInputWithWrapper = (
  propertyName: string,
  inputs: {
    propertyName: string;
    input: React.ReactElement | undefined;
    duplicate?: string;
  }[],
  duplicate = ""
): React.ReactElement | undefined => {
  return (
    <div key={"input_with_wrapper_" + propertyName} className={css.input}>
      {findInput(propertyName, inputs, duplicate)}
    </div>
  );
};
