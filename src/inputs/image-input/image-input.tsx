import {
  Button,
  FormGroup,
  InputGroup,
  Popover,
  PopoverInteractionKind,
  Position,
} from "@blueprintjs/core";
import { cloneDeep, noop } from "lodash-es";
import React, { useContext, useRef, useState } from "react";
import { IntegrationContext } from "../../integration";
import MediaLibraryPanel, {
  Panels,
} from "../../panels/media-library/MediaLibraryPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { IImageInput, IUpdateInput } from "../types";
import css from "./image-input.module.scss";

export const ImageInputForm: React.FC<IImageInput & IUpdateInput> = (props) => {
  const { displayName, value, onChange = noop, onInput = noop } = props;

  /*const globalContext = useContext(IntegrationContext);

  const { requestMedia } = globalContext.useMediaHook();

  const handleClick = () => {
    requestMedia("image").then((mediaObject: { url: string }) => {
      //const image = new Image();
      //image.onload = function () {
      //  console.log(image.width);
      console.log(mediaObject);
      onChange(mediaObject);
      //};
      //image.src = mediaObject.url;
    });
  };*/

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
        placeholder="Placeholder text"
        value={value.url}
        //onClick={handleClick}
        //onChange={(event: any) => onChange(event.target.value)}
        //onInput={(event: any) => onInput(event.target.value)}
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
              const newValue = cloneDeep(value);
              newValue.url = (item.initialValues as any).url;
              onChange(newValue);
              setLibraryOpen(false);
            }}
            panelsToShow={[Panels.MyImages, Panels.Images]}
          />
        </div>
      </Popover>
    </FormGroup>
  );
};
