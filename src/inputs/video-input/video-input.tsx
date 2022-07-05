import {
  Button,
  FormGroup,
  InputGroup,
  Popover,
  PopoverInteractionKind,
  Position,
} from "@blueprintjs/core";
import { cloneDeep, noop } from "lodash-es";
import React, { useRef, useState } from "react";
import MediaLibraryPanel, {
  Panels,
} from "../../panels/media-library/MediaLibraryPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import {
  IUpdateInput,
  IVideoInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import css from "./video-input.module.scss";

export const VideoInputForm: React.FC<IVideoInput & IUpdateInput> = (props) => {
  const { displayName, value, onChange = noop } = props;

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
    <FormGroup label={displayName} labelFor="text-input" inline>
      <InputGroup
        readOnly={true}
        id="text-input"
        placeholder=""
        value={value.filename || value.url}
      />
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        position={Position.LEFT}
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
              /* const newValue = cloneDeep(value);
              newValue.url = (item.initialValues as any).url;
              onChange(newValue);*/

              onChange(item.initialValues as any);
              setLibraryOpen(false);
            }}
            panelsToShow={[Panels.MyVideos]}
          />
        </div>
      </Popover>
    </FormGroup>
  );
};
