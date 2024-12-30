import {
  Classes,
  FormGroup,
  HTMLSelect,
  Intent,
  MenuItem,
} from "@blueprintjs/core";
import React, { ChangeEvent } from "react";
import { getGlobals } from "../../globals";
import { getUnderFieldText } from "../input-utils";
import {
  ISelectInput,
  ITagsInput,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { createInputLabel } from "../input-helpers";
import { ItemRenderer, MultiSelect } from "@blueprintjs/select";
import { values } from "lodash-es";

export const TagsInputForm: React.FC<ITagsInput & IUpdateInput> = (props) => {
  const {
    displayName,
    value,
    onChange,
    helperText,
    inputProps = {},
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
        onItemSelect={(newTag, e) => {
          console.log(value, newTag);
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
          // onRemove: (index: number)=>{
          //   handleTagRemove,
          // }
        }}

        // createNewItemFromQuery={allowCreate ? createFilms : undefined}
        // createNewItemRenderer={allowCreate ? renderCreateFilmsMenuItem : null}
        // initialContent={initialContent}
        // itemPredicate={filterFilm}
        // itemRenderer={this.renderFilm}
        // items={this.state.items}
        // itemsEqual={areFilmsEqual}
        // menuProps={{ "aria-label": "films" }}
        // noResults={
        //   <MenuItem
        //     disabled={true}
        //     text="No results."
        //     roleStructure="listoption"
        //   />
        // }
        // onClear={this.state.showClearButton ? this.handleClear : undefined}
        // onItemSelect={this.handleFilmSelect}
        // onItemsPaste={this.handleFilmsPaste}
        // popoverProps={{ matchTargetWidth, minimal: popoverMinimal }}
        // popoverRef={this.popoverRef}
        // tagRenderer={this.renderTag}
        // tagInputProps={{
        //   onRemove: this.handleTagRemove,
        //   tagProps: getTagProps,
        // }}
        // selectedItems={this.state.films}
        // customTarget={
        //   this.state.customTarget ? this.renderCustomTarget : undefined
        // }
      />

      {/* <HTMLSelect
        id="tags-input"
        options={
          customReadonlySelectedLabel
            ? [
                {
                  label: customReadonlySelectedLabel,
                  value: customReadonlySelectedLabel,
                },
              ]
            : options
        }
        value={customReadonlySelectedLabel ?? value}
        onChange={(event: ChangeEvent) =>
          !customReadonlySelectedLabel &&
          onChange((event.currentTarget as HTMLSelectElement).value)
        }
        {...inputProps}
      /> */}
    </FormGroup>
  );
};

export function createTags(query: string): string[] {
  const titles = query.split(", ");
  return titles.map((title, index) => title);
}
