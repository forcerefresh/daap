import { FormGroup, TextArea } from "@blueprintjs/core";
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
  const { rows = 5 } = inputProps;

  const throttledOnChange = useCallback(
    debounce((value: any) => onInput(value), 500),
    [onInput]
  );

  const [localValue, setLocalValue] = useState(
    RichTextEditor.createEmptyValue()
  ); // TODO value

  useEffect(() => {
    //if (localValue !== value) {
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

  // The toolbarConfig object allows you to specify custom buttons, reorder buttons and to add custom css classes.
  // Supported inline styles: https://github.com/facebook/draft-js/blob/master/docs/Advanced-Topics-Inline-Styles.md
  // Supported block types: https://github.com/facebook/draft-js/blob/master/docs/Advanced-Topics-Custom-Block-Render.md#draft-default-block-render-map
  const toolbarConfig = useMemo(
    () => ({
      // Optionally specify the groups to display (displayed in the order listed).
      display: [
        "INLINE_STYLE_BUTTONS",
        "BLOCK_TYPE_BUTTONS",
        //"LINK_BUTTONS",
        //"BLOCK_TYPE_DROPDOWN",
        "HISTORY_BUTTONS",
      ],
      INLINE_STYLE_BUTTONS: [
        { label: "Bold", style: "BOLD", className: "custom-css-class" },
        { label: "Italic", style: "ITALIC" },
        { label: "Underline", style: "UNDERLINE" },
      ],
      BLOCK_TYPE_DROPDOWN: [
        { label: "Normal", style: "unstyled" },
        { label: "Heading Large", style: "header-one" },
        { label: "Heading Medium", style: "header-two" },
        { label: "Heading Small", style: "header-three" },
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
