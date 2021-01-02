import { FormGroup, InputGroup } from "@blueprintjs/core";
import { noop } from "lodash-es";
import React, { useContext } from "react";
import { IntegrationContext } from "../../integration";
import { IImageInput, ITextInput, IUpdateInput } from "../types";

export const ImageInputForm: React.FC<IImageInput & IUpdateInput> = (props) => {
  const { displayName, value, onChange = noop } = props;

  const globalContext = useContext(IntegrationContext);

  const { requestMedia } = globalContext.useMediaHook();

  const handleClick = () => {
    requestMedia("image").then((mediaObject: { url: string }) => {
      onChange(mediaObject);
    });
  };

  return (
    <FormGroup label={displayName} labelFor="text-input" inline>
      <InputGroup
        id="text-input"
        placeholder="Placeholder text"
        value={value.url}
        onClick={handleClick}
      />
    </FormGroup>
  );
};
