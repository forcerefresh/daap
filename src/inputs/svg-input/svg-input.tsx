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
import { ISVGInput, IUpdateInput } from "../types";
import css from "./svg-input.module.scss";

export const SVGInputForm: React.FC<ISVGInput & IUpdateInput> = (props) => {
  const { displayName, value, onInput = noop } = props;

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
      <div
        className={css.svgHolder}
        dangerouslySetInnerHTML={{ __html: value }}
      ></div>

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
