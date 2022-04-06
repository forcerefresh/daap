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

  const onFileNameChange = (fileName: string) => {
    const newValue = cloneDeep(value);
    newValue.fileName = fileName;
    onChange(newValue);
  };

  const fileName =
    value.fileName === undefined ? extractFileName(value.url) : value.fileName;
  return (
    <>
      <FormGroup label={displayName} labelFor="text-input" inline>
        {value.url ? (
          <div
            className={css.previewHolder}
            style={{ backgroundImage: `url(${value.url}` }}
          ></div>
        ) : null}
        {value.url.indexOf("data:") === -1 ? (
          <div
            className="bp3-text-small"
            style={{ maxWidth: "250px", wordBreak: "break-all" }}
          >
            <a target="_blank" href={value.url}>
              {value.url}
            </a>
          </div>
        ) : null}

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
                newValue.fileName = extractFileName(newValue.url);
                onChange(newValue);
                setLibraryOpen(false);
              }}
              panelsToShow={[Panels.MyImages, Panels.Images]}
            />
          </div>
        </Popover>
      </FormGroup>
      <FormGroup label={"File name"} labelFor="fileName" inline>
        <InputGroup
          id="fileName"
          placeholder=""
          value={fileName}
          onChange={(event: any) => onFileNameChange(event.target.value)}
          onInput={(event: any) => onFileNameChange(event.target.value)}
          //onChange={(event: any) => onChange(event.target.value)}
          //onInput={(event: any) => onInput(event.target.value)}
        />
      </FormGroup>
    </>
  );
};

function extractFileName(url: string) {
  try {
    const parts = url.split("/");
    return parts[parts.length - 1].split(".")[0];
  } catch (ex: any) {
    return "";
  }
  return "";
}
