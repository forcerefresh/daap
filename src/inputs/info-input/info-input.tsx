import { FormGroup } from "@blueprintjs/core";
import React, { useMemo } from "react";
import { IInfoInput } from "webslider-sdk2/lib/inputs/i-inputs";

export const InfoInputForm: React.FC<IInfoInput> = (props) => {
  const { displayName, helperText } = props;

  const inputId = useMemo(() => {
    return displayName + Math.random();
  }, []);

  return (
    <FormGroup
      label={displayName}
      labelFor={inputId}
      inline
      helperText={!!helperText && helperText}
    ></FormGroup>
  );
};
