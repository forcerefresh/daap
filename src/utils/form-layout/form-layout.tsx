import { Button, Checkbox, Icon } from "@blueprintjs/core";
import React, { useState } from "react";
import { IFormConfiguration } from "../../effects/dev2/dev2.definition";
import css from "./form-layout.module.scss";

export interface FormWithLayoutProps {
  inputs: { propertyName: string; input: React.ReactElement | undefined }[];
  formConfiguration: IFormConfiguration;
  values: any;
}

export const FormWithLayout: React.FC<FormWithLayoutProps> = (props) => {
  const { inputs, values, formConfiguration } = props;

  console.log(values);
  const [visibleSectionIds, setVisibleSectionIds] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleSection = (section: string) => {
    setVisibleSectionIds({
      ...visibleSectionIds,
      [section]: !visibleSectionIds[section],
    });
  };

  const renderPanel = (
    title: string,
    optional: boolean = false,
    optionalProperty: string = "",
    properties: { property: string; optional?: boolean }[],
    inputs: any,
    values: any
  ) => {
    return (
      <section>
        <Button
          className={css.sectionHeader}
          onClick={() => toggleSection(title)}
          icon={
            visibleSectionIds[title] && values[optionalProperty]
              ? "caret-down"
              : "caret-right"
          }
          small
          minimal
          alignText={"left"}
        >
          {optional &&
            inputs.find((item: any) => item.propertyName === optionalProperty)
              .input}
          {title}
        </Button>
        {visibleSectionIds[title] &&
          (!optional || values[optionalProperty]) &&
          properties.map((property) => findInput(property.property, inputs))}
      </section>
    );
  };

  return (
    <>
      {formConfiguration.map((panel) => (
        <div className={css.formSections}>
          {renderPanel(
            panel.groupName,
            panel.optional,
            panel.optionalProperty,
            panel.properties,
            inputs,
            values
          )}
        </div>
      ))}
    </>
  );
};
/*
export const renderFormWithLayout = (
  inputs: { propertyName: string; input: React.ReactElement | undefined }[],
  formConfiguration: IFormConfiguration
) => {
  return formConfiguration.map((panel) => (
    <div className={css.formSections}>
      {renderPanel(panel.groupName, panel.properties, inputs)}
    </div>
  ));
};
*/
const findInput = (
  propertyName: string,
  inputs: { propertyName: string; input: React.ReactElement | undefined }[]
): React.ReactElement | undefined => {
  return inputs.find((item) => item.propertyName === propertyName)?.input;
};
