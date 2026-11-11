import { Classes, FormGroup, MenuItem } from "@blueprintjs/core";
import React from "react";
import { getUnderFieldText } from "../input-utils";
import { ITagsInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";
import { createInputLabel } from "../input-helpers";
import { ItemRenderer, MultiSelect } from "@blueprintjs/select";

export const TagsInputForm: React.FC<ITagsInput & IUpdateInput> = (props) => {
  const {
    displayName,
    value,
    onChange,
    helperText,
    propertyName,
  } = props;

  const underFieldText = getUnderFieldText(helperText);

  const renderTag: ItemRenderer<string> = (tag, props) => {
    if (!props.modifiers.matchesPredicate) {
      return null;
    }

    return (
      <MenuItem
        roleStructure="listoption"
        shouldDismissPopover={false}
        text={`${tag}`}
      />
    );
  };

  function printReadableList(query: string): string {
    return query
      .split(", ")
      .map((title, index, titles) => {
        const separator =
          index > 0 ? (index === titles.length - 1 ? " and " : ", ") : "";
        return `${separator}"${title}"`;
      })
      .join("");
  }

  const renderCreateFilmsMenuItem = (
    query: string,
    active: boolean,
    handleClick: React.MouseEventHandler<HTMLElement>
  ) => (
    <MenuItem
      icon="add"
      text={`Create ${printReadableList(query)}`}
      roleStructure="listoption"
      active={active}
      onClick={handleClick}
      shouldDismissPopover={false}
    />
  );

  return (
    <FormGroup
      label={createInputLabel(displayName, propertyName)}
      labelFor="tags-input"
      inline
      helperText={underFieldText}
    >
      <MultiSelect<string>
        placeholder="Add tags..."
        resetOnSelect={true}
        openOnKeyDown={true}
        selectedItems={value}
        tagRenderer={(item) => item}
        items={[]}
        itemRenderer={renderTag}
        onItemSelect={(newTag, _e) => {
          onChange([...value, ...[newTag]]);
        }}
        createNewItemFromQuery={createTags}
        createNewItemRenderer={renderCreateFilmsMenuItem}
        popoverProps={{
          portalClassName: "multiselect-tags",
          captureDismiss: true,
          className: Classes.POPOVER_DISMISS,
        }}
        tagInputProps={{
          onRemove: (_, idx) => {
            const newValue = [...value];
            newValue?.splice(idx, 1);
            onChange(newValue);
          },
        }}
      />
    </FormGroup>
  );
};

export function createTags(query: string): string[] {
  return query.split(", ");
}
