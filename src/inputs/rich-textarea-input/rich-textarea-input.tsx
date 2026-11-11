import { FormGroup } from "@blueprintjs/core";
import { debounce, isEmpty, noop } from "lodash-es";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ITextAreaInput,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import RichTextEditor from "react-rte";
import css from "./rich-textarea-input.module.scss";

export const RichTextAreaInputForm: React.FC<ITextAreaInput & IUpdateInput> = (
  props
) => {
  const { displayName, value, onInput = noop, inputProps = {} } = props;
  const throttledOnChange = useCallback(
    debounce((value: any) => onInput(value), 500),
    [onInput]
  );

  const [localValue, setLocalValue] = useState(
    RichTextEditor.createEmptyValue()
  );

  useEffect(() => {
    if (isEmpty(value)) {
      setLocalValue(RichTextEditor.createEmptyValue(value));
    } else {
      setLocalValue(RichTextEditor.createValueFromString(value, "html"));
    }
  }, []);

  const handleChange = (value: any) => {
    if (inputProps.disableDebounce) {
      onInput(value);
    } else {
      throttledOnChange(value);
    }
  };

  const toolbarConfig = useMemo(
    () => ({
      display: [
        "INLINE_STYLE_BUTTONS",
        "BLOCK_TYPE_BUTTONS",
        "HISTORY_BUTTONS",
      ],
      INLINE_STYLE_BUTTONS: [
        { label: "Bold", style: "BOLD", className: "custom-css-class" },
        { label: "Italic", style: "ITALIC" },
        { label: "Underline", style: "UNDERLINE" },
      ],
      BLOCK_TYPE_BUTTONS: [
        { label: "UL", style: "unordered-list-item" },
        { label: "OL", style: "ordered-list-item" },
      ],
    }),
    []
  );

  return (
    <FormGroup
      label={displayName}
      labelFor="textarea-input"
      className={css.main}
    >
      <RichTextEditor
        className={css.rte}
        value={localValue}
        onChange={(value: any) => {
          if (value !== value.toString("html")) {
            setLocalValue(value);
            handleChange(value.toString("html"));
          }
        }}
        toolbarConfig={toolbarConfig}
      />
    </FormGroup>
  );
};
