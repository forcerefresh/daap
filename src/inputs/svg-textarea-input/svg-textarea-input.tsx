import {
  Button,
  FormGroup,
  InputGroup,
  Intent,
  Popover,
  PopoverInteractionKind,
  PopoverPosition,
  Position,
  TextArea,
} from "@blueprintjs/core";
import { cloneDeep, debounce, noop, throttle } from "lodash-es";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MediaLibraryPanel, {
  Panels,
} from "../../panels/media-library/MediaLibraryPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { ITextAreaInput, IUpdateInput } from "../types";
import css from "./svg-textarea-input.module.scss";

export const SVGTextAreaInputForm: React.FC<ITextAreaInput & IUpdateInput> = (
  props
) => {
  const { displayName, value, onInput = noop, inputProps = {} } = props;
  const { rows = 3 } = inputProps;

  const throttledOnChange = useCallback(
    debounce((value: any) => onInput(value), 500),
    [onInput]
  );

  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (localValue !== value) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = (value: any) => {
    if (inputProps.disableDebounce) {
      onInput(value);
    } else {
      throttledOnChange(value);
    }
  };

  const [libraryOpen, setLibraryOpen] = useState(false);

  // logic for handling click outside
  const sharedRef = useRef(null);
  const handleClickOutside = () => {
    setLibraryOpen(false);
  };
  useOnClickOutside(sharedRef, handleClickOutside, [
    "image-preview-popover",
    "color-picker-holder",
    "bp3-overlay-scroll-container", // alert
  ]);

  return (
    <FormGroup label={displayName} labelFor="textarea-input">
      <TextArea
        id="textarea-input"
        growVertically={true}
        rows={rows}
        fill
        value={localValue}
        onChange={(event: any) => {
          setLocalValue(event.target.value);
          handleChange(event.target.value);
        }}
        onInput={(event: any) => {
          setLocalValue(event.target.value);
          handleChange(event.target.value);
        }}
      />

      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        position={Position.RIGHT}
        modifiers={{ preventOverflow: { enabled: true } }}
        boundary={"window"}
        usePortal={true}
        minimal
        popoverClassName={css.mediaLibraryPanelPopup}
        isOpen={libraryOpen}
      >
        <Button
          small
          minimal
          className={css.browseButton}
          icon={"folder-open"}
          onClick={() => {
            setLibraryOpen(true);
          }}
        >
          Browse
        </Button>
        <div ref={sharedRef}>
          <MediaLibraryPanel
            onRequestClose={() => {
              setLibraryOpen(false);
            }}
            className={css.mediaLibraryPanel}
            addObject={false}
            onSelect={(item) => {
              onInput((item.initialValues as any).svg);
              setLibraryOpen(false);
            }}
            panelsToShow={[Panels.MyVectors, Panels.Vectors]}
          />
        </div>
      </Popover>
    </FormGroup>
  );
};
