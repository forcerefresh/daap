import {
  Button,
  FormGroup,
  Popover,
  PopoverInteractionKind,
  Position,
} from "@blueprintjs/core";
import { noop } from "lodash-es";
import React, { useRef, useState } from "react";
import MediaLibraryPanel, {
  Panels,
} from "../../panels/media-library/MediaLibraryPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { ISVGInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";
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
    "bp5-overlay-scroll-container", // alert
  ]);

  return (
    <FormGroup label={displayName} labelFor="textarea-input">
      <div
        className={css.svgHolder}
        dangerouslySetInnerHTML={{ __html: value.source }}
      ></div>

      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        position={Position.LEFT}
        modifiers={{ preventOverflow: { enabled: true } }}
        boundary={"window" as any}
        usePortal={true}
        minimal
        popoverClassName={css.mediaLibraryPanelPopup}
        isOpen={libraryOpen}
        content={
          <div ref={sharedRef}>
            <MediaLibraryPanel
              onRequestClose={() => {
                setLibraryOpen(false);
              }}
              className={css.mediaLibraryPanel}
              addObject={false}
              onSelect={(item) => {
                onInput({
                  source: ((item as any).initialValues as any)?.svg,
                  colors: undefined,
                  colorsType: "unique",
                  disableCustomColors: false,
                });
                setLibraryOpen(false);
              }}
              panelsToShow={[Panels.MyVectors, Panels.Vectors]}
            />
          </div>
        }
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
      </Popover>
    </FormGroup>
  );
};

